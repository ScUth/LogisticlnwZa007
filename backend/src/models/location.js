import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

/*========== Location ==========*/
const LocationSchema = new mongoose.Schema(
  {
    location_name: { type: String, required: true, trim: true },
    address_text: { type: String, required: true, trim: true },
    region_code: { type: String, maxlength: 20 },
    sender: { type: String, required: true, trim: true },
    used_for_pickup: { type: Boolean, default: false },
  },
  // createdAt, updatedAt
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

LocationSchema.index(
  { sender: 1, used_for_pickup: 1 },
  { unique: true, partialFilterExpression: { used_for_pickup: true } }
);

/*========== HUB ==========*/
const HubSchema = new mongoose.Schema(
  {
    hub_name: { type: String, required: true, trim: true },
    address_text: { type: String },
    region_code: { type: String, maxlength: 20 },

    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Hub = mongoose.model("Hub", HubSchema);
const Location = mongoose.model("Location", LocationSchema);

export { Hub, Location };