import Facility from "../models/Facility.js";
import Parcel from "../models/Parcel.js";
import ParcelScan from "../models/ParcelScan.js";
import Alert from "../models/Alert.js";


export const getFacilities = async (req, res) => {
  try {
    const { type, isActive, city, state } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (city) filter.city = city;
    if (state) filter.state = state;

    const facilities = await Facility.find(filter)
      .sort({ code: 1 });

    res.json({
      success: true,
      count: facilities.length,
      data: facilities
    });

  } catch (error) {
    console.error("Get facilities error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch facilities",
      error: error.message
    });
  }
};



export const getFacility = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found"
      });
    }

    res.json({
      success: true,
      data: facility
    });

  } catch (error) {
    console.error("Get facility error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch facility",
      error: error.message
    });
  }
};

export const getFacilityByCode = async (req, res) => {
  try {
    const facility = await Facility.findOne({
      code: req.params.code.toUpperCase()
    });

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found"
      });
    }

    res.json({
      success: true,
      data: facility
    });

  } catch (error) {
    console.error("Get facility by code error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch facility",
      error: error.message
    });
  }
};



export const getFacilityParcels = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found"
      });
    }

    const parcels = await Parcel.find({
      currentFacilityId: req.params.id
    })
      .populate(
        "routeId",
        "routeCode name originId destinationId"
      )
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
    console.error("Get facility parcels error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch facility parcels",
      error: error.message
    });
  }
};



export const getFacilityScans = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found"
      });
    }

    const scans = await ParcelScan.find({
      facilityId: req.params.id
    })
      .populate(
        "parcelId",
        "trackingNumber status currentState"
      )
      .sort({ timestamp: -1 });

    res.json({
      success: true,
      count: scans.length,
      data: scans
    });

  } catch (error) {
    console.error("Get facility scans error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch facility scans",
      error: error.message
    });
  }
};



export const getFacilityAlerts = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found"
      });
    }

    const parcels = await Parcel.find({
      currentFacilityId: req.params.id
    }).select("_id");

    const parcelIds = parcels.map(parcel => parcel._id);

    const alerts = await Alert.find({
      parcelId: { $in: parcelIds }
    })
      .populate(
        "parcelId",
        "trackingNumber status currentState"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: alerts.length,
      data: alerts
    });

  } catch (error) {
    console.error("Get facility alerts error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch facility alerts",
      error: error.message
    });
  }
};