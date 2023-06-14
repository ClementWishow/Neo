"use strict";

import express from "express";
import {
  getFirstPage,
  checkQuestions
} from "../controllers/questions.js";
import { getDashboard } from "../controllers/dashboard.js";

const router = express.Router();

// route premiere page
router.get("/", getFirstPage);

// route premiere page
router.get("/administrators", getDashboard);


// route  ping
router.post("/ping", checkQuestions);

export default router;
