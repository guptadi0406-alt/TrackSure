import express from "express";

import {
  getparcel,
  getParcel,
  getParcelScans,
  getParcelRisk
} from "../controllers/parcelController.js";

const router = express.Router();

router.get("/", getparcel);

router.get("/:id", getParcel);

router.get("/:id/scans", getParcelScans);

router.get("/:id/risk", getParcelRisk);

export default router;