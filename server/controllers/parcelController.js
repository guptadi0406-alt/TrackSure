import Parcel from "../models/Parcel.js";
import ParcelScan from "../models/ParcelScan.js";
import ParcelRisk from "../models/ParcelRisk.js";


export const getParcels = async (req, res) => {
  try {
    const {
      status,
      currentState,
      routeId,
      currentFacilityId
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (currentState) filter.currentState = currentState;
    if (routeId) filter.routeId = routeId;
    if (currentFacilityId) filter.currentFacilityId = currentFacilityId;

    const parcels = await Parcel.find(filter)
      .populate("routeId", "routeCode name originId destinationId")
      .populate(
        "currentFacilityId",
        "code name city state latitude longitude"
      )
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: parcels.length,
      data: parcels
    });

  } catch (error) {
    console.error("Get parcels error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch parcels",
      error: error.message
    });
  }
};



export const getParcel = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id)
      .populate(
        "routeId",
        "routeCode name originId destinationId stops"
      )
      .populate(
        "currentFacilityId",
        "code name city state latitude longitude"
      );

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found"
      });
    }

    res.json({
      success: true,
      data: parcel
    });

  } catch (error) {
    console.error("Get parcel error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch parcel",
      error: error.message
    });
  }
};



export const getParcelByTrackingNumber = async (req, res) => {
  try {
    const parcel = await Parcel.findOne({
      trackingNumber: req.params.trackingNumber
    })
      .populate(
        "routeId",
        "routeCode name originId destinationId stops"
      )
      .populate(
        "currentFacilityId",
        "code name city state latitude longitude"
      );

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found"
      });
    }

    res.json({
      success: true,
      data: parcel
    });

  } catch (error) {
    console.error("Get parcel by tracking number error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch parcel",
      error: error.message
    });
  }
};



export const getParcelScans = async (req, res) => {
  try {
    const scans = await ParcelScan.find({
      parcelId: req.params.id
    })
      .populate(
        "facilityId",
        "code name city state latitude longitude"
      )
      .sort({ timestamp: 1 });

    res.json({
      success: true,
      count: scans.length,
      data: scans
    });

  } catch (error) {
    console.error("Get parcel scans error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch parcel scans",
      error: error.message
    });
  }
};



export const getParcelRisk = async (req, res) => {
  try {
    const risk = await ParcelRisk.findOne({
      parcelId: req.params.id
    })
      .populate(
        "likelyFacilityId",
        "code name city state"
      )
      .sort({ calculatedAt: -1 });

    if (!risk) {
      return res.status(404).json({
        success: false,
        message: "Risk calculation not available"
      });
    }

    res.json({
      success: true,
      data: risk
    });

  } catch (error) {
    console.error("Get parcel risk error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch parcel risk",
      error: error.message
    });
  }
};


export const getParcelRiskHistory = async (req, res) => {
  try {
    const risks = await ParcelRisk.find({
      parcelId: req.params.id
    })
      .populate(
        "likelyFacilityId",
        "code name city state"
      )
      .sort({ calculatedAt: 1 });

    res.json({
      success: true,
      count: risks.length,
      data: risks
    });

  } catch (error) {
    console.error("Get parcel risk history error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch parcel risk history",
      error: error.message
    });
  }
};