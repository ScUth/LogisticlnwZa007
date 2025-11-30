const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const RecipientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  dropoff_location: { type: String },
  notes: { type: String },

  zone_id: { type: ObjectId, ref: "Zone" } // faculty / dorm zone
}, { timestamps: true });

module.exports = mongoose.model("Recipient", RecipientSchema);
