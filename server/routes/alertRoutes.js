import express from "express";

import {
  getAlerts,
  getAlertById,
  updateAlert
} from "../controllers/alertController.js";

import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();


router.get("/", authenticate, getAlerts);

router.get("/:id", authenticate, getAlertById);

router.patch("/:id", authenticate, authorize("ADMIN", "MANAGER"), updateAlert);


export default router;