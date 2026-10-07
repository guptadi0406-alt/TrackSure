import Parcel from "../models/Parcel.js";
import ParcelScan from "../models/ParcelScan.js";
import Route from "../models/Route.js";
import Facility from "../models/Facility.js";

const detectRouteDeviation = async (parcelId) => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new Error("Parcel not found");
  }

  const route = await Route.findById(parcel.routeId);

  if (!route) {
    throw new Error("Route not found");
  }

  const scans = await ParcelScan.find({
    parcelId: parcel._id,
    eventType: "ARRIVED"
  }).sort({ timestamp: 1 });

  if (scans.length === 0) {
    return {
      detected: false,
      score: 0,
      reason: "No arrival scans available"
    };
  }

  
  const expectedRoute = route.stops
    .sort((a, b) => a.sequence - b.sequence)
    .map((stop) => stop.facilityId.toString());

  
  const actualRoute = [];

  for (const scan of scans) {
    const facilityId = scan.facilityId.toString();

    if (
      actualRoute.length === 0 ||
      actualRoute[actualRoute.length - 1] !== facilityId
    ) {
      actualRoute.push(facilityId);
    }
  }

  let deviation = null;


  let expectedIndex = 0;

  for (const actualFacilityId of actualRoute) {
    if (expectedIndex >= expectedRoute.length) {
      break;
    }

    const expectedFacilityId = expectedRoute[expectedIndex];

    if (actualFacilityId === expectedFacilityId) {
      expectedIndex++;
      continue;
    }

    const laterIndex = expectedRoute.indexOf(
      actualFacilityId,
      expectedIndex + 1
    );

    if (laterIndex !== -1) {
      deviation = {
        type: "SKIPPED_STOP",
        expectedFacilityId,
        actualFacilityId,
        expectedPosition: expectedIndex + 1,
        actualPosition: laterIndex + 1
      };

      break;
    }

    // Facility is not part of expected route
    deviation = {
      type: "UNEXPECTED_FACILITY",
      expectedFacilityId,
      actualFacilityId,
      expectedPosition: expectedIndex + 1
    };

    break;
  }

  if (!deviation) {
    return {
      detected: false,
      score: 0,
      expectedRoute,
      actualRoute,
      reason: "No route deviation detected"
    };
  }

  const facility = await Facility.findById(
    deviation.actualFacilityId
  );

  const expectedFacility = await Facility.findById(
    deviation.expectedFacilityId
  );

  return {
    detected: true,
    type: "ROUTE_DEVIATION",
    score: 15,
    details: {
      deviationType: deviation.type,

      expectedFacility: {
        id: deviation.expectedFacilityId,
        code: expectedFacility?.code || "UNKNOWN",
        name: expectedFacility?.name || "Unknown Facility"
      },

      actualFacility: {
        id: deviation.actualFacilityId,
        code: facility?.code || "UNKNOWN",
        name: facility?.name || "Unknown Facility"
      },

      expectedRoute,
      actualRoute
    },

    reason:
      deviation.type === "SKIPPED_STOP"
        ? `Parcel skipped expected facility ${expectedFacility?.code || "UNKNOWN"}`
        : `Parcel reached unexpected facility ${facility?.code || "UNKNOWN"}`
  };
};

export default detectRouteDeviation;