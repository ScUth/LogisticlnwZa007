const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const ParcelScanEventSchema = new mongoose.Schema({
  parcel_id: { type: ObjectId, ref: "Parcel", required: true },
  hub_id: { type: ObjectId, ref: "Hub" },          // nullable
  courier_id: { type: ObjectId, ref: "Courier" },  // nullable

  event_type: {
    type: String,
    enum: [
      "picked_up",
      "arrived_hub",
      "departed_hub",
      "out_for_delivery",
      "delivered",
      "failed_delivery",
      "returned_to_sender"
    ],
    required: true
  },

  event_time: { type: Date, default: Date.now },
  notes: String
}, { timestamps: true });

ParcelScanEventSchema.index({ parcel_id: 1, event_time: 1 });

module.exports = mongoose.model("ParcelScanEvent", ParcelScanEventSchema);
