const mongoose = require("mongoose");

const CourierSchema = new mongoose.Schema({
  courier_name: { type: String, required: true },
  phone: { type: String },

  transport: {
    type: String,
    enum: ["motorcycle", "bike", "walk", "van", "cart", "other"],
    default: "motorcycle"
  },

  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Courier", CourierSchema);
