import Alert from "../models/Alert.js";
import Parcel from "../models/Parcel.js";


const getAlerts = async (req, res) => {
  try {

    const {
      status,
      severity,
      type,
      parcelId
    } = req.query;


    const filter = {};


    if (status) {
      filter.status = status;
    }

    if (severity) {
      filter.severity = severity;
    }

    if (type) {
      filter.type = type;
    }

    if (parcelId) {
      filter.parcelId = parcelId;
    }


    const alerts = await Alert.find(filter)
      .populate(
        "parcelId",
        "trackingNumber status currentState currentFacilityId"
      )
      .sort({
        createdAt: -1
      });


    return res.status(200).json({
      success: true,
      count: alerts.length,
      alerts
    });

  } catch (error) {

    console.error("Get alerts error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch alerts",
      error: error.message
    });
  }
};


const getAlertById = async (req, res) => {
  try {

    const { id } = req.params;


    const alert = await Alert.findById(id)
      .populate(
        "parcelId",
        "trackingNumber status currentState currentFacilityId"
      );


    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found"
      });
    }


    return res.status(200).json({
      success: true,
      alert
    });

  } catch (error) {

    console.error("Get alert error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch alert",
      error: error.message
    });
  }
};



const updateAlert = async (req, res) => {
  try {

    const { id } = req.params;
    const { status } = req.body;


    const allowedStatuses = [
      "OPEN",
      "ACKNOWLEDGED",
      "INVESTIGATING",
      "RESOLVED",
      "DISMISSED"
    ];


    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required"
      });
    }


    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
      });
    }


    const alert = await Alert.findById(id);


    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found"
      });
    }


    alert.status = status;


    if (
      status === "RESOLVED" ||
      status === "DISMISSED"
    ) {
      alert.resolvedAt = new Date();
    } else {
      alert.resolvedAt = undefined;
    }


    await alert.save();


    return res.status(200).json({
      success: true,
      message: "Alert updated successfully",
      alert
    });

  } catch (error) {

    console.error("Update alert error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update alert",
      error: error.message
    });
  }
};


export {
  getAlerts,
  getAlertById,
  updateAlert
};