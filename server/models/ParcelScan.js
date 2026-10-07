import mongoose from "mongoose";

const parcelScanSchema = new mongoose.Schema(
  {
    parcelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parcel",
      required: true,
      index: true
    },

    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
      index: true
    },

    eventType: {
      type: String,
      enum: [
        "CREATED",
        "ARRIVED",
        "SORTED",
        "LOADED",
        "DISPATCHED",
        "DEPARTED",
        "DELIVERED"
      ],
      required: true
    },

    timestamp: {
      type: Date,
      required: true,
      index: true
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

parcelScanSchema.index({
  parcelId: 1,
  timestamp: 1
});

parcelScanSchema.index({
  facilityId: 1,
  timestamp: 1
});

export default mongoose.model("ParcelScan", parcelScanSchema);