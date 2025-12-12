import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

/*========== SENDER ==========*/
const SenderSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone: { type: String, required : true, unique: true },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

/*========== DRIVER ==========*/
const DriverSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone: { type: String, required : true, unique: true },
    password: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

/*========== RECIPIENT ==========*/
const RecipientSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

/*========== COURIER ==========*/
const CourierSchema = new mongoose.Schema(
  {
    courier_name: { type: String, required: true },
    phone: { type: String },

    transport: {
      type: String,
      enum: ["motorcycle", "bike", "walk", "van", "cart", "other"],
      default: "motorcycle",
    },

    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Sender = mongoose.model("Sender", SenderSchema);
const Recipient = mongoose.model("Recipient", RecipientSchema);
const Courier = mongoose.model("Courier", CourierSchema);

export { Sender, Recipient, Courier };