const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const ProofOfDeliverySchema = new mongoose.Schema({
  parcel_id: { type: ObjectId, ref: "Parcel", required: true },
  courier_id: { type: ObjectId, ref: "Courier" },

  recipient_name: { type: String, required: true },
  signed_at: { type: Date, default: Date.now },

  signature_url: String,
  photo_url: String,

  // Optional because campus is zone-based
  // but still useful for analytics
  latitude: Number,
  longitude: Number,

  notes: String
}, { timestamps: true });

ProofOfDeliverySchema.index({ parcel_id: 1 });
ProofOfDeliverySchema.index({ signed_at: 1 });

module.exports = mongoose.model("ProofOfDelivery", ProofOfDeliverySchema);
