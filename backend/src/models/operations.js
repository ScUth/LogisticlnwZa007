import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

/*========== PARCEL ==========*/
const ParcelSchema = new mongoose.Schema(
  {
    tracking_code: { type: String, unique: true, required: true },

    sender_id: { type: ObjectId, ref: "Sender", required: true },
    recipient_id: { type: ObjectId, ref: "Recipient", required: true },

    origin_hub_id: { type: ObjectId, ref: "Hub", required: true },
    dest_hub_id: { type: ObjectId, ref: "Hub", required: true },

    pickup_location: { type: ObjectId, ref: "Location", required: true },
    dropoff_location: { type: ObjectId, ref: "Location", required: true },

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
        "returned_to_sender",
      ],
      default: "created",
    },

    created_at: { type: Date, default: Date.now },
    delivered_at: { type: Date },
    sla_due_at: { type: Date },
  },
  { timestamps: false }
);

// Useful SLA index
ParcelSchema.index({ status: 1, sla_due_at: 1 });

/*========== ROUTE ==========*/
const RouteSchema = new mongoose.Schema(
  {
    courier_id: { type: ObjectId, ref: "Employee", required: true },
    hub_id: { type: ObjectId, ref: "Hub", required: true },

    route_date: { type: Date, required: true },

    status: {
      type: String,
      enum: ["planned", "out_for_delivery", "completed", "canceled"],
      default: "planned",
    },

    started_at: { type: Date },
    ended_at: { type: Date },
  },
  { timestamps: true }
);

// Prevent double route scheduling
RouteSchema.index({ courier_id: 1, route_date: 1 });

/*========== PARCEL ROUTE ASSIGNMENT ==========*/
const ParcelRouteAssignmentSchema = new mongoose.Schema(
  {
    parcel_id: { type: ObjectId, ref: "Parcel", required: true },
    route_id: { type: ObjectId, ref: "Route", required: true },

    assigned_at: { type: Date, default: Date.now },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One active assignment per parcel
ParcelRouteAssignmentSchema.index(
  { parcel_id: 1, active: 1 },
  { unique: true }
);

// Avoid duplicate allocations
ParcelRouteAssignmentSchema.index({ route_id: 1, parcel_id: 1 });

/*========== PARCEL SCAN EVENT ==========*/
const ParcelScanEventSchema = new mongoose.Schema(
  {
    parcel_id: { type: ObjectId, ref: "Parcel", required: true },
    hub_id: { type: ObjectId, ref: "Hub" }, // nullable
    courier_id: { type: ObjectId, ref: "Employee" }, // nullable

    event_type: {
      type: String,
      enum: [
        "picked_up",
        "arrived_hub",
        "departed_hub",
        "out_for_delivery",
        "delivered",
        "failed_delivery",
        "returned_to_sender",
      ],
      required: true,
    },

    event_time: { type: Date, default: Date.now },
    notes: String,
  },
  { timestamps: true }
);

ParcelScanEventSchema.index({ parcel_id: 1, event_time: 1 });

/*========== PROOF OF DELIVERY ==========*/
const ProofOfDeliverySchema = new mongoose.Schema(
  {
    parcel_id: { type: ObjectId, ref: "Parcel", required: true },
    courier_id: { type: ObjectId, ref: "Employee" },

    recipient_name: { type: String, required: true },
    signed_at: { type: Date, default: Date.now },

    signature_url: String,
    photo_url: String,

    dropoff_location: { type: ObjectId, ref: "Location" },

    notes: String,
  },
  { timestamps: true }
);

ProofOfDeliverySchema.index({ parcel_id: 1 });
ProofOfDeliverySchema.index({ signed_at: 1 });

const Parcel = mongoose.model("Parcel", ParcelSchema);
const Route = mongoose.model("Route", RouteSchema);
const ParcelRouteAssignment = mongoose.model(
  "ParcelRouteAssignment",
  ParcelRouteAssignmentSchema
);
const ParcelScanEvent = mongoose.model(
  "ParcelScanEvent",
  ParcelScanEventSchema
);
const ProofOfDelivery = mongoose.model(
  "ProofOfDelivery",
  ProofOfDeliverySchema
);

export {
  Parcel,
  Route,
  ParcelRouteAssignment,
  ParcelScanEvent,
  ProofOfDelivery,
};
