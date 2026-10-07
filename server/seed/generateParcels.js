import  mongoose from "mongoose";
import  dotenv from "dotenv";

dotenv.config();

import Parcel from "../models/Parcel.js";
import ParcelScan from "../models/ParcelScan.js";
import Route from "../models/Route.js";

const TOTAL_PARCELS = 1000;

const randomTrackingNumber = (index) => {
  return `TG${Date.now()}${String(index).padStart(4, "0")}`;
};

const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60 * 1000);
};

const generateParcels = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const route = await Route.findOne({
      routeCode: "BLR-HBL-PUN-MUM"
    });

    if (!route) {
      throw new Error(
        "Route not found. Run seedRoutes.js first."
      );
    }


    await ParcelScan.deleteMany({});
    await Parcel.deleteMany({});

    console.log("Old parcel data removed");

    const parcels = [];
    const scans = [];

    for (let i = 1; i <= TOTAL_PARCELS; i++) {

    

      let scenario = "NORMAL";

      const random = Math.random();

      if (random < 0.10) {
        scenario = "EXCESSIVE_DWELL";
      } else if (random < 0.17) {
        scenario = "MISSING_SCAN";
      } else if (random < 0.22) {
        scenario = "ROUTE_DEVIATION";
      } else if (random < 0.27) {
        scenario = "SEVERE_DELAY";
      }

      const trackingNumber = randomTrackingNumber(i);

      const startTime = new Date(
        Date.now() - Math.floor(Math.random() * 24) * 60 * 60 * 1000
      );

    
      const parcel = new Parcel({
        trackingNumber,

        routeId: route._id,

        currentFacilityId: route.stops[0].facilityId,

        status: "IN_TRANSIT",

        currentState: "CREATED",

        expectedDeliveryTime: addMinutes(
          startTime,
          30 + 300 + 45 + 600 + 40 + 480
        )
      });

      

      let currentTime = startTime;

     

      scans.push({
        parcelId: parcel._id,
        facilityId: route.stops[0].facilityId,
        eventType: "CREATED",
        timestamp: currentTime
      });

      currentTime = addMinutes(currentTime, 10);

      scans.push({
        parcelId: parcel._id,
        facilityId: route.stops[0].facilityId,
        eventType: "ARRIVED",
        timestamp: currentTime
      });

      currentTime = addMinutes(currentTime, 20);

      scans.push({
        parcelId: parcel._id,
        facilityId: route.stops[0].facilityId,
        eventType: "SORTED",
        timestamp: currentTime
      });

      currentTime = addMinutes(currentTime, 10);

      scans.push({
        parcelId: parcel._id,
        facilityId: route.stops[0].facilityId,
        eventType: "DISPATCHED",
        timestamp: currentTime
      });

      

      currentTime = addMinutes(currentTime, 300);

      scans.push({
        parcelId: parcel._id,
        facilityId: route.stops[1].facilityId,
        eventType: "ARRIVED",
        timestamp: currentTime
      });

      currentTime = addMinutes(currentTime, 20);

      scans.push({
        parcelId: parcel._id,
        facilityId: route.stops[1].facilityId,
        eventType: "SORTED",
        timestamp: currentTime
      });

    

      if (scenario === "EXCESSIVE_DWELL") {


        currentTime = addMinutes(currentTime, 300);

        scans.push({
          parcelId: parcel._id,
          facilityId: route.stops[1].facilityId,
          eventType: "DISPATCHED",
          timestamp: currentTime
        });

      } else if (scenario === "MISSING_SCAN") {

        
        currentTime = addMinutes(currentTime, 600);

      } else {

        currentTime = addMinutes(currentTime, 45);

        scans.push({
          parcelId: parcel._id,
          facilityId: route.stops[1].facilityId,
          eventType: "DISPATCHED",
          timestamp: currentTime
        });
      }


      if (scenario === "ROUTE_DEVIATION") {

        
        currentTime = addMinutes(currentTime, 300);

        scans.push({
          parcelId: parcel._id,

          // intentionally wrong facility
          facilityId: route.stops[0].facilityId,

          eventType: "ARRIVED",

          timestamp: currentTime,

          metadata: {
            anomaly: "ROUTE_DEVIATION"
          }
        });

      } else {

     

        currentTime = addMinutes(currentTime, 600);

        scans.push({
          parcelId: parcel._id,
          facilityId: route.stops[2].facilityId,
          eventType: "ARRIVED",
          timestamp: currentTime
        });

        currentTime = addMinutes(currentTime, 20);

        scans.push({
          parcelId: parcel._id,
          facilityId: route.stops[2].facilityId,
          eventType: "SORTED",
          timestamp: currentTime
        });

        currentTime = addMinutes(currentTime, 40);

        scans.push({
          parcelId: parcel._id,
          facilityId: route.stops[2].facilityId,
          eventType: "DISPATCHED",
          timestamp: currentTime
        });

       

        currentTime = addMinutes(currentTime, 480);

        scans.push({
          parcelId: parcel._id,
          facilityId: route.stops[3].facilityId,
          eventType: "ARRIVED",
          timestamp: currentTime
        });

        currentTime = addMinutes(currentTime, 30);

        scans.push({
          parcelId: parcel._id,
          facilityId: route.stops[3].facilityId,
          eventType: "DELIVERED",
          timestamp: currentTime
        });

        parcel.status = "DELIVERED";
        parcel.currentState = "DELIVERED";
        parcel.currentFacilityId = route.stops[3].facilityId;
        parcel.actualDeliveryTime = currentTime;
      }

      /*
       * Severe delay
       */

      if (scenario === "SEVERE_DELAY") {
        parcel.status = "DELAYED";
      }

      /*
       * Missing scan
       */

      if (scenario === "MISSING_SCAN") {
        parcel.status = "AT_RISK";
        parcel.currentState = "SORTING";
        parcel.currentFacilityId = route.stops[1].facilityId;
      }

      /*
       * Excessive dwell
       */

      if (scenario === "EXCESSIVE_DWELL") {
        parcel.status = "AT_RISK";
        parcel.currentState = "DISPATCHED";
        parcel.currentFacilityId = route.stops[1].facilityId;
      }

      /*
       * Route deviation
       */

      if (scenario === "ROUTE_DEVIATION") {
        parcel.status = "AT_RISK";
        parcel.currentState = "ARRIVED";
        parcel.currentFacilityId = route.stops[0].facilityId;
      }

      parcels.push(parcel);

      console.log(
        `${trackingNumber} → ${scenario}`
      );
    }

    /*
     * Insert everything in bulk
     */

    await Parcel.insertMany(parcels);

    await ParcelScan.insertMany(scans);


    console.log(`${parcels.length} parcels created`);
    console.log(`${scans.length} scans created`);
    

    process.exit(0);

  } catch (error) {
    console.error("Generation failed:", error);

    process.exit(1);
  }
};

generateParcels();