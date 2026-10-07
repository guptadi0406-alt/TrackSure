import mongoose from "mongoose";
import dotenv from "dotenv";
import Facility from "../models/Facility.js";
import Route from "../models/Route.js";

dotenv.config();


const seedRoutes = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Trackshare";
    await mongoose.connect(mongoUri);

    console.log("MongoDB connected");

    const facilities = await Facility.find();

    const BLR = facilities.find((f) => f.code === "BLR");
    const HBL = facilities.find((f) => f.code === "HBL");
    const PUN = facilities.find((f) => f.code === "PUN");
    const MUM = facilities.find((f) => f.code === "MUM");

    if (!BLR || !HBL || !PUN || !MUM) {
      throw new Error(
        "Required facilities not found. Run seedFacilities.js first."
      );
    }


    await Route.deleteMany({});

    const route = await Route.create({
      routeCode: "BLR-HBL-PUN-MUM",

      name: "Bengaluru → Hubballi → Pune → Mumbai",

      originId: BLR._id,

      destinationId: MUM._id,

      stops: [
        {
          facilityId: BLR._id,
          sequence: 1,
          expectedDwellMinutes: 30,
          expectedTransitMinutes: 300
        },

        {
          facilityId: HBL._id,
          sequence: 2,
          expectedDwellMinutes: 45,
          expectedTransitMinutes: 600
        },

        {
          facilityId: PUN._id,
          sequence: 3,
          expectedDwellMinutes: 40,
          expectedTransitMinutes: 480
        },

        {
          facilityId: MUM._id,
          sequence: 4,
          expectedDwellMinutes: 30,
          expectedTransitMinutes: null
        }
      ]
    });

    console.log("Route created successfully:");
    console.log(route);

    process.exit(0);
  } catch (error) {
    console.error("Route seeding failed:", error);
    process.exit(1);
  }
};

seedRoutes();