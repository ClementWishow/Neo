"use strict";

import express from "express";
import {
  getFirstPage,
  questionByPage,
  checkQuestions,
} from "../controllers/questions.js";

const router = express.Router();

// route premiere page
router.get("/", getFirstPage);

// route de la page
router.get("/:page", questionByPage);

// route  ping
router.post("/ping/:page", checkQuestions);

export default router;
