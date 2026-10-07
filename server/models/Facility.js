const mongoose = require("mongoose");

const facilitySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    name: {
      type: String,
      required: true
    },

    city: {
      type: String,
      required: true
    },

    state: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: [
        "HUB",
        "SORTING_CENTER",
        "DISTRIBUTION_CENTER",
        "WAREHOUSE",
        "DELIVERY_CENTER"
      ],
      required: true
    },

    latitude: {
      type: Number
    },

    longitude: {
      type: Number
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

module.exports = mongoose.model("Facility", facilitySchema);