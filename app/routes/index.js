"use strict";

import express from "express";
import {
  getFirstPage,
  checkQuestions,
} from "../controllers/questions.js";

const router = express.Router();

// route premiere page
router.get("/", getFirstPage);


// route  ping
router.post("/ping", checkQuestions);

export default router;
