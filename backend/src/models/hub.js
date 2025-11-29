const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const HubSchema = new mongoose.Schema({
  hub_name: { type: String, required: true, trim: true },
  address_text: { type: String },
  region_code: { type: String, maxlength: 20 },

  // Hub belongs to a Zone (optional)
  zone_id: { type: ObjectId, ref: "Zone" },

  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Hub", HubSchema);
