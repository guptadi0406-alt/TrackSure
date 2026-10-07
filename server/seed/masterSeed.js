import mongoose from "mongoose";
import dotenv from "dotenv";
import Facility from "../models/Facility.js";
import Route from "../models/Route.js";
import Parcel from "../models/Parcel.js";
import ParcelScan from "../models/ParcelScan.js";
import Alert from "../models/Alert.js";
import ParcelRisk from "../models/ParcelRisk.js";
import Investigation from "../models/Investigation.js";

dotenv.config();

const FACILITIES_DATA = [
  {
    code: "BLR",
    name: "Bengaluru Tech Logistics Hub",
    city: "Bengaluru",
    state: "Karnataka",
    type: "HUB",
    latitude: 12.9716,
    longitude: 77.5946
  },
  {
    code: "HBL",
    name: "Hubballi Regional Transit Facility",
    city: "Hubballi",
    state: "Karnataka",
    type: "SORTING_CENTER",
    latitude: 15.3647,
    longitude: 75.124
  },
  {
    code: "PUN",
    name: "Pune Industrial Logistics Park",
    city: "Pune",
    state: "Maharashtra",
    type: "SORTING_CENTER",
    latitude: 18.5204,
    longitude: 73.8567
  },
  {
    code: "MUM",
    name: "Mumbai Port Distribution Gateway",
    city: "Mumbai",
    state: "Maharashtra",
    type: "DISTRIBUTION_CENTER",
    latitude: 19.076,
    longitude: 72.8777
  },
  {
    code: "DEL",
    name: "Delhi-NCR Central Cargo Hub",
    city: "New Delhi",
    state: "Delhi",
    type: "HUB",
    latitude: 28.6139,
    longitude: 77.209
  },
  {
    code: "HYD",
    name: "Hyderabad Fulfillment Hub",
    city: "Hyderabad",
    state: "Telangana",
    type: "HUB",
    latitude: 17.385,
    longitude: 78.4867
  },
  {
    code: "MAA",
    name: "Chennai Coastal Freight Terminal",
    city: "Chennai",
    state: "Tamil Nadu",
    type: "SORTING_CENTER",
    latitude: 13.0827,
    longitude: 80.2707
  },
  {
    code: "AMD",
    name: "Ahmedabad Western Depot",
    city: "Ahmedabad",
    state: "Gujarat",
    type: "DISTRIBUTION_CENTER",
    latitude: 23.0225,
    longitude: 72.5714
  }
];

const addMinutes = (date, mins) => new Date(date.getTime() + mins * 60 * 1000);
const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const masterSeed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Trackshare";
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully!");

    // Clear existing data
    console.log("Clearing existing databases...");
    await Promise.all([
      Facility.deleteMany({}),
      Route.deleteMany({}),
      Parcel.deleteMany({}),
      ParcelScan.deleteMany({}),
      Alert.deleteMany({}),
      ParcelRisk.deleteMany({}),
      Investigation.deleteMany({})
    ]);

    // 1. Seed Facilities
    console.log("Seeding Facilities...");
    const createdFacilities = await Facility.insertMany(FACILITIES_DATA);
    const fMap = {};
    createdFacilities.forEach(f => { fMap[f.code] = f._id; });

    // 2. Seed Routes
    console.log("Seeding Routes...");
    const routesData = [
      {
        routeCode: "BLR-HBL-PUN-MUM",
        name: "Bengaluru → Hubballi → Pune → Mumbai Trunk",
        originId: fMap["BLR"],
        destinationId: fMap["MUM"],
        stops: [
          { facilityId: fMap["BLR"], sequence: 1, expectedDwellMinutes: 30, expectedTransitMinutes: 300 },
          { facilityId: fMap["HBL"], sequence: 2, expectedDwellMinutes: 45, expectedTransitMinutes: 600 },
          { facilityId: fMap["PUN"], sequence: 3, expectedDwellMinutes: 40, expectedTransitMinutes: 480 },
          { facilityId: fMap["MUM"], sequence: 4, expectedDwellMinutes: 30, expectedTransitMinutes: null }
        ]
      },
      {
        routeCode: "DEL-AMD-MUM",
        name: "Delhi → Ahmedabad → Mumbai West Express",
        originId: fMap["DEL"],
        destinationId: fMap["MUM"],
        stops: [
          { facilityId: fMap["DEL"], sequence: 1, expectedDwellMinutes: 40, expectedTransitMinutes: 540 },
          { facilityId: fMap["AMD"], sequence: 2, expectedDwellMinutes: 50, expectedTransitMinutes: 420 },
          { facilityId: fMap["MUM"], sequence: 3, expectedDwellMinutes: 30, expectedTransitMinutes: null }
        ]
      },
      {
        routeCode: "BLR-HYD-DEL",
        name: "Bengaluru → Hyderabad → Delhi North Corridor",
        originId: fMap["BLR"],
        destinationId: fMap["DEL"],
        stops: [
          { facilityId: fMap["BLR"], sequence: 1, expectedDwellMinutes: 30, expectedTransitMinutes: 360 },
          { facilityId: fMap["HYD"], sequence: 2, expectedDwellMinutes: 60, expectedTransitMinutes: 720 },
          { facilityId: fMap["DEL"], sequence: 3, expectedDwellMinutes: 40, expectedTransitMinutes: null }
        ]
      },
      {
        routeCode: "MAA-BLR-HYD",
        name: "Chennai → Bengaluru → Hyderabad Transit",
        originId: fMap["MAA"],
        destinationId: fMap["HYD"],
        stops: [
          { facilityId: fMap["MAA"], sequence: 1, expectedDwellMinutes: 35, expectedTransitMinutes: 300 },
          { facilityId: fMap["BLR"], sequence: 2, expectedDwellMinutes: 45, expectedTransitMinutes: 360 },
          { facilityId: fMap["HYD"], sequence: 3, expectedDwellMinutes: 30, expectedTransitMinutes: null }
        ]
      }
    ];

    const createdRoutes = await Route.insertMany(routesData);

    // 3. Seed Parcels & Scans
    console.log("Generating 2,000 Parcels across 30 days...");
    const parcelsToInsert = [];
    const scansToInsert = [];
    const alertsToInsert = [];
    const risksToInsert = [];
    const investigationsToInsert = [];

    const TOTAL_PARCELS = 2000;
    const now = Date.now();

    for (let i = 1; i <= TOTAL_PARCELS; i++) {
      const selectedRoute = randomChoice(createdRoutes);
      const stops = selectedRoute.stops;

      // Date spread: over past 30 days
      const daysAgo = Math.random() * 30;
      const startTime = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

      // Unique tracking number format
      const trackingNumber = `TRK-${String(i).padStart(6, "0")}`;

      // Scenario weighting
      const rand = Math.random();
      let scenario = "DELIVERED"; // 55% delivered
      if (rand < 0.15) scenario = "IN_TRANSIT";
      else if (rand < 0.25) scenario = "AT_RISK";
      else if (rand < 0.32) scenario = "DELAYED";
      else if (rand < 0.38) scenario = "CRITICAL";
      else if (rand < 0.42) scenario = "LOST";
      else if (rand < 0.45) scenario = "RECOVERED";

      let status = "IN_TRANSIT";
      let currentState = "CREATED";
      let currentFacilityId = stops[0].facilityId;
      let actualDeliveryTime = null;

      const totalExpectedTransit = stops.reduce(
        (sum, s) => sum + (s.expectedDwellMinutes || 0) + (s.expectedTransitMinutes || 0),
        0
      );
      const expectedDeliveryTime = addMinutes(startTime, totalExpectedTransit + 60);

      let currentTime = new Date(startTime);

      // Origin Scan
      const parcelObjId = new mongoose.Types.ObjectId();

      scansToInsert.push({
        parcelId: parcelObjId,
        facilityId: stops[0].facilityId,
        eventType: "CREATED",
        timestamp: currentTime
      });

      currentTime = addMinutes(currentTime, randomInt(10, 30));
      scansToInsert.push({
        parcelId: parcelObjId,
        facilityId: stops[0].facilityId,
        eventType: "ARRIVED",
        timestamp: currentTime
      });

      currentTime = addMinutes(currentTime, randomInt(15, 45));
      scansToInsert.push({
        parcelId: parcelObjId,
        facilityId: stops[0].facilityId,
        eventType: "SORTED",
        timestamp: currentTime
      });

      currentTime = addMinutes(currentTime, randomInt(10, 25));
      scansToInsert.push({
        parcelId: parcelObjId,
        facilityId: stops[0].facilityId,
        eventType: "DISPATCHED",
        timestamp: currentTime
      });

      // Intermediate stops based on scenario
      if (scenario === "DELIVERED" || scenario === "RECOVERED") {
        for (let sIdx = 1; sIdx < stops.length; sIdx++) {
          const stop = stops[sIdx];
          const prevStop = stops[sIdx - 1];
          currentTime = addMinutes(currentTime, prevStop.expectedTransitMinutes || 300);

          scansToInsert.push({
            parcelId: parcelObjId,
            facilityId: stop.facilityId,
            eventType: "ARRIVED",
            timestamp: currentTime
          });

          if (sIdx < stops.length - 1) {
            currentTime = addMinutes(currentTime, stop.expectedDwellMinutes || 40);
            scansToInsert.push({
              parcelId: parcelObjId,
              facilityId: stop.facilityId,
              eventType: "SORTED",
              timestamp: currentTime
            });
            currentTime = addMinutes(currentTime, 15);
            scansToInsert.push({
              parcelId: parcelObjId,
              facilityId: stop.facilityId,
              eventType: "DISPATCHED",
              timestamp: currentTime
            });
          } else {
            // Final Destination
            currentTime = addMinutes(currentTime, 25);
            scansToInsert.push({
              parcelId: parcelObjId,
              facilityId: stop.facilityId,
              eventType: "DELIVERED",
              timestamp: currentTime
            });
          }
        }

        status = scenario === "RECOVERED" ? "RECOVERED" : "DELIVERED";
        currentState = "DELIVERED";
        currentFacilityId = stops[stops.length - 1].facilityId;
        actualDeliveryTime = currentTime;
      } else if (scenario === "IN_TRANSIT") {
        status = "IN_TRANSIT";
        currentState = "IN_TRANSIT";
        currentFacilityId = stops[randomInt(0, stops.length - 1)].facilityId;
      } else if (scenario === "DELAYED") {
        status = "DELAYED";
        currentState = "SORTING";
        currentFacilityId = stops[randomInt(1, Math.max(1, stops.length - 1))].facilityId;
      } else if (scenario === "AT_RISK") {
        status = "AT_RISK";
        currentState = "ARRIVED";
        currentFacilityId = stops[randomInt(1, Math.max(1, stops.length - 1))].facilityId;
      } else if (scenario === "CRITICAL") {
        status = "CRITICAL";
        currentState = "SORTING";
        currentFacilityId = stops[randomInt(0, stops.length - 1)].facilityId;
      } else if (scenario === "LOST") {
        status = "LOST";
        currentState = "DISPATCHED";
        currentFacilityId = stops[0].facilityId;
      }

      parcelsToInsert.push({
        _id: parcelObjId,
        trackingNumber,
        routeId: selectedRoute._id,
        currentFacilityId,
        status,
        currentState,
        expectedDeliveryTime,
        actualDeliveryTime
      });

      // Alerts generation for problematic parcels
      if (["AT_RISK", "CRITICAL", "DELAYED", "LOST"].includes(status)) {
        const alertTypes = ["EXCESSIVE_DELAY", "EXCESSIVE_DWELL", "MISSING_SCAN", "ROUTE_DEVIATION", "FACILITY_ANOMALY"];
        const alertType = randomChoice(alertTypes);
        const severity = status === "CRITICAL" || status === "LOST" ? "CRITICAL" : status === "AT_RISK" ? "HIGH" : "MEDIUM";
        const alertStatus = randomChoice(["OPEN", "ACKNOWLEDGED", "INVESTIGATING"]);

        alertsToInsert.push({
          parcelId: parcelObjId,
          type: alertType,
          severity,
          title: `${alertType.replace(/_/g, " ")} detected for ${trackingNumber}`,
          message: `Parcel ${trackingNumber} encountered ${alertType.toLowerCase().replace(/_/g, " ")} at facility during transport corridor.`,
          status: alertStatus,
          createdAt: currentTime
        });

        // Investigations for critical / lost parcels
        if (status === "CRITICAL" || status === "LOST" || (status === "AT_RISK" && Math.random() < 0.4)) {
          investigationsToInsert.push({
            parcelId: parcelObjId,
            status: randomChoice(["OPEN", "INVESTIGATING", "RECOVERED", "NOT_FOUND"]),
            reason: randomChoice(["MIS_SORTED", "STUCK_IN_FACILITY", "MISSING_SCAN", "WRONG_ROUTE"]),
            notes: `Auto-created investigation for parcel ${trackingNumber}. Risk score exceeded threshold.`,
            startedAt: currentTime
          });
        }
      }
    }

    // 4. Generate Historical ParcelRisk Entries over the past 30 days for rich trend line graph
    console.log("Generating 30-day ParcelRisk history...");
    for (let d = 30; d >= 0; d--) {
      const calcDate = new Date(now - d * 24 * 60 * 60 * 1000);
      const recordsPerDay = randomInt(15, 30);

      for (let r = 0; r < recordsPerDay; r++) {
        const randomParcel = randomChoice(parcelsToInsert);
        const baseScore = randomChoice([randomInt(10, 35), randomInt(40, 65), randomInt(70, 95)]);
        const severity = baseScore < 30 ? "NORMAL" : baseScore < 50 ? "WATCH" : baseScore < 70 ? "MEDIUM" : baseScore < 85 ? "HIGH" : "CRITICAL";

        risksToInsert.push({
          parcelId: randomParcel._id,
          score: baseScore,
          severity,
          delayScore: randomInt(0, 30),
          dwellScore: randomInt(0, 30),
          missingScanScore: randomInt(0, 20),
          routeScore: randomInt(0, 20),
          calculatedAt: calcDate
        });
      }
    }

    // Bulk insertion
    console.log("Inserting data into MongoDB...");
    await Parcel.insertMany(parcelsToInsert);
    console.log(`✓ ${parcelsToInsert.length} Parcels created`);

    await ParcelScan.insertMany(scansToInsert);
    console.log(`✓ ${scansToInsert.length} Parcel Scans created`);

    await Alert.insertMany(alertsToInsert);
    console.log(`✓ ${alertsToInsert.length} Alerts created`);

    await ParcelRisk.insertMany(risksToInsert);
    console.log(`✓ ${risksToInsert.length} Historical Risk Score records created`);

    if (investigationsToInsert.length > 0) {
      await Investigation.insertMany(investigationsToInsert);
      console.log(`✓ ${investigationsToInsert.length} Active Investigations created`);
    }

    console.log("\n🎉 MASTER SEED COMPLETED SUCCESSFULLY!");
    process.exit(0);

  } catch (error) {
    console.error("Master seed failed:", error);
    process.exit(1);
  }
};

masterSeed();
