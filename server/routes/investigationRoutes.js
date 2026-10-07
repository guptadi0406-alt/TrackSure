import express from "express";

import {
  createInvestigation,
  getInvestigations,
  getInvestigationById,
  updateInvestigation,
  closeInvestigation
} from "../controllers/investigationController.js";

import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();


router.post(
  "/",
  authenticate,
  authorize("ADMIN", "MANAGER", "OPERATOR"),
  createInvestigation
);


router.get(
  "/",
  authenticate,
  authorize("ADMIN", "MANAGER", "OPERATOR"),
  getInvestigations
);

router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "MANAGER", "OPERATOR"),
  getInvestigationById
);

router.patch(
  "/:id",
  authenticate,
  authorize("ADMIN", "MANAGER", "OPERATOR"),
  updateInvestigation
);

router.patch(
  "/:id/close",
  authenticate,
  authorize("ADMIN", "MANAGER"),
  closeInvestigation
);

export default router;