import express from "express";

import {
  createScan
} from "../controllers/scanController.js";


const router = express.Router();


router.post("/", createScan);


export default router;