import express from "express";

import {
  createInvestigation,
  getInvestigations,
  getInvestigationById,
  updateInvestigation,
  closeInvestigation
} from "../controllers/investigationController.js";

const router = express.Router();


router.post("/", createInvestigation);


router.get("/", getInvestigations);


router.get("/:id", getInvestigationById);


router.patch("/:id/close", closeInvestigation);


router.patch("/:id", updateInvestigation);

export default router;