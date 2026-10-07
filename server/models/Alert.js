const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema(
  {
    parcelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parcel",
      required: true,
      index: true
    },

    type: {
      type: String,
      enum: [
        "EXCESSIVE_DELAY",
        "EXCESSIVE_DWELL",
        "MISSING_SCAN",
        "ROUTE_DEVIATION",
        "FACILITY_ANOMALY"
      ],
      required: true
    },

    severity: {
      type: String,
      enum: [
        "NORMAL",
        "WATCH",
        "MEDIUM",
        "HIGH",
        "CRITICAL"
      ],
      required: true
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: [
        "OPEN",
        "ACKNOWLEDGED",
        "INVESTIGATING",
        "RESOLVED",
        "DISMISSED"
      ],
      default: "OPEN"
    },

    createdAt: {
      type: Date,
      default: Date.now
    },

    resolvedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

alertSchema.index({
  status: 1,
  severity: 1
});

alertSchema.index({
  createdAt: -1
});

module.exports = mongoose.model("Alert", alertSchema);