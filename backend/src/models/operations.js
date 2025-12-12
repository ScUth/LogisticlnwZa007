import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

/*========== PICKUP REQUEST ==========*/
// user-provided info for each parcel to be picked up, courier will validate and create actual Parcel records.
// Price will be calculated and send to user after courier check
// Not finalized until courier confirms pickup and parcel details
const PickupRequestSchema = new mongoose.Schema(
  {
    requester: { type: ObjectId, ref: "Sender", required: true },
    pickup_location: {
      address_text: { type: String, required: true },
      sub_district: { type: String, required: true },
    },

    status: {
      type: String,
      enum: ["pending", "assigned", "in_progress", "picked_up", "canceled"],
      default: "pending",
    },

    assigned_courier: { type: ObjectId, ref: "Employee" }, // will be assigned when courier accepts
    items: [
      {
        recipient: {
          first_name: { type: String, required: true },
          last_name: { type: String, required: true },
          phone: { type: String, required: true },
          address_text: { type: String, required: true },
          sub_district: { type: String, required: true },
        },
        estimated_weight: { type: Number, required: true },
        size: {
          type: String,
          enum: ["small", "medium", "large"], // range, not exact measurements, just for choosing vehicle
          required: true,
        },
        status: {
          type: String,
          enum: ["draft", "confirmed", "parcel_created", "canceled"], 
          default: "draft",
        },
        parcel_id: { type: ObjectId, ref: "Parcel", default: null },
      },
    ],

  },
  { timestamps: { createdAt: "requested_at", updatedAt: "updated_at" } }
);

// index
PickupRequestSchema.index({ requester: 1, updated_at: -1 });
PickupRequestSchema.index({ assigned_courier: 1, status: 1, updated_at: -1 });
PickupRequestSchema.index({ status: 1, updated_at: -1 });

/*========== PARCEL ==========*/
const ParcelSchema = new mongoose.Schema(
  {
    tracking_code: { type: String, unique: true, required: true },

    sender: {
      first_name: { type: String, required: true },
      last_name: { type: String, required: true },
      phone: { type: String, required: true },
    },
    pickup_location: {
      address_text: { type: String, required: true },
      sub_district: { type: String, required: true },
    },
    recipient: {
      first_name: { type: String, required: true },
      last_name: { type: String, required: true },
      phone: { type: String, required: true },
      address_text: { type: String, required: true },
      sub_district: { type: String, required: true },
    },

    origin_hub_id: { type: ObjectId, ref: "Hub", required: true },
    dest_hub_id: { type: ObjectId, ref: "Hub", required: true },

    weight_grams: Number,
    declared_value: Number,

    status: {
      type: String,
      enum: [
        "picked_up",
        "at_origin_hub",
        "in_linehaul",
        "at_dest_hub",
        " out_for_delivery",
        "delivered",
        "failed_delivery",
        "returned_to_sender",
        "canceled",
      ],
      default: "picked_up",
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

/*========== VEHICLE ==========*/
const provinceList = [
  'กระบี่', 'กรุงเทพมหานคร', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร',
  'ขอนแก่น',
  'จันทบุรี',
  'ฉะเชิงเทรา',
  'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่',
  'ตรัง', 'ตราด', 'ตาก',
  'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน',
  'บึงกาฬ', 'บุรีรัมย์',
  'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี',
  'พระนครศรีอยุธยา', 'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่',
  'ภูเก็ต',
  'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน',
  'ยโสธร', 'ยะลา',
  'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี',
  'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย',
  'ศรีสะเกษ',
  'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์',
  'หนองคาย', 'หนองบัวลำภู',
  'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'
];

const VehicleSchema = new mongoose.Schema({
  plate_raw: { type: String, required: true, trim: true }, // what user typed / what you display

  plate_no: { type: String, required: true, trim: true },  // normalized plate number ONLY (no province)
  province: { type: String, enum: provinceList, required: true },
  vehicle_type: { type: String, enum: ["bike", "motorcycle", "van", "truck"], required: true },
  capacity_kg: { type: Number, required: true },

  assigned_courier: { type: ObjectId, ref: "Employee" },
}, { timestamps: true });

function normalizePlateNo(input) {
  "กข123"
  if (!input) return "";
  return input
    .toUpperCase()
    .replace(/[^ก-ฮA-Z0-9]/g, "") // remove spaces, dashes, etc.
    .trim();
}

VehicleSchema.pre("validate", function (next) {
  if (this.plate_raw) this.plate_raw = this.plate_raw.trim();
  if (this.province) this.province = this.province.trim();

  // If you want user to only type plate_raw, derive plate_no from it:
  const source = this.plate_no || this.plate_raw;
  this.plate_no = normalizePlateNo(source);

  if (!isValidPlateKey(this.plate_no)) {
    return next(new Error("Invalid license plate format"));
  }

  next();
});

VehicleSchema.index({ plate_no: 1, province: 1 }, { unique: true });
VehicleSchema.index({ assigned_courier: 1 });


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
