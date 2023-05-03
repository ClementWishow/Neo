const stepTracking = require('../models/stepTracking');

let createStepTrack = (step) => {
    return new stepTracking({
        step: step
    }).save();
}

let clickOnFirstPage = (user) => {
    return new stepTracking({
        page: `user ${user} clicked on link`
    }).save();
}

module.exports = {
    createStepTrack,
    clickOnFirstPage
}