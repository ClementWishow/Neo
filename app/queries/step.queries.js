import stepTracking from "../models/stepTracking.js";

export const createStepTrack = (step) => {
  return new stepTracking({
    step,
  }).save();
};
