import express from "express";

import {
  getAlerts,
  getAlertById,
  updateAlert
} from "../controllers/alertController.js";


const router = express.Router();


router.get("/", getAlerts);

router.get("/:id", getAlertById);

router.patch("/:id", updateAlert);


export default router;