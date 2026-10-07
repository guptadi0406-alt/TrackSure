import Parcel from "../models/Parcel.js";
import ParcelScan from "../models/ParcelScan.js";

import detectDelay from "./delayDetector.js";
import detectDwell from "./dwellDetector.js";
import detectMissingScan from "./missingScanDetector.js";
import detectRouteDeviation from "./routeDetector.js";
import detectFacilityAnomaly from "./facilityDetector.js";


const getSeverity = (score) => {
  if (score >= 85) return "CRITICAL";
  if (score >= 70) return "HIGH";
  if (score >= 50) return "MEDIUM";
  if (score >= 30) return "WATCH";

  return "NORMAL";
};


const calculateConfidence = ({
  delay,
  dwell,
  missingScan,
  route,
  facility
}) => {
  let confidence = 0;

  const detections = [
    delay,
    dwell,
    missingScan,
    route,
    facility
  ];

  const detectedCount = detections.filter(
    detection => detection.detected
  ).length;



  if (detectedCount === 0) {
    confidence = 95;
  } else if (detectedCount === 1) {
    confidence = 70;
  } else if (detectedCount === 2) {
    confidence = 82;
  } else if (detectedCount === 3) {
    confidence = 90;
  } else {
    confidence = 95;
  }

  return confidence;
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



  return {
    parcelId: parcel._id,

    trackingNumber: parcel.trackingNumber,

    score: totalScore,

    severity,

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

    detectors: {
      delay: delayResult,
      dwell: dwellResult,
      missingScan: missingScanResult,
      route: routeResult,
      facility: facilityResult
    },

    calculatedAt: new Date()
  };
};


export default riskEngine;