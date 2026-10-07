import mongoose from "mongoose";

const investigationSchema = new mongoose.Schema(
  {
    parcelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parcel",
      required: true,
      index: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    status: {
      type: String,
      enum: [
        "OPEN",
        "INVESTIGATING",
        "RECOVERED",
        "NOT_FOUND",
        "CLOSED"
      ],
      default: "OPEN"
    },

    foundAtFacilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility"
    },

    reason: {
      type: String,
      enum: [
        "MIS_SORTED",
        "STUCK_IN_FACILITY",
        "MISSING_SCAN",
        "WRONG_ROUTE",
        "DAMAGED",
        "UNKNOWN"
      ]
    },

    notes: {
      type: String
    },

    startedAt: {
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

investigationSchema.index({
  parcelId: 1
});

investigationSchema.index({
  status: 1
});

export default mongoose.model(
  "Investigation",
  investigationSchema
);