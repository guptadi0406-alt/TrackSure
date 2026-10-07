import mongoose from "mongoose";
import dotenv from "dotenv";

import Parcel from "./models/Parcel.js";
import riskEngine from "./detection/riskEngine.js";

dotenv.config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const parcel = await Parcel.findOne();

    if (!parcel) {
      console.log("No parcel found");
      return;
    }

    console.log("\nTesting parcel:");
    console.log(parcel.trackingNumber);

    const result = await riskEngine(parcel._id);

    console.log("\nRISK ENGINE RESULT:");
    console.log(JSON.stringify(result, null, 2));

    await mongoose.disconnect();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

test();