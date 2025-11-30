const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const SenderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  pickup_location: { type: String },

  zone_id: { type: ObjectId, ref: "Zone" }, // where the sender is located

  type: {
    type: String,
    enum: ["student", "staff", "vendor", "other"],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Sender", SenderSchema);
