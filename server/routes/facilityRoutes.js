import express from "express";

import {
  getFacilities,
  getFacility,
  getFacilityByCode,
  getFacilityParcels,
  getFacilityScans,
  getFacilityAlerts
} from "../controllers/facilityController.js";

import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();



router.get(
  "/",
  authenticate,
  getFacilities
);



router.get(
  "/code/:code",
  authenticate,
  getFacilityByCode
);



router.get(
  "/:id/parcels",
  authenticate,
  getFacilityParcels
);



router.get(
  "/:id/scans",
  authenticate,
  getFacilityScans
);



router.get(
  "/:id/alerts",
  authenticate,
  getFacilityAlerts
);



router.get(
  "/:id",
  authenticate,
  getFacility
);

export default router;