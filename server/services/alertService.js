import Alert from "../models/Alert.js";


const ALERT_CONFIG = {
  EXCESSIVE_DELAY: {
    title: "Excessive parcel delay"
  },

  EXCESSIVE_DWELL: {
    title: "Excessive facility dwell"
  },

  MISSING_SCAN: {
    title: "Missing parcel scan"
  },

  ROUTE_DEVIATION: {
    title: "Route deviation detected"
  },

  FACILITY_ANOMALY: {
    title: "Facility anomaly detected"
  }
};


const createAlert = async ({
  parcelId,
  type,
  severity,
  message
}) => {

  const config = ALERT_CONFIG[type];

  if (!config) {
    throw new Error(`Unsupported alert type: ${type}`);
  }


  const existingAlert = await Alert.findOne({
    parcelId,
    type,
    status: {
      $in: [
        "OPEN",
        "ACKNOWLEDGED",
        "INVESTIGATING"
      ]
    }
  });


  if (existingAlert) {
    return {
      created: false,
      duplicate: true,
      alert: existingAlert
    };
  }


  const alert = await Alert.create({
    parcelId,
    type,
    severity,
    title: config.title,
    message,
    status: "OPEN"
  });


  return {
    created: true,
    duplicate: false,
    alert
  };
};


const createAlertsFromRisk = async ({
  parcelId,
  severity,
  detectors
}) => {

  const alerts = [];



  if (detectors.delay?.detected) {

    const result = await createAlert({
      parcelId,
      type: "EXCESSIVE_DELAY",
      severity,
      message: detectors.delay.reason
    });

    alerts.push(result);
  }


  

  if (detectors.dwell?.detected) {

    const result = await createAlert({
      parcelId,
      type: "EXCESSIVE_DWELL",
      severity,
      message: detectors.dwell.reason
    });

    alerts.push(result);
  }



  if (detectors.missingScan?.detected) {

    const result = await createAlert({
      parcelId,
      type: "MISSING_SCAN",
      severity,
      message: detectors.missingScan.reason
    });

    alerts.push(result);
  }


  if (detectors.route?.detected) {

    const result = await createAlert({
      parcelId,
      type: "ROUTE_DEVIATION",
      severity,
      message: detectors.route.reason
    });

    alerts.push(result);
  }


  if (detectors.facility?.detected) {

    const result = await createAlert({
      parcelId,
      type: "FACILITY_ANOMALY",
      severity,
      message: detectors.facility.reason
    });

    alerts.push(result);
  }


  return alerts;
};


export {
  createAlert,
  createAlertsFromRisk
};