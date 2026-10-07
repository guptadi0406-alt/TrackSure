const mongoose = require("mongoose");

const routeStopSchema = new mongoose.Schema(
  {
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true
    },

    sequence: {
      type: Number,
      required: true
    },

    expectedDwellMinutes: {
      type: Number,
      default: 30
    },

    expectedTransitMinutes: {
      type: Number
    }
  },
  {
    _id: false
  }
);

const routeSchema = new mongoose.Schema(
  {
    routeCode: {
      type: String,
      required: true,
      unique: true
    },

    name: {
      type: String,
      required: true
    },

    originId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true
    },

    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true
    },

    stops: {
      type: [routeStopSchema],
      required: true
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Route", routeSchema);