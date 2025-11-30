const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const ParcelSchema = new mongoose.Schema({
  tracking_code: { type: String, unique: true, required: true },

  sender_id: { type: ObjectId, ref: "Sender", required: true },
  recipient_id: { type: ObjectId, ref: "Recipient", required: true },

  origin_hub_id: { type: ObjectId, ref: "Hub", required: true },
  dest_hub_id: { type: ObjectId, ref: "Hub", required: true },

  origin_zone_id: { type: ObjectId, ref: "Zone" },
  dest_zone_id: { type: ObjectId, ref: "Zone" },

  weight_grams: Number,
  declared_value: Number,

  status: {
    type: String,
    enum: [
      "created",
      "in_transit",
      "arrived_hub",
      "departed_hub",
      "out_for_delivery",
      "delivered",
      "failed_delivery",
      "returned_to_sender"
    ],
    default: "created"
  },

  created_at: { type: Date, default: Date.now },
  delivered_at: { type: Date },
  sla_due_at: { type: Date }
}, { timestamps: false });

// Useful SLA index
ParcelSchema.index({ status: 1, sla_due_at: 1 });

module.exports = mongoose.model("Parcel", ParcelSchema);
