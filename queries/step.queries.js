const stepTracking = require('../models/stepTracking');

let createStepTrack = (step) => {
    return new stepTracking({
        step: step
    }).save();
}

module.exports = {
    createStepTrack
}