import Investigation from "../models/Investigation.js";
import Parcel from "../models/Parcel.js";
import Facility from "../models/Facility.js";
import Alert from "../models/Alert.js";


const createInvestigation = async (req, res) => {
  try {
    const {
      parcelId,
      alertId,
      reason,
      notes
    } = req.body;

    if (!parcelId) {
      return res.status(400).json({
        success: false,
        message: "parcelId is required"
      });
    }

    const parcel = await Parcel.findById(parcelId);

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel not found"
      });
    }

    const allowedReasons = [
      "MIS_SORTED",
      "STUCK_IN_FACILITY",
      "MISSING_SCAN",
      "WRONG_ROUTE",
      "DAMAGED",
      "UNKNOWN"
    ];

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "reason is required"
      });
    }

    if (!allowedReasons.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: `Invalid reason. Allowed values: ${allowedReasons.join(", ")}`
      });
    }

    const existingInvestigation = await Investigation.findOne({
      parcelId,
      status: {
        $in: ["OPEN", "INVESTIGATING"]
      }
    });

    if (existingInvestigation) {
      return res.status(409).json({
        success: false,
        message: "An active investigation already exists for this parcel",
        investigation: existingInvestigation
      });
    }

    let alert = null;

    if (alertId) {
      alert = await Alert.findById(alertId);

      if (!alert) {
        return res.status(404).json({
          success: false,
          message: "Alert not found"
        });
      }

      if (alert.parcelId.toString() !== parcelId.toString()) {
        return res.status(400).json({
          success: false,
          message: "Alert does not belong to this parcel"
        });
      }
    }

    const investigation = await Investigation.create({
      parcelId,
      reason,
      notes: notes || "",
      status: "OPEN",
      startedAt: new Date()
    });


    if (alert) {
      alert.status = "INVESTIGATING";
      await alert.save();
    }

    if (parcel.status !== "DELIVERED") {
      parcel.status = "AT_RISK";
      await parcel.save();
    }

    const populatedInvestigation = await Investigation.findById(
      investigation._id
    )
      .populate(
        "parcelId",
        "trackingNumber status currentState currentFacilityId"
      )
      .populate(
        "foundAtFacilityId",
        "code name city state"
      );

    return res.status(201).json({
      success: true,
      message: "Investigation started successfully",
      investigation: populatedInvestigation
    });

  } catch (error) {
    console.error("Create investigation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to start investigation",
      error: error.message
    });
  }
};


const getInvestigations = async (req, res) => {
  try {
    const {
      status,
      reason,
      parcelId
    } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (reason) {
      filter.reason = reason;
    }

    if (parcelId) {
      filter.parcelId = parcelId;
    }

    const investigations = await Investigation.find(filter)
      .populate(
        "parcelId",
        "trackingNumber status currentState currentFacilityId"
      )
      .populate(
        "foundAtFacilityId",
        "code name city state"
      )
      .sort({
        startedAt: -1
      });

    return res.status(200).json({
      success: true,
      count: investigations.length,
      investigations
    });

  } catch (error) {
    console.error("Get investigations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch investigations",
      error: error.message
    });
  }
};



const getInvestigationById = async (req, res) => {
  try {
    const { id } = req.params;

    const investigation = await Investigation.findById(id)
      .populate(
        "parcelId",
        "trackingNumber status currentState currentFacilityId"
      )
      .populate(
        "foundAtFacilityId",
        "code name city state"
      );

    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: "Investigation not found"
      });
    }

    return res.status(200).json({
      success: true,
      investigation
    });

  } catch (error) {
    console.error("Get investigation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch investigation",
      error: error.message
    });
  }
};

const updateInvestigation = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      status,
      foundAtFacilityId,
      notes
    } = req.body;

    const investigation = await Investigation.findById(id);

    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: "Investigation not found"
      });
    }

    const allowedStatuses = [
      "OPEN",
      "INVESTIGATING",
      "RECOVERED",
      "NOT_FOUND",
      "CLOSED"
    ];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
      });
    }

    if (foundAtFacilityId) {
      const facility = await Facility.findById(foundAtFacilityId);

      if (!facility) {
        return res.status(404).json({
          success: false,
          message: "Found facility not found"
        });
      }

      investigation.foundAtFacilityId = facility._id;
    }

    if (notes !== undefined) {
      investigation.notes = notes;
    }

    if (status) {
      investigation.status = status;
    }


    if (status === "INVESTIGATING") {
      investigation.startedAt =
        investigation.startedAt || new Date();
    }


    const parcel = await Parcel.findById(
      investigation.parcelId
    );

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel associated with investigation not found"
      });
    }

  
    if (status === "RECOVERED") {
      parcel.status = "RECOVERED";

      if (foundAtFacilityId) {
        parcel.currentFacilityId = foundAtFacilityId;
      }

      await parcel.save();
    }

   
    if (status === "NOT_FOUND") {
      if (parcel.status !== "DELIVERED") {
        parcel.status = "AT_RISK";
        await parcel.save();
      }
    }


    if (
      status === "CLOSED" ||
      status === "RECOVERED" ||
      status === "NOT_FOUND"
    ) {
      investigation.resolvedAt =
        investigation.resolvedAt || new Date();
    }

    await investigation.save();

 
    const populatedInvestigation =
      await Investigation.findById(investigation._id)
        .populate(
          "parcelId",
          "trackingNumber status currentState currentFacilityId"
        )
        .populate(
          "foundAtFacilityId",
          "code name city state"
        );

    return res.status(200).json({
      success: true,
      message: "Investigation updated successfully",
      investigation: populatedInvestigation
    });

  } catch (error) {
    console.error("Update investigation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update investigation",
      error: error.message
    });
  }
};



const closeInvestigation = async (req, res) => {
  try {
    const { id } = req.params;

    const investigation = await Investigation.findById(id);

    if (!investigation) {
      return res.status(404).json({
        success: false,
        message: "Investigation not found"
      });
    }

    if (investigation.status === "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "Investigation is already closed"
      });
    }

    const parcel = await Parcel.findById(
      investigation.parcelId
    );

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: "Parcel associated with investigation not found"
      });
    }

    investigation.status = "CLOSED";
    investigation.resolvedAt = new Date();

    await investigation.save();


    const alertResult = await Alert.updateMany(
      {
        parcelId: investigation.parcelId,
        status: {
          $in: [
            "OPEN",
            "ACKNOWLEDGED",
            "INVESTIGATING"
          ]
        }
      },
      {
        $set: {
          status: "RESOLVED",
          resolvedAt: new Date()
        }
      }
    );

 
    if (investigation.status === "CLOSED") {
      if (parcel.status === "RECOVERED") {

      } else if (parcel.status !== "DELIVERED") {
        parcel.status = "IN_TRANSIT";
        await parcel.save();
      }
    }

    const populatedInvestigation =
      await Investigation.findById(investigation._id)
        .populate(
          "parcelId",
          "trackingNumber status currentState currentFacilityId"
        )
        .populate(
          "foundAtFacilityId",
          "code name city state"
        );

    return res.status(200).json({
      success: true,
      message: "Investigation closed and alerts resolved",
      investigation: populatedInvestigation,
      alertsResolved: alertResult.modifiedCount
    });

  } catch (error) {
    console.error("Close investigation error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to close investigation",
      error: error.message
    });
  }
};


export {
  createInvestigation,
  getInvestigations,
  getInvestigationById,
  updateInvestigation,
  closeInvestigation
};