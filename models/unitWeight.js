const mongoose = require("mongoose");

const unitWeightSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Unit = mongoose.model("Unit", unitWeightSchema);
module.exports = Unit;
