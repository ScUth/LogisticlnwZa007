const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const RouteSchema = new mongoose.Schema({
  courier_id: { type: ObjectId, ref: "Courier", required: true },
  hub_id: { type: ObjectId, ref: "Hub", required: true },

  route_date: { type: Date, required: true },

  status: {
    type: String,
    enum: ["planned", "out_for_delivery", "completed", "canceled"],
    default: "planned"
  },

  started_at: { type: Date },
  ended_at: { type: Date }
}, { timestamps: true });

// Prevent double route scheduling
RouteSchema.index({ courier_id: 1, route_date: 1 });

module.exports = mongoose.model("Route", RouteSchema);
