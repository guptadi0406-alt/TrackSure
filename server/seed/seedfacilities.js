import mongoose from "mongoose"
import dotenv from "dotenv";
import Facility from "../models/Facility.js";

dotenv.config();


const facilities = [
  {
    code: "BLR",
    name: "Bengaluru Hub",
    city: "Bengaluru",
    state: "Karnataka",
    type: "HUB",
    latitude: 12.9716,
    longitude: 77.5946
  },

  {
    code: "HBL",
    name: "Hubballi Hub",
    city: "Hubballi",
    state: "Karnataka",
    type: "HUB",
    latitude: 15.3647,
    longitude: 75.1240
  },

  {
    code: "PUN",
    name: "Pune Sorting Center",
    city: "Pune",
    state: "Maharashtra",
    type: "SORTING_CENTER",
    latitude: 18.5204,
    longitude: 73.8567
  },

  {
    code: "MUM",
    name: "Mumbai Distribution Center",
    city: "Mumbai",
    state: "Maharashtra",
    type: "DISTRIBUTION_CENTER",
    latitude: 19.0760,
    longitude: 72.8777
  }
];

const seed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Trackshare";
    await mongoose.connect(mongoUri);

    await Facility.deleteMany();


    const result = await Facility.insertMany(facilities);

    console.log(`${result.length} facilities inserted`);

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();