const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const ParcelRouteAssignmentSchema = new mongoose.Schema({
  parcel_id: { type: ObjectId, ref: "Parcel", required: true },
  route_id: { type: ObjectId, ref: "Route", required: true },

  assigned_at: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
}, { timestamps: true });

// One active assignment per parcel
ParcelRouteAssignmentSchema.index(
  { parcel_id: 1, active: 1 },
  { unique: true }
);

// Avoid duplicate allocations
ParcelRouteAssignmentSchema.index(
  { route_id: 1, parcel_id: 1 }
);

module.exports = mongoose.model("ParcelRouteAssignment", ParcelRouteAssignmentSchema);
