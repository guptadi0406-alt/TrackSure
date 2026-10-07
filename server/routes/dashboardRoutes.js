import express from "express";

import {
  getDashboardOverview,
  getRiskDistribution,
  getRecentAlerts,
  getFacilityAnomalies,
  getRoutePerformance,
  getRiskTrend
} from "../controllers/dashboardController.js";

import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.get(
  "/overview",
  authenticate,
  getDashboardOverview
);



router.get(
  "/risk-distribution",
  authenticate,
  getRiskDistribution
);



router.get(
  "/recent-alerts",
  authenticate,
  getRecentAlerts
);


router.get(
  "/facility-anomalies",
  authenticate,
  getFacilityAnomalies
);



router.get(
  "/route-performance",
  authenticate,
  getRoutePerformance
);



router.get(
  "/risk-trend",
  authenticate,
  getRiskTrend
);

export default router;