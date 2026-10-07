import Parcel from "../models/Parcel.js";
import ParcelScan from "../models/ParcelScan.js";
import Facility from "../models/Facility.js";

import analyzeParcel from "../services/parcelAnalysisService.js";


const createScan = async (req, res) => {
  try {
    const {
      trackingNumber,
      facilityCode,
      eventType,
      timestamp,
      metadata
    } = req.body;


  

    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: "trackingNumber is required"
      });
    }

    if (!facilityCode) {
      return res.status(400).json({
        success: false,
        message: "facilityCode is required"
      });
    }

    if (!eventType) {
      return res.status(400).json({
        success: false,
        message: "eventType is required"
      });
    }



    const parcel = await Parcel.findOne({
      trackingNumber
    });

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found"
      });
    }




    const facility = await Facility.findOne({
      code: facilityCode.toUpperCase()
    });

    if (!facility) {
      return res.status(404).json({
        success: false,
        message: "Facility not found"
      });
    }



    const scanTimestamp = timestamp
      ? new Date(timestamp)
      : new Date();

    if (Number.isNaN(scanTimestamp.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid timestamp"
      });
    }


    

    const allowedEventTypes = [
      "CREATED",
      "ARRIVED",
      "SORTED",
      "LOADED",
      "DISPATCHED",
      "DEPARTED",
      "DELIVERED"
    ];

    if (!allowedEventTypes.includes(eventType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid eventType. Allowed values: ${allowedEventTypes.join(", ")}`
      });
    }


  

    const scan = await ParcelScan.create({
      parcelId: parcel._id,
      facilityId: facility._id,
      eventType,
      timestamp: scanTimestamp,
      metadata: metadata || {}
    });



    parcel.currentFacilityId = facility._id;


    switch (eventType) {

      case "CREATED":
        parcel.currentState = "CREATED";
        break;

      case "ARRIVED":
        parcel.currentState = "ARRIVED";
        break;

      case "SORTED":
        parcel.currentState = "SORTING";
        break;

      case "LOADED":
        parcel.currentState = "LOADED";
        break;

      case "DISPATCHED":
      case "DEPARTED":
        parcel.currentState = "DISPATCHED";
        break;

      case "DELIVERED":
        parcel.currentState = "DELIVERED";
        parcel.status = "DELIVERED";
        parcel.actualDeliveryTime = scanTimestamp;
        break;
    }


    await parcel.save();


    const risk = await analyzeParcel(parcel._id);



    return res.status(201).json({
      success: true,

      message: "Parcel scan recorded successfully",

      scan: {
        id: scan._id,
        trackingNumber: parcel.trackingNumber,
        facility: facility.code,
        eventType: scan.eventType,
        timestamp: scan.timestamp
      },

      risk
    });

  } catch (error) {

    console.error("Create scan error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create parcel scan",
      error: error.message
    });
  }
};


export {
  createScan
};