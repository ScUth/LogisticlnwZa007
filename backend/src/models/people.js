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

/*========== RECIPIENT ==========*/
const RecipientSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone: { type: String, required : true },
    address_text: { type: String, required: true },
    sub_district: { type: String, required: true },
    label: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    owner: { type: ObjectId, ref: "Sender", required: true },
  },
  { timestamps: true }
);

/*========== EMPLOYEE ==========*/
const EmployeeSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone: { type: String, required : true, unique: true },
    password: { type: String, required: true, select: false },
    employee_id: { type: String, required: true, unique: true },
    role: { type: String, enum: ['manager', 'staff', 'courier'], required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/*========== ADMIN ==========*/
const AdminSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    phone: { type: String, required : true, unique: true },
    password: { type: String, required: true, select: false },
    employee_id: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Sender = mongoose.model("Sender", SenderSchema);
const Recipient = mongoose.model("Recipient", RecipientSchema);
const Employee = mongoose.model("Employee", EmployeeSchema);
const Admin = mongoose.model("Admin", AdminSchema);

export { Sender, Recipient, Employee, Admin };