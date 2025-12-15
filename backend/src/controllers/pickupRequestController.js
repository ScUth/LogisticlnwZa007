import { PickupRequest, PickupRequestItem } from "../models/operations.js";

// ANATOMY OF PICKUP REQUEST AND PICKUP REQUEST ITEM MODELS
// /*========== PICKUP REQUEST ==========*/
// const PickupRequestSchema = new mongoose.Schema(
//   {
//     requester: { type: ObjectId, ref: "Sender", required: true },
//     pickup_location: {
//       address_text: { type: String, required: true },
//       sub_district: { type: String, required: true },
//     },

//     status: {
//       type: String,
//       enum: ["draft", "pending", "assigned", "in_progress", "completed", "canceled"],
//       default: "draft",
//     },

//     assigned_courier: { type: ObjectId, ref: "Employee" }, // will be assigned when courier accepts
//   },
//   { timestamps: { createdAt: "requested_at", updatedAt: "updated_at" } }
// );

// // index
// PickupRequestSchema.index({ requester: 1, updated_at: -1 });
// PickupRequestSchema.index({ assigned_courier: 1, status: 1, updated_at: -1 });
// PickupRequestSchema.index({ status: 1, updated_at: -1 });
// PickupRequestSchema.index(
//   { requester: 1, status: 1 },
//   { unique: true, partialFilterExpression: { status: "draft" } }
// );


// /*========== PICKUP REQUEST ITEM ==========*/
// const PickupRequestItemSchema = new mongoose.Schema(
//   {
//     // point to PickupRequest instead of array of items for easier querying
//     recipient: {
//       first_name: { type: String, required: true },
//       last_name: { type: String, required: true },
//       phone: { type: String, required: true },
//       address_text: { type: String, required: true },
//       sub_district: { type: String, required: true },
//     },
//     estimated_weight: { type: Number, required: true },
//     quantity: { type: Number, required: true, default: 1, min: 1 },
//     size: {
//       type: String,
//       enum: ["small", "medium", "large"], // range, not exact measurements, just for choosing vehicle
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["draft", "confirmed", "parcel_created", "canceled"],
//       default: "draft",
//     },
//     parcel_id: { type: ObjectId, ref: "Parcel", default: null },
//     request_id: { type: ObjectId, ref: "PickupRequest", required: true },
//   },
//   { timestamps: {createdAt: "created_at", updatedAt: "updated_at"} }
// );

// PickupRequestItemSchema.index({ request_id: 1, status: 1 });


// ========== For user ========== //
// GET list of pickup requests (history) for current sender with items
export const listPickupRequestsForSender = async (req, res) => {
  try {
    const requesterId = req.auth.id;

    const pickupRequests = await PickupRequest.find({ requester: requesterId })
      .sort({ requested_at: -1 });

    if (pickupRequests.length === 0) {
      return res.status(200).json({ requests: [] });
    }

    const requestIds = pickupRequests.map((r) => r._id);

    const items = await PickupRequestItem.find({
      request_id: { $in: requestIds },
    }).sort({ created_at: 1 });

    const itemsByRequest = {};
    items.forEach((item) => {
      const key = item.request_id.toString();
      if (!itemsByRequest[key]) itemsByRequest[key] = [];
      itemsByRequest[key].push(item);
    });

    const result = pickupRequests.map((reqDoc) => ({
      request: reqDoc,
      items: itemsByRequest[reqDoc._id.toString()] || [],
    }));

    return res.status(200).json({ requests: result });
  } catch (error) {
    console.error("Error listing pickup requests:", error);
    return res
      .status(500)
      .json({ message: "Error listing pickup requests", error: error.message });
  }
};

// POST create pickup request draft or get existing draft
export const getOrCreateDraftPickupRequest = async (req, res) => {
  try {
    const requester = req.auth.id;
    const { pickup_location } = req.body || {};

    if (pickup_location && (!pickup_location.address_text || !pickup_location.sub_district)) {
      return res.status(400).json({
        message: "pickup_location must include address_text and sub_district",
      });
    }

    let draft = await PickupRequest.findOne({ requester, status: "draft" });

    // If found, optionally update pickup_location
    if (draft) {
      if (pickup_location?.address_text && pickup_location?.sub_district) {
        draft.pickup_location = pickup_location;
        await draft.save();
      }
      const items = await PickupRequestItem
        .find({ request_id: draft._id })
        .sort({ created_at: -1 });

      return res.status(200).json({ message: "Using existing draft", draft, items });
    }

    // Else create
    try {
      draft = await PickupRequest.create({
        requester,
        pickup_location, // optional if schema allows for draft
        status: "draft",
      });

      return res.status(201).json({ message: "Draft created", draft, items: [] });
    } catch (err) {
      if (err.code === 11000) {
        const existing = await PickupRequest.findOne({ requester, status: "draft" });
        const items = await PickupRequestItem
          .find({ request_id: existing._id })
          .sort({ created_at: -1 });

        return res.status(200).json({ message: "Using existing draft", draft: existing, items });
      }
      throw err;
    }
  } catch (error) {
    return res.status(500).json({ message: "Error", error: error.message });
  }
};


// POST add item to pickup request
export const addItemToPickupRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { recipient, estimated_weight, size, quantity } = req.body;
    const requesterId = req.auth.id;

    // validate required fields
    if (!recipient || !recipient.first_name || !recipient.last_name || !recipient.phone || !recipient.address_text || !recipient.sub_district) {
      return res.status(400).json({ message: 'Complete recipient information is required' });
    }
    
    // Validate and convert estimated_weight
    const weightNum = Number(estimated_weight);
    if (!estimated_weight || !Number.isFinite(weightNum) || weightNum <= 0) {
      return res.status(400).json({ message: 'Valid estimated weight (positive number) is required' });
    }
    
    // Validate and convert quantity
    const quantityNum = Number(quantity || 1);
    if (!Number.isFinite(quantityNum) || quantityNum < 1 || !Number.isInteger(quantityNum)) {
      return res.status(400).json({ message: 'Quantity must be a positive integer' });
    }
    
    if (!size || !['small', 'medium', 'large'].includes(size.toLowerCase())) {
      return res.status(400).json({ message: 'Size must be small, medium, or large' });
    }

    const pickupRequest = await PickupRequest.findOne({ _id: requestId, requester: requesterId });
    if (!pickupRequest) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    if (pickupRequest.status !== 'draft') {
      return res.status(400).json({ message: 'Cannot add items to a non-draft pickup request' });
    }

    const newItem = new PickupRequestItem({
      recipient,
      estimated_weight: weightNum,
      quantity: quantityNum,
      size: size.toLowerCase(),
      request_id: requestId,
    });
    await newItem.save();
    res.status(201).json({ message: 'Item added to pickup request', newItem });
  } catch (error) {
    res.status(500).json({ message: 'Error adding item to pickup request', error: error.message });
  }
};

// POST submit pickup request
export const submitPickupRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const requesterId = req.auth.id;
    const pickupRequest = await PickupRequest.findOne({ _id: requestId, requester: requesterId });

    if (!pickupRequest) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    if (pickupRequest.status !== 'draft') {
      return res.status(400).json({ message: 'Only draft pickup requests can be submitted' });
    }

    // Validate pickup location is set
    if (!pickupRequest.pickup_location?.address_text || !pickupRequest.pickup_location?.sub_district) {
      return res.status(400).json({ message: 'Pickup location must be set before submitting' });
    }
    const items = await PickupRequestItem.find({ request_id: requestId });
    if (items.length === 0) {
      return res.status(400).json({ message: 'Cannot submit a pickup request with no items' });
    }
    // lock items and mark them as ready for courier pickup
    await PickupRequestItem.updateMany(
      { request_id: requestId, status: 'draft' },
      { $set: { status: 'confirmed' } }
    );

    pickupRequest.status = 'pending';
    await pickupRequest.save();

    res.status(200).json({ message: 'Pickup request submitted', pickupRequest });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting pickup request', error: error.message });
  }
};

// PATCH update item in pickup request
export const updatePickupRequestItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { recipient, estimated_weight, size, quantity } = req.body;
    const requesterId = req.auth.id;
    const item = await PickupRequestItem.findById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Pickup request item not found' });
    }
    const pickupRequest = await PickupRequest.findOne({ _id: item.request_id, requester: requesterId });
    if (!pickupRequest) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    if (pickupRequest.status !== 'draft') {
      return res.status(400).json({ message: 'Cannot update items in a non-draft pickup request' });
    }

    // Validate updates
    if (estimated_weight !== undefined) {
      const weightNum = Number(estimated_weight);
      if (!Number.isFinite(weightNum) || weightNum <= 0) {
        return res.status(400).json({ message: 'Estimated weight must be a positive number' });
      }
      item.estimated_weight = weightNum;
    }
    
    if (quantity !== undefined) {
      const quantityNum = Number(quantity);
      if (!Number.isFinite(quantityNum) || quantityNum < 1 || !Number.isInteger(quantityNum)) {
        return res.status(400).json({ message: 'Quantity must be a positive integer' });
      }
      item.quantity = quantityNum;
    }
    
    if (size && !['small', 'medium', 'large'].includes(size.toLowerCase())) {
      return res.status(400).json({ message: 'Size must be small, medium, or large' });
    }
    
    if (recipient) {
      // Validate recipient fields if provided
      if (!recipient.first_name || !recipient.last_name || !recipient.phone || !recipient.address_text || !recipient.sub_district) {
        return res.status(400).json({ message: 'Complete recipient information is required' });
      }
      item.recipient = recipient;
    }
    if (size) item.size = size.toLowerCase();
    await item.save();
    res.status(200).json({ message: 'Pickup request item updated', item });
  } catch (error) {
    res.status(500).json({ message: 'Error updating pickup request item', error: error.message });
  }
};

// DELETE item from pickup request (delete from cart)
export const deleteItemFromPickupRequest = async (req, res) => {
  try {
    const { itemId } = req.params;
    const requesterId = req.auth.id;
    const item = await PickupRequestItem.findById(itemId);

    if (!item) {
      return res.status(404).json({ message: 'Pickup request item not found' });
    }
    const pickupRequest = await PickupRequest.findOne({ _id: item.request_id, requester: requesterId });
    if (!pickupRequest) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    if (pickupRequest.status !== 'draft') {
      return res.status(400).json({ message: 'Cannot delete items from a non-draft pickup request' });
    }
    await item.deleteOne();
    res.status(200).json({ message: 'Item deleted from pickup request' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting item from pickup request', error: error.message });
  }
};

// GET item list for a pickup request
export const getPickupRequestItems = async (req, res) => {
  try {
    const { requestId } = req.params;
    const requesterId = req.auth.id;

    const pickupRequest = await PickupRequest.findOne({ _id: requestId, requester: requesterId });
    if (!pickupRequest) {
      return res.status(404).json({ message: 'Pickup request not found' });
    }

    const items = await PickupRequestItem.find({ request_id: requestId }).sort({ created_at: -1 });
    res.status(200).json({ items });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving pickup request items', error: error.message });
  }
};