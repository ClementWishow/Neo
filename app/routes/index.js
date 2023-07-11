"use strict";

import express from "express";
import {
  getFirstPage,
  checkQuestions
} from "../controllers/questions.js";
import { getCandidatsContacts, getDashboard } from "../controllers/dashboard.js";
import { deleteLocalTest } from "../controllers/test.manager.js";

const router = express.Router();

// route premiere page
router.get("/", getFirstPage);

// route admin page
router.get("/administrators", getDashboard);
router.get("/administrators/all", getCandidatsContacts);

//route de suppression du cas de test
//le bouton qui déclenche ce endpoint est dispo sur la page administrators
router.get("/deleteTest", deleteLocalTest)

// route  ping
router.post("/ping", checkQuestions);

export default router;
