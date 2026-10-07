import Parcel from "../models/Parcel.js";
import ParcelScan from "../models/ParcelScan.js";
import ParcelRisk from "../models/ParcelRisk.js";
import Route from "../models/Route.js";
import Facility from "../models/Facility.js";





export const getparcel = async (req, res) => {
    try {

        const parcel = await Parcel.find().populate("routeId").populate("currentFacilityId").sort({createdAt:-1})

        res.json({
            success: true,
            count: parcel.length,
            data: parcel
        });
    } catch (error) {
        res.status(500).json({sucess:false,message : error.message});
    }
}

export const getParcel = async (req, res) => {

  try {

    const parcel = await Parcel.findById(req.params.id)
      .populate("routeId")
      .populate("currentFacilityId");

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

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

export const getParcelScans = async (req, res) => {

  try {

    const scans = await ParcelScan.find({
      parcelId: req.params.id
    })
      .populate("facilityId")
      .sort({ timestamp: 1 });

    res.json({
      success: true,
      count: scans.length,
      data: scans
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


export const getParcelRisk = async (req, res) => {

  try {

    const risk = await ParcelRisk.findOne({
      parcelId: req.params.id
    })
      .populate("likelyFacilityId")
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

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};