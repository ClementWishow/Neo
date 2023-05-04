import mongoose from "mongoose";
const Schema = mongoose.Schema;

const stepTracking = Schema({
  step: Number,
});

stepTracking.set("timestamps", true);

export default mongoose.model("stepTracking", stepTracking);
