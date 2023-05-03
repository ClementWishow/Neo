const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const stepTracking = Schema ({
  step: Number,
  page: String
});

stepTracking.set('timestamps', true);

const StepTracking = mongoose.model('stepTracking', stepTracking);

module.exports = StepTracking;