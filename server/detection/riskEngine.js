import Parcel from "../models/Parcel.js";
import ParcelScan from "../models/ParcelScan.js";
import ParcelRisk from "../models/ParcelRisk.js";

import detectDelay from "./delayDetector.js";
import detectDwell from "./dwellDetector.js";
import detectMissingScan from "./missingScanDetector.js";
import detectRouteDeviation from "./routeDetector.js";
import detectFacilityAnomaly from "./facilityDetector.js";
import { createAlertsFromRisk } from "../services/alertService.js";

const getSeverity = (score) => {
  if (score >= 85) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 50) return "MEDIUM";
  if (score >= 30) return "WATCH";

  return "NORMAL";
};


const getParcelStatus = (severity) => {
  switch (severity) {
    case "CRITICAL":
      return "CRITICAL";

    case "HIGH":
    case "MEDIUM":
      return "AT_RISK";

    case "WATCH":
    case "NORMAL":
    default:
      return "IN_TRANSIT";
  }
};


const calculateConfidence = ({
  delay,
  dwell,
  missingScan,
  route,
  facility
}) => {

  const detections = [
    delay,
    dwell,
    missingScan,
    route,
    facility
  ];

  const detectedCount = detections.filter(
    detector => detector.detected
  ).length;

  if (detectedCount === 0) return 95;
  if (detectedCount === 1) return 70;
  if (detectedCount === 2) return 82;
  if (detectedCount === 3) return 90;

  return 95;
};


const getLikelyFacility = async (parcelId) => {

  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    return null;
  }

  if (parcel.currentFacilityId) {
    return parcel.currentFacilityId;
  }

  const latestScan = await ParcelScan.findOne({
    parcelId: parcel._id
  }).sort({ timestamp: -1 });

  if (latestScan) {
    return latestScan.facilityId;
  }

  return null;
};


const riskEngine = async (parcelId) => {

  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new Error("Parcel not found");
  }


  const [
    delayResult,
    dwellResult,
    missingScanResult,
    routeResult,
    facilityResult
  ] = await Promise.all([
    detectDelay(parcelId),
    detectDwell(parcelId),
    detectMissingScan(parcelId),
    detectRouteDeviation(parcelId),
    detectFacilityAnomaly(parcelId)
  ]);




  const delayScore = delayResult.score || 0;
  const dwellScore = dwellResult.score || 0;
  const missingScanScore = missingScanResult.score || 0;
  const routeScore = routeResult.score || 0;
  const facilityScore = facilityResult.score || 0;



  const totalScore = Math.min(
    100,
    delayScore +
    dwellScore +
    missingScanScore +
    routeScore +
    facilityScore
  );



  const severity = getSeverity(totalScore);




  const parcelStatus = getParcelStatus(severity);




  const likelyFacilityId = await getLikelyFacility(parcelId);



  const confidence = calculateConfidence({
    delay: delayResult,
    dwell: dwellResult,
    missingScan: missingScanResult,
    route: routeResult,
    facility: facilityResult
  });


 
  const reasons = [];

  if (delayResult.detected) {
    reasons.push(delayResult.reason);
  }

  if (dwellResult.detected) {
    reasons.push(dwellResult.reason);
  }

  if (missingScanResult.detected) {
    reasons.push(missingScanResult.reason);
  }

  if (routeResult.detected) {
    reasons.push(routeResult.reason);
  }

  if (facilityResult.detected) {
    reasons.push(facilityResult.reason);
  }

  if (reasons.length === 0) {
    reasons.push("No significant anomalies detected");
  }



  const parcelRisk = await ParcelRisk.create({
    parcelId: parcel._id,

    score: totalScore,

    severity,

    delayScore,

    dwellScore,

    missingScanScore,

    routeScore,

    facilityScore,

    likelyFacilityId,

    confidence,

    reasons,

    calculatedAt: new Date()
  });


  const alerts = await createAlertsFromRisk({
    parcelId: parcel._id,
    severity,
    detectors: {
            delay: delayResult,
            dwell: dwellResult,
            missingScan: missingScanResult,
            route: routeResult,
            facility: facilityResult
        }
    }); 


  parcel.status = parcelStatus;

  if (likelyFacilityId) {
    parcel.currentFacilityId = likelyFacilityId;
  }

  await parcel.save();




  return {
    parcelId: parcel._id,

    trackingNumber: parcel.trackingNumber,

    score: totalScore,

    severity,

    status: parcelStatus,

    components: {
      delayScore,
      dwellScore,
      missingScanScore,
      routeScore,
      facilityScore
    },

    likelyFacilityId,

    confidence,


    reasons,

    riskId: parcelRisk._id,
    alerts,

    detectors: {
      delay: delayResult,
      dwell: dwellResult,
      missingScan: missingScanResult,
      route: routeResult,
      facility: facilityResult
    },

    calculatedAt: parcelRisk.calculatedAt
  };
};


export default riskEngine;