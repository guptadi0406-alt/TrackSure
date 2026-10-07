import Parcel from "../models/Parcel.js";
import ParcelScan from "../models/ParcelScan.js";
import Route from "../models/Route.js";
import Facility from "../models/Facility.js";

const detectFacilityAnomaly = async (parcelId) => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new Error("Parcel not found");
  }

  const route = await Route.findById(parcel.routeId);

  if (!route) {
    throw new Error("Route not found");
  }

  const scans = await ParcelScan.find({
    parcelId: parcel._id
  }).sort({ timestamp: 1 });

  if (scans.length === 0) {
    return {
      detected: false,
      score: 0,
      reason: "No scans available"
    };
  }

  let maxScore = 0;
  let detectedFacility = null;

  for (const stop of route.stops) {
    const facilityId = stop.facilityId.toString();

    const facility = await Facility.findById(stop.facilityId);

    if (!facility) {
      continue;
    }

    const arrivalScan = scans.find(
      (scan) =>
        scan.facilityId.toString() === facilityId &&
        scan.eventType === "ARRIVED"
    );

    const departureScan = scans.find(
      (scan) =>
        scan.facilityId.toString() === facilityId &&
        (
          scan.eventType === "DISPATCHED" ||
          scan.eventType === "DEPARTED"
        )
    );

    if (!arrivalScan || !departureScan) {
      continue;
    }

    const actualDwellMinutes =
      (new Date(departureScan.timestamp) -
        new Date(arrivalScan.timestamp)) /
      (1000 * 60);

    const expectedDwellMinutes = stop.expectedDwellMinutes;

    if (!expectedDwellMinutes) {
      continue;
    }

    const ratio = actualDwellMinutes / expectedDwellMinutes;

    let score = 0;

    if (ratio >= 3) {
      score = 5;
    } else if (ratio >= 2) {
      score = 4;
    } else if (ratio >= 1.5) {
      score = 3;
    } else if (ratio >= 1.25) {
      score = 2;
    } else if (ratio > 1) {
      score = 1;
    }

    if (score > maxScore) {
      maxScore = score;

      detectedFacility = {
        facilityId: facility._id.toString(),
        facilityCode: facility.code,
        facilityName: facility.name,
        expectedDwellMinutes,
        actualDwellMinutes: Math.round(actualDwellMinutes),
        ratio: Number(ratio.toFixed(2))
      };
    }
  }

  if (!detectedFacility) {
    return {
      detected: false,
      score: 0,
      reason: "No facility anomaly detected"
    };
  }

  return {
    detected: true,
    type: "FACILITY_ANOMALY",
    score: maxScore,
    details: detectedFacility,
    reason: `${detectedFacility.facilityCode} is showing abnormal processing time`
  };
};

export default detectFacilityAnomaly;