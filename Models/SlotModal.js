const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  date: { type: Date, required: true },
  endDateTime: { type: Date, required: true },
  available: { type: Boolean, default: true },
  email: { type: String },
  name: { type: String },
  phoneNumber: { type: String },
  purpose: { type: String },
});

const Slot = mongoose.model("Slot", slotSchema);

module.exports = Slot;
