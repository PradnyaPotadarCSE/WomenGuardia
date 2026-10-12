const mongoose = require("mongoose");

const guardianSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobile_number: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Guardian", guardianSchema);
