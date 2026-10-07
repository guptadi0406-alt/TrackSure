import Parcel from "../models/Parcel.js";
import ParcelScan from "../models/ParcelScan.js";
import Route from "../models/Route.js";

const detectMissingScan = async (parcelId) => {
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
      detected: true,
      type: "MISSING_SCAN",
      score: 25,
      missingScans: ["ALL_SCANS"],
      reason: "No scans available for parcel"
    };
  }

  const missingScans = [];


  for (const stop of route.stops) {
    const facilityId = stop.facilityId.toString();

    const facilityScans = scans.filter(
      (scan) =>
        scan.facilityId.toString() === facilityId
    );


    const hasArrival = facilityScans.some(
      (scan) => scan.eventType === "ARRIVED"
    );

    if (!hasArrival) {
      missingScans.push({
        facilityId,
        eventType: "ARRIVED"
      });
    }


    const hasDeparture = facilityScans.some(
      (scan) =>
        scan.eventType === "DISPATCHED" ||
        scan.eventType === "DEPARTED"
    );

    
    const isLastStop =
      stop.sequence === route.stops.length;

    if (!isLastStop && !hasDeparture) {
      missingScans.push({
        facilityId,
        eventType: "DISPATCHED"
      });
    }
  }

  if (missingScans.length === 0) {
    return {
      detected: false,
      score: 0,
      missingScans: [],
      reason: "No missing scans detected"
    };
  }


  let score = 0;

  if (missingScans.length >= 3) {
    score = 25;
  } else if (missingScans.length === 2) {
    score = 20;
  } else {
    score = 15;
  }

  return {
    detected: true,
    type: "MISSING_SCAN",
    score,
    missingScans,
    reason: `${missingScans.length} expected scan(s) missing`
  };
};

export default detectMissingScan;