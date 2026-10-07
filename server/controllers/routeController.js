import Route from "../models/Route.js";
import Facility from "../models/Facility.js";
import Parcel from "../models/Parcel.js";


export const getRoutes = async (req, res) => {
  try {
    const { isActive, originId, destinationId } = req.query;

    const filter = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (originId) {
      filter.originId = originId;
    }

    if (destinationId) {
      filter.destinationId = destinationId;
    }

    const routes = await Route.find(filter)
      .populate(
        "originId",
        "code name city state latitude longitude"
      )
      .populate(
        "destinationId",
        "code name city state latitude longitude"
      )
      .populate(
        "stops.facilityId",
        "code name city state latitude longitude type"
      )
      .sort({ routeCode: 1 });

    res.json({
      success: true,
      count: routes.length,
      data: routes
    });

  } catch (error) {
    console.error("Get routes error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch routes",
      error: error.message
    });
  }
};



export const getRoute = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate(
        "originId",
        "code name city state latitude longitude"
      )
      .populate(
        "destinationId",
        "code name city state latitude longitude"
      )
      .populate(
        "stops.facilityId",
        "code name city state latitude longitude type"
      );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    res.json({
      success: true,
      data: route
    });

  } catch (error) {
    console.error("Get route error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch route",
      error: error.message
    });
  }
};



export const getRouteByCode = async (req, res) => {
  try {
    const route = await Route.findOne({
      routeCode: req.params.routeCode.toUpperCase()
    })
      .populate(
        "originId",
        "code name city state latitude longitude"
      )
      .populate(
        "destinationId",
        "code name city state latitude longitude"
      )
      .populate(
        "stops.facilityId",
        "code name city state latitude longitude type"
      );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    res.json({
      success: true,
      data: route
    });

  } catch (error) {
    console.error("Get route by code error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch route",
      error: error.message
    });
  }
};



export const getRouteParcels = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    const parcels = await Parcel.find({
      routeId: req.params.id
    })
      .populate(
        "currentFacilityId",
        "code name city state"
      )
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: parcels.length,
      data: parcels
    });

  } catch (error) {
    console.error("Get route parcels error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch route parcels",
      error: error.message
    });
  }
};



export const getRouteSummary = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id)
      .populate(
        "originId",
        "code name city state"
      )
      .populate(
        "destinationId",
        "code name city state"
      )
      .populate(
        "stops.facilityId",
        "code name city state"
      );

    if (!route) {
      return res.status(404).json({
        success: false,
        message: "Route not found"
      });
    }

    const parcels = await Parcel.find({
      routeId: req.params.id
    });

    const summary = {
      routeId: route._id,
      routeCode: route.routeCode,
      name: route.name,

      origin: route.originId,
      destination: route.destinationId,

      totalStops: route.stops.length,

      stops: route.stops,

      parcelCount: parcels.length,

      statusBreakdown: {
        IN_TRANSIT: parcels.filter(
          p => p.status === "IN_TRANSIT"
        ).length,

        DELIVERED: parcels.filter(
          p => p.status === "DELIVERED"
        ).length,

        DELAYED: parcels.filter(
          p => p.status === "DELAYED"
        ).length,

        AT_RISK: parcels.filter(
          p => p.status === "AT_RISK"
        ).length,

        CRITICAL: parcels.filter(
          p => p.status === "CRITICAL"
        ).length,

        LOST: parcels.filter(
          p => p.status === "LOST"
        ).length,

        RECOVERED: parcels.filter(
          p => p.status === "RECOVERED"
        ).length
      }
    };

    res.json({
      success: true,
      data: summary
    });

  } catch (error) {
    console.error("Get route summary error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to generate route summary",
      error: error.message
    });
  }
};