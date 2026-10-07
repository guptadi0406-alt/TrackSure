import express from "express";

import {
  getParcels,
  getParcel,
  getParcelByTrackingNumber,
  getParcelScans,
  getParcelRisk,
  getParcelRiskHistory
} from "../controllers/parcelController.js";

import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, getParcels);

router.get(
  "/tracking/:trackingNumber",
  authenticate,
  getParcelByTrackingNumber
);

router.get(
  "/:id/scans",
  authenticate,
  getParcelScans
);

router.get(
  "/:id/risk",
  authenticate,
  getParcelRisk
);

router.get(
  "/:id/risk-history",
  authenticate,
  getParcelRiskHistory
);

router.get(
  "/:id",
  authenticate,
  getParcel
);

export default router;