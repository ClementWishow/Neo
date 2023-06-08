import mongoose from "mongoose";
const Schema = mongoose.Schema;

const enigmeTracking = Schema({
  name: String,
  numberReussie: Number,
  numberFailed: Number
});

enigmeTracking.set("timestamps", true);

export default mongoose.model("enigmeTracking", enigmeTracking);
