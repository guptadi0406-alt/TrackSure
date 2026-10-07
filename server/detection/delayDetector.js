import Parcel from "../models/Parcel.js";
import ParcelScan from "../models/ParcelScan.js";
import Route from "../models/Route.js";

const detectDelay = async (parcelId) => {
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

  let maxDelayScore = 0;
  let detectedDelay = null;


  for (let i = 0; i < route.stops.length - 1; i++) {
    const currentStop = route.stops[i];
    const nextStop = route.stops[i + 1];

    const currentFacilityId =
      currentStop.facilityId.toString();

    const nextFacilityId =
      nextStop.facilityId.toString();

    const departureScan = scans.find(
      (scan) =>
        scan.facilityId.toString() === currentFacilityId &&
        (
          scan.eventType === "DISPATCHED" ||
          scan.eventType === "DEPARTED"
        )
    );

    const arrivalScan = scans.find(
      (scan) =>
        scan.facilityId.toString() === nextFacilityId &&
        scan.eventType === "ARRIVED"
    );


    if (!departureScan || !arrivalScan) {
      continue;
    }

    const actualMinutes =
      (new Date(arrivalScan.timestamp) -
        new Date(departureScan.timestamp)) /
      (1000 * 60);

    const expectedMinutes =
      currentStop.expectedTransitMinutes;

    if (!expectedMinutes) {
      continue;
    }

    const delayMinutes =
      actualMinutes - expectedMinutes;

    if (delayMinutes <= 0) {
      continue;
    }


    const delayRatio =
      actualMinutes / expectedMinutes;

    let score = 0;

    if (delayRatio >= 2) {
      score = 30;
    } else if (delayRatio >= 1.5) {
      score = 20;
    } else if (delayRatio >= 1.25) {
      score = 10;
    } else {
      score = 5;
    }

    if (score > maxDelayScore) {
      maxDelayScore = score;

      detectedDelay = {
        fromFacility: currentFacilityId,
        toFacility: nextFacilityId,
        expectedMinutes,
        actualMinutes: Math.round(actualMinutes),
        delayMinutes: Math.round(delayMinutes),
        delayRatio: Number(delayRatio.toFixed(2))
      };
    }
  }

  if (!detectedDelay) {
    return {
      detected: false,
      score: 0,
      reason: "No excessive delay detected"
    };
  }

  return {
    detected: true,
    type: "EXCESSIVE_DELAY",
    score: maxDelayScore,
    details: detectedDelay,
    reason:
      `Parcel experienced ${detectedDelay.delayMinutes} minutes of delay`
  };
};

export default detectDelay;