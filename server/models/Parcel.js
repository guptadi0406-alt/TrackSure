const mongoose = require("mongoose");

const parcelSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true
    },

    currentFacilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility"
    },

    status: {
      type: String,
      enum: [
        "IN_TRANSIT",
        "DELIVERED",
        "DELAYED",
        "AT_RISK",
        "CRITICAL",
        "LOST",
        "RECOVERED"
      ],
      default: "IN_TRANSIT"
    },

    currentState: {
      type: String,
      enum: [
        "CREATED",
        "ARRIVED",
        "SORTING",
        "LOADED",
        "DISPATCHED",
        "IN_TRANSIT",
        "DELIVERED"
      ],
      default: "CREATED"
    },

    expectedDeliveryTime: {
      type: Date
    },

    actualDeliveryTime: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

parcelSchema.index({
  status: 1,
  currentFacilityId: 1
});

module.exports = mongoose.model("Parcel", parcelSchema);