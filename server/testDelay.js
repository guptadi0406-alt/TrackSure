import mongoose from "mongoose";
import dotenv from "dotenv";
import detectDelay from "./detection/delayDetector.js";
import Parcel from "./models/Parcel.js";
import ParcelScan from "./models/ParcelScan.js";
import Route from "./models/Route.js";
import Facility from "./models/Facility.js";

dotenv.config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Trackshare");
    console.log("MongoDB connected\n");

    // Pick a real parcel from the DB
    const parcel = await Parcel.findOne();

    if (!parcel) {
      console.log("No parcel found in DB");
      process.exit(0);
    }

    console.log("Testing parcel:", parcel.trackingNumber);

    // Show its scans
    const scans = await ParcelScan.find({ parcelId: parcel._id })
      .populate("facilityId")
      .sort({ timestamp: 1 });

    console.log(`\nSCANS (${scans.length} total):`);
    scans.forEach((scan) => {
      console.log(
        " ",
        scan.eventType.padEnd(12),
        "→",
        scan.facilityId?.code ?? "unknown",
        "→",
        scan.timestamp.toISOString()
      );
    });

    // Run delay detection
    const result = await detectDelay(parcel._id);

    console.log("\nDETECTION RESULT:");
    console.log(JSON.stringify(result, null, 2));

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
};

test();
