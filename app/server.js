"use strict";

// ================================================================
// get all the tools we need
// ================================================================
import express from "express";
import cors from "cors";

import cookieParser from "cookie-parser";
import { password } from "./configuration/mongopass.js";
import routes from "./routes/index.js";

const app = express();

const port = process.env.PORT || 3000;

// ================================================================
// setup our express application
// ================================================================
app.use("/public", express.static(process.cwd() + "/public"));
app.set("view engine", "ejs");
app.use(express.json({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(cors({ origins: "*" }));

app.locals.baseURL = process.env.BASE_URL || "http://localhost:3000/";

// ================================================================
// setup routes
// ================================================================
app.use("/", routes);

// ================================================================
// start our server
// ================================================================
app.listen(port, function () {
  console.log("Server listening on port " + port + "...");
});
