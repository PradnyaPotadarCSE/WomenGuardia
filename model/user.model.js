const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  mobile_number: {
    type: Number,
    required: true,
    unique: true,
  },
  guardians: [{ type: mongoose.Schema.Types.ObjectId, ref: "Guardian" }],
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
