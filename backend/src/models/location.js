import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

/*========== Location ==========*/
const LocationSchema = new mongoose.Schema(
  {
    location_name: { type: String, required: true, trim: true },
    address_text: { type: String },
    region_code: { type: String, maxlength: 20 },
    sender: { type: Boolean, default: false },
    used_for_pickup: { type: Boolean, default: false },
  },
  { timestamps: true }
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
const Location = mongoose.model("Location", ZoneSchema);

export { Hub, Location };