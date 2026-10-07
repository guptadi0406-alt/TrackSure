import express from "express";

import {
  getRoutes,
  getRoute,
  getRouteByCode,
  getRouteParcels,
  getRouteSummary
} from "../controllers/routeController.js";

import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.get(
  "/",
  authenticate,
  getRoutes
);



router.get(
  "/code/:routeCode",
  authenticate,
  getRouteByCode
);



router.get(
  "/:id/parcels",
  authenticate,
  getRouteParcels
);



router.get(
  "/:id/summary",
  authenticate,
  getRouteSummary
);



router.get(
  "/:id",
  authenticate,
  getRoute
);

export default router;