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
    phone: { type: String },
    notes: { type: String },
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
    role: { type: String, enum: ['admin', 'manager', 'staff', 'courier'], required: true },
  },
  { timestamps: true }
);

const Sender = mongoose.model("Sender", SenderSchema);
const Recipient = mongoose.model("Recipient", RecipientSchema);
const Employee = mongoose.model("Employee", EmployeeSchema);

export { Sender, Recipient, Employee };