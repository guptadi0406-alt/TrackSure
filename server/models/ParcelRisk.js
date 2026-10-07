import mongoose from "mongoose";

const parcelRiskSchema = new mongoose.Schema(
  {
    parcelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parcel",
      required: true,
      index: true
    },

    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100
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

    delayScore: {
      type: Number,
      default: 0
    },

    dwellScore: {
      type: Number,
      default: 0
    },

    missingScanScore: {
      type: Number,
      default: 0
    },

    routeScore: {
      type: Number,
      default: 0
    },

    facilityScore: {
      type: Number,
      default: 0
    },

    likelyFacilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility"
    },

    confidence: {
      type: Number,
      min: 0,
      max: 100
    },

    reasons: [
      {
        type: String
      }
    ],

    calculatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

parcelRiskSchema.index({
  parcelId: 1,
  calculatedAt: -1
});

parcelRiskSchema.index({
  severity: 1,
  calculatedAt: -1
});

export default mongoose.model("ParcelRisk", parcelRiskSchema);