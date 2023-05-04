"use strict";

// ================================================================
// get all the tools we need
// ================================================================
import mongoose from "mongoose";
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

mongoose
  .connect(
    "mongodb+srv://tech-factory:" +
      password +
      "@cluster0.nrbfbgp.mongodb.net/test",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("connexion db OK !");
  })
  .catch((err) => {
    console.log(err);
  });

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
