const mongoose = require("mongoose");

const ZoneSchema = new mongoose.Schema({
  zone_code: { type: String, required: true, unique: true }, // "ENG-A", "SCI-3F", etc.
  zone_name: { type: String, required: true },
  description: { type: String },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Zone", ZoneSchema);
