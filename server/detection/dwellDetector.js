import Parcel from "../models/Parcel.js";
import ParcelScan from "../models/ParcelScan.js";
import Route from "../models/Route.js";

const detectDwell = async (parcelId) => {

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

  let maxDwellScore = 0;
  let detectedDwell = null;


  for (const stop of route.stops) {
    const facilityId = stop.facilityId.toString();

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

    const actualMinutes =
      (new Date(departureScan.timestamp) -
        new Date(arrivalScan.timestamp)) /
      (1000 * 60);

    const expectedMinutes = stop.expectedDwellMinutes;

    if (!expectedMinutes) {
      continue;
    }

    const excessMinutes = actualMinutes - expectedMinutes;


    if (excessMinutes <= 0) {
      continue;
    }

    const dwellRatio = actualMinutes / expectedMinutes;

    let score = 0;

    if (dwellRatio >= 2) {
      score = 25;
    } else if (dwellRatio >= 1.5) {
      score = 20;
    } else if (dwellRatio >= 1.25) {
      score = 10;
    } else {
      score = 5;
    }

  
    if (score > maxDwellScore) {
      maxDwellScore = score;

      detectedDwell = {
        facilityId,
        expectedMinutes,
        actualMinutes: Math.round(actualMinutes),
        excessMinutes: Math.round(excessMinutes),
        dwellRatio: Number(dwellRatio.toFixed(2))
      };
    }
  }


  if (!detectedDwell) {
    return {
      detected: false,
      score: 0,
      reason: "No excessive dwell detected"
    };
  }

  return {
    detected: true,
    type: "EXCESSIVE_DWELL",
    score: maxDwellScore,
    details: detectedDwell,
    reason: `Parcel experienced ${detectedDwell.excessMinutes} minutes of excessive dwell`
  };
};

export default detectDwell;