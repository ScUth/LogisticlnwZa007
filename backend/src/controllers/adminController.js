import { Employee, Sender, Recipient } from '../models/people.js';
import { Route, Parcel, ParcelRouteAssignment, ProofOfDelivery, Vehicle, ParcelScanEvent } from '../models/operations.js';
import { Hub } from '../models/location.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// ------------------------------------------------------------------- RECIPIENT ------------------------------------------------------------------- //
// GET /api/admin/recipients
export const listRecipients = async (req, res) => {
	try {
		const { search, owner } = req.query;
		const q = {};
		if (search) {
			const regex = new RegExp(search, 'i');
			q.$or = [{ first_name: regex }, { last_name: regex }, { phone: regex }, { address_text: regex }];
		}
		if (owner) q.owner = owner;
		const recipients = await Recipient.find(q).select('first_name last_name phone address_text sub_district owner').lean();
		return res.json({ recipients });
	} catch (err) {
		console.error('List recipients error:', err);
		return res.status(500).json({ message: 'Failed to fetch recipients', error: err.message });
	}
};
// ------------------------------------------------------------------- SENDER ------------------------------------------------------------------- //
// GET /api/admin/senders
export const listSenders = async (req, res) => {
	try {
		const { search } = req.query;
		const q = {};
		if (search) {
			const regex = new RegExp(search, 'i');
			q.$or = [{ first_name: regex }, { last_name: regex }, { phone: regex }];
		}
		const senders = await Sender.find(q).select('first_name last_name phone').lean();
		return res.json({ senders });
	} catch (err) {
		console.error('List senders error:', err);
		return res.status(500).json({ message: 'Failed to fetch senders', error: err.message });
	}
};
// ------------------------------------------------------------------- COURIER ------------------------------------------------------------------- //

// GET /api/admin/couriers
export const listCouriers = async (req, res) => {
	try {
		const couriers = await Employee.find({ role: 'courier' })
			.select('first_name last_name phone employee_id active')
			.lean();

		// Add default vehicle_type if missing
		const safeCouriers = couriers.map(courier => ({
			...courier,
		}));

		return res.json({ couriers: safeCouriers });
	} catch (err) {
		return res.status(500).json({ message: 'Failed to fetch couriers', error: err.message });
	}
};

// GET /api/admin/couriers/:id
export const getCourierDetails = async (req, res) => {
	try {
		const { id } = req.params;
		const courier = await Employee.findById(id).select('first_name last_name phone employee_id active role');
		if (!courier) return res.status(404).json({ message: 'Courier not found' });

		// fetch recent routes
		const routes = await Route.find({ courier_id: courier._id }).sort({ route_date: -1 }).limit(10).lean();

		// for each route, get parcel count
		const routeIds = routes.map(r => r._id);
		const assignmentCounts = await ParcelRouteAssignment.aggregate([
			{ $match: { route_id: { $in: routeIds } } },
			{ $group: { _id: '$route_id', count: { $sum: 1 } } }
		]);
		const countsMap = assignmentCounts.reduce((acc, it) => { acc[it._id.toString()] = it.count; return acc; }, {});
		const routesWithCounts = routes.map(r => ({ ...r, parcel_count: countsMap[r._id.toString()] || 0 }));

		// delivered parcels count (from ProofOfDelivery)
		const deliveredCount = await ProofOfDelivery.countDocuments({ courier_id: courier._id });

		// Recent deliveries (last 5)
		const recentDeliveries = await ProofOfDelivery.find({ courier_id: courier._id }).sort({ signed_at: -1 }).limit(5).lean();
		// join recent deliveries with parcel tracking info
		const parcelIdsForRecent = recentDeliveries.map(d => d.parcel_id).filter(Boolean);
		const parcelsForRecent = await Parcel.find({ _id: { $in: parcelIdsForRecent } }).select('tracking_code delivered_at').lean();
		const parcelMap = parcelsForRecent.reduce((acc, p) => { acc[p._id.toString()] = p; return acc; }, {});
		const recentDeliveriesWithParcel = recentDeliveries.map(d => ({ ...d, parcel: parcelMap[d.parcel_id.toString()] || null }));

		// assigned parcels count for this courier
		const assignedCountAgg = await ParcelRouteAssignment.aggregate([
			{ $match: { route_id: { $in: routeIds } } },
			{ $group: { _id: null, count: { $sum: 1 } } }
		]);
		const assignedCount = (assignedCountAgg[0] && assignedCountAgg[0].count) || 0;

		// average delivery time in ms (use Parcel.delivered_at - Parcel.created_at for parcels delivered by this courier)
		const deliveredParcels = await ProofOfDelivery.find({ courier_id: courier._id }).select('parcel_id').lean();
		const parcelIds = deliveredParcels.map(dp => dp.parcel_id).filter(Boolean);
		let avgDeliveryMs = null;
		if (parcelIds.length) {
			const avgAgg = await Parcel.aggregate([
				{ $match: { _id: { $in: parcelIds }, delivered_at: { $exists: true, $ne: null } } },
				{ $project: { diff: { $subtract: ["$delivered_at", "$created_at"] } } },
				{ $group: { _id: null, avgMs: { $avg: "$diff" } } }
			]);
			if (avgAgg && avgAgg[0] && avgAgg[0].avgMs != null) avgDeliveryMs = Math.round(avgAgg[0].avgMs);
		}

		const successRate = assignedCount ? (deliveredCount / assignedCount) : null;

		return res.json({ courier, routes: routesWithCounts, deliveredCount, recentDeliveries: recentDeliveriesWithParcel, assignedCount, avgDeliveryMs, successRate });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Failed to fetch courier details', error: err.message });
	}
};

// PATCH /api/admin/couriers/:id/active
export const updateCourierActive = async (req, res) => {
	try {
		const { id } = req.params;
		const { active } = req.body;
		if (typeof active !== 'boolean') return res.status(400).json({ message: 'active must be boolean' });
		const courier = await Employee.findByIdAndUpdate(id, { active }, { new: true }).select('first_name last_name phone employee_id active');
		if (!courier) return res.status(404).json({ message: 'Courier not found' });
		return res.json({ courier });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: 'Failed to update courier', error: err.message });
	}
};

// POST /api/admin/couriers
export const createCourier = async (req, res) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const {
			first_name,
			last_name,
			phone,
			password,
			employee_id,
			active = true,
		} = req.body;

		/* ------------------ validation ------------------ */
		if (!first_name || !last_name || !phone || !password || !employee_id) {
			return res.status(400).json({
				message: "Missing required fields",
			});
		}

		/* -------- prevent duplicate phone / employee_id -------- */
		const exists = await Employee.findOne({
			$or: [{ phone }, { employee_id }],
		});

		if (exists) {
			return res.status(409).json({
				message: "Employee with this phone or employee_id already exists",
			});
		}

		/* ---------------- password hashing ---------------- */
		const hashedPassword = await bcrypt.hash(password, 12);

		/* ---------------- create courier ---------------- */
		const courier = await Employee.create({
			first_name,
			last_name,
			phone,
			password: hashedPassword,
			employee_id,
			role: "courier", // enforce courier role
			active,
		});

		/* -------- hide password in response -------- */
		const courierResponse = courier.toObject();
		delete courierResponse.password;

		return res.status(201).json(courierResponse);

	} catch (error) {
		console.error("Create courier error:", error);
		return res.status(500).json({
			message: "Internal server error",
		});
	}
};

// GET /api/admin/pods
export const listProofs = async (req, res) => {
	try {
		const { courier, date, date_from, date_to } = req.query;
		const q = {};
		if (courier) q.courier_id = courier;
		if (date) {
			const d = new Date(date);
			const start = new Date(d.setHours(0,0,0,0));
			const end = new Date(d.setHours(23,59,59,999));
			q.signed_at = { $gte: start, $lte: end };
		} else if (date_from || date_to) {
			q.signed_at = {};
			if (date_from) q.signed_at.$gte = new Date(new Date(date_from).setHours(0,0,0,0));
			if (date_to) q.signed_at.$lte = new Date(new Date(date_to).setHours(23,59,59,999));
		}

		const proofs = await ProofOfDelivery.find(q).sort({ signed_at: -1 }).lean();

		// attach parcel tracking and courier name
		const parcelIds = proofs.map(p => p.parcel_id).filter(Boolean);
		const parcels = parcelIds.length ? await Parcel.find({ _id: { $in: parcelIds } }).select('tracking_code').lean() : [];
		const parcelMap = parcels.reduce((acc, p) => { acc[p._id.toString()] = p; return acc; }, {});

		const courierIds = proofs.map(p => p.courier_id).filter(Boolean);
		const couriers = courierIds.length ? await Employee.find({ _id: { $in: courierIds } }).select('first_name last_name employee_id').lean() : [];
		const courierMap = couriers.reduce((acc, c) => { acc[c._id.toString()] = c; return acc; }, {});

		const enriched = proofs.map(p => ({
			...p,
			parcel: parcelMap[p.parcel_id?.toString()] || null,
			courier: courierMap[p.courier_id?.toString()] || null
		}));

		return res.json({ proofs: enriched });
	} catch (err) {
		console.error('List proofs error:', err);
		return res.status(500).json({ message: 'Failed to fetch proofs', error: err.message });
	}
};

// ------------------------------------------------------------------- HUB ------------------------------------------------------------------- //

// GET /api/admin/hubs
export const listHubs = async (req, res) => {
	try {
		const hubs = await Hub.find().sort({ hub_name: 1 }).lean();
		// Provide a `name` alias for clients that expect `hub.name`
		const mapped = hubs.map(h => ({ ...h, name: h.hub_name }));
		return res.json({ hubs: mapped });
	} catch (err) {
		console.error('List hubs error:', err);
		return res.status(500).json({ message: 'Failed to fetch hubs', error: err.message });
	}
};

// GET /api/admin/routes
export const listRoutes = async (req, res) => {
	try {
		const routes = await Route.find().sort({ route_date: -1 }).limit(10)
			.populate('hub_id', 'hub_name address_text sub_district')
			.populate('courier_id', 'first_name last_name employee_id')
			.lean();

		const mapped = routes.map(r => ({
			_id: r._id,
			route_date: r.route_date,
			status: r.status,
			hub: r.hub_id ? { hub_name: r.hub_id.hub_name, address_text: r.hub_id.address_text, sub_district: r.hub_id.sub_district } : null,
			courier: r.courier_id ? { first_name: r.courier_id.first_name, last_name: r.courier_id.last_name, employee_id: r.courier_id.employee_id } : null
		}));

		return res.json({ routes: mapped });
	} catch (err) {
		console.error('List routes error:', err);
		return res.status(500).json({ message: 'Failed to fetch routes', error: err.message });
	}
};

// GET /api/admin/hubs/:id - admin hub detail (keeps existing behavior)
export const getHubById = async (req, res) => {
	try {
		const { id } = req.params;
		const hub = await Hub.findById(id).lean();
		if (!hub) return res.status(404).json({ message: 'Hub not found' });
		// include name alias for convenience
		hub.name = hub.hub_name || hub.name;
		return res.json({ hub });
	} catch (err) {
		console.error('Get hub by id error:', err);
		return res.status(500).json({ message: 'Failed to fetch hub', error: err.message });
	}
};

// GET /api/admin/scan-events
export const listScanEvents = async (req, res) => {
	try {
		const events = await ParcelScanEvent.find().sort({ event_time: -1 }).limit(10).lean();

		const parcelIds = events.map(e => e.parcel_id).filter(Boolean);
		const parcels = parcelIds.length ? await Parcel.find({ _id: { $in: parcelIds } }).select('tracking_code').lean() : [];
		const parcelMap = parcels.reduce((acc, p) => { acc[p._id.toString()] = p; return acc; }, {});

		const hubIds = events.map(e => e.hub_id).filter(Boolean);
		const hubs = hubIds.length ? await Hub.find({ _id: { $in: hubIds } }).select('hub_name address_text sub_district').lean() : [];
		const hubMap = hubs.reduce((acc, h) => { acc[h._id.toString()] = h; return acc; }, {});

		const courierIds = events.map(e => e.courier_id).filter(Boolean);
		const couriers = courierIds.length ? await Employee.find({ _id: { $in: courierIds } }).select('first_name last_name employee_id').lean() : [];
		const courierMap = couriers.reduce((acc, c) => { acc[c._id.toString()] = c; return acc; }, {});

		const enriched = events.map(e => ({
			...e,
			parcel: parcelMap[e.parcel_id?.toString()] || null,
			hub: hubMap[e.hub_id?.toString()] || null,
			courier: courierMap[e.courier_id?.toString()] || null
		}));

		return res.json({ events: enriched });
	} catch (err) {
		console.error('List scan events error:', err);
		return res.status(500).json({ message: 'Failed to fetch scan events', error: err.message });
	}
};

// POST /api/admin/hubs
export const createHub = async (req, res) => {
	try {
		const { hub_name, address_text, sub_district, active } = req.body;
		if (!hub_name || !hub_name.trim()) return res.status(400).json({ message: 'hub_name is required' });

		const exists = await Hub.findOne({ hub_name: hub_name.trim() });
		if (exists) return res.status(409).json({ message: 'Hub with this name already exists' });

		const hub = await Hub.create({ hub_name: hub_name.trim(), address_text: address_text || '', sub_district: sub_district || '', active: active === undefined ? true : !!active });
		return res.status(201).json({ hub });
	} catch (err) {
		console.error('Create hub error:', err);
		return res.status(500).json({ message: 'Failed to create hub', error: err.message });
	}
};

// DELETE /api/admin/hubs/:id
export const deleteHub = async (req, res) => {
	try {
		const { id } = req.params;
		const hub = await Hub.findById(id);
		if (!hub) return res.status(404).json({ message: 'Hub not found' });
		await hub.deleteOne();
		return res.json({ success: true });
	} catch (err) {
		console.error('Delete hub error:', err);
		return res.status(500).json({ message: 'Failed to delete hub', error: err.message });
	}
};

// ------------------------------------------------------------------- VEHICLE ------------------------------------------------------------------- //

// GET /api/admin/vehicles/provinces
export const getAllProvinces = async (req, res) => {
	try {
		res.status(200).json({
			success: true,
			provinces: [
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
			]
		});
	} catch (error) {
		console.error('Get provinces error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error while fetching provinces'
		});
	}
};

// GET /api/admin/vehicles/:id
export const getVehicleByID = async (req, res) => {
	try {
		const vehicle = await Vehicle.findById(req.params.id)
			.populate('assigned_courier', 'first_name last_name employee_id phone')
			.lean();

		if (!vehicle) {
			return res.status(404).json({
				success: false,
				message: 'Vehicle not found'
			});
		}

		res.status(200).json({
			success: true,
			vehicle
		});

	} catch (error) {
		console.error('Get vehicle error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error while fetching vehicle',
			error: error.message
		});
	}
};

// GET /api/admin/vehicles
export const listVehicles = async (req, res) => {
	try {
		const { owner, search, vehicle_type, province, available } = req.query;

		const filters = [];

		if (owner) filters.push({ Owner: owner });
		if (vehicle_type) filters.push({ vehicle_type });
		if (province) filters.push({ province });
		if (available && available.toString().toLowerCase() === 'true') {
			// Unassigned vehicles are considered available
			filters.push({ assigned_courier: null });
		}
		if (search) {
			const safe = search.trim();
			const regex = new RegExp(safe.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"), 'i');
			filters.push({ $or: [{ plate_raw: { $regex: regex } }, { plate_no: { $regex: regex } }] });
		}

		const queryObj = filters.length ? { $and: filters } : {};

		const vehicles = await Vehicle.find(queryObj)
			.populate('assigned_courier', 'first_name last_name employee_id phone')
			.lean();

		res.status(200).json({ success: true, vehicles });
	} catch (error) {
		console.error('List vehicles error:', error);
		res.status(500).json({ success: false, message: 'Server error while fetching vehicles', error: error.message });
	}
};

// POST /api/admin/vehicles
export const createNewVehicle = async (req, res) => {
	try {
		const {
			plate_raw,
			plate_no,
			province,
			vehicle_type,
			capacity_kg,
			owner,
			assigned_courier,
			notes,
		} = req.body;

		/* ---------- required fields ---------- */
		if (!plate_raw || !province || !vehicle_type || !capacity_kg || !owner) {
			return res.status(400).json({
				success: false,
				message: "Please provide all required fields",
			});
		}

		/* ---------- enums ---------- */
		if (!["Company", "Courier"].includes(owner)) {
			return res.status(400).json({
				success: false,
				message: "Owner must be Company or Courier",
			});
		}

		if (!["pickup", "motorcycle", "truck"].includes(vehicle_type)) {
			return res.status(400).json({
				success: false,
				message: "Vehicle type must be pickup, motorcycle, or truck",
			});
		}

		/* ---------- normalize plate ---------- */
		const normalizedPlate =
			plate_no || plate_raw.replace(/[\s\-]/g, "").toUpperCase();

		const existingVehicle = await Vehicle.findOne({
			plate_no: normalizedPlate,
			province,
		});

		if (existingVehicle) {
			return res.status(400).json({
				success: false,
				message: "Vehicle with this plate number and province already exists",
			});
		}

		/* ---------- validate courier if required ---------- */
		if (owner === "Courier") {
			if (!assigned_courier) {
				return res.status(400).json({
					success: false,
					message: "assigned_courier is required when owner is Courier",
				});
			}

			const courier = await Employee.findById(assigned_courier);
			if (!courier) {
				return res.status(404).json({
					success: false,
					message: "Assigned courier not found",
				});
			}
		}

		/* ---------- create ---------- */
		const vehicle = await Vehicle.create({
			plate_raw,
			plate_no: normalizedPlate,
			province,
			vehicle_type,
			capacity_kg: parseInt(capacity_kg, 10),
			owner,
			assigned_courier:
				owner === "Courier" ? assigned_courier : undefined,
			notes: notes || "",
		});

		return res.status(201).json({
			success: true,
			message: "Vehicle created successfully",
			vehicle,
		});

	} catch (error) {
		console.error("Create vehicle error:", error);

		if (error.name === "ValidationError") {
			return res.status(400).json({
				success: false,
				message: "Validation error",
				errors: error.errors,
			});
		}

		return res.status(500).json({
			success: false,
			message: "Server error while creating vehicle",
			error: error.message,
		});
	}
};


// PUT /api/admin/vehicles/:id
export const updateVehicle = async (req, res) => {
	try {
		const { assigned_courier, ...otherUpdates } = req.body;

		/* ---------- validate courier if provided ---------- */
		if (assigned_courier !== undefined && assigned_courier !== null && assigned_courier !== "") {
			const courier = await Employee.findById(assigned_courier);
			if (!courier) {
				return res.status(404).json({
					success: false,
					message: "Courier not found",
				});
			}
		}

		const updatePayload = {
			...otherUpdates,
		};

		if (assigned_courier !== undefined) {
			updatePayload.assigned_courier =
				assigned_courier ? assigned_courier : undefined;
		}

		const vehicle = await Vehicle.findByIdAndUpdate(
			req.params.id,
			{ $set: updatePayload },
			{
				new: true,           // return updated doc
				runValidators: false // IMPORTANT: avoid required owner validation
			}
		);

		if (!vehicle) {
			return res.status(404).json({
				success: false,
				message: "Vehicle not found",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Vehicle updated successfully",
			vehicle,
		});

	} catch (error) {
		console.error("Update vehicle error:", error);

		return res.status(500).json({
			success: false,
			message: "Server error while updating vehicle",
			error: error.message,
		});
	}
};



// DELETE /api/admin/vehicles/:id
export const deleteVehicle = async (req, res) => {
	try {
		const vehicle = await Vehicle.findById(req.params.id);

		if (!vehicle) {
			return res.status(404).json({
				success: false,
				message: 'Vehicle not found'
			});
		}

		// Check if vehicle is assigned to a courier
		if (vehicle.assigned_courier) {
			return res.status(400).json({
				success: false,
				message: 'Cannot delete a vehicle that is assigned to a courier'
			});
		}

		await vehicle.deleteOne();

		res.status(200).json({
			success: true,
			message: 'Vehicle deleted successfully'
		});

	} catch (error) {
		console.error('Delete vehicle error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error while deleting vehicle',
			error: error.message
		});
	}
};

// ------------------------------------------------------------------- PARCEL ------------------------------------------------------------------- //

// GET /api/admin/parcels
export const listParcels = async (req, res) => {
	try {
		const { search, status, hub } = req.query;

		const filters = {};

		if (status) filters.status = status;

		if (hub) {
			// match either origin or destination hub id
			filters.$or = filters.$or || [];
			filters.$or.push({ origin_hub_id: hub }, { dest_hub_id: hub });
		}

		if (search) {
			const safe = search.trim();
			const regex = new RegExp(safe.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"), 'i');
			filters.$or = filters.$or || [];
			filters.$or.push(
				{ tracking_code: { $regex: regex } },
				{ 'sender.first_name': { $regex: regex } },
				{ 'sender.last_name': { $regex: regex } },
				{ 'recipient.first_name': { $regex: regex } },
				{ 'recipient.last_name': { $regex: regex } }
			);
		}
		const parcels = await Parcel.find(filters).sort({ created_at: -1 }).limit(200).lean();
		res.status(200).json({ success: true, parcels });
	} catch (error) {
		console.error('List parcels error:', error);
		res.status(500).json({ success: false, message: 'Server error while fetching parcels', error: error.message });
	}
};

// GET /api/admin/parcels/:id
export const getParcelByID = async (req, res) => {
	try {
		const parcel = await Parcel.findById(req.params.id).lean();
		if (!parcel) return res.status(404).json({ success: false, message: 'Parcel not found' });
		return res.status(200).json({ success: true, parcel });
	} catch (error) {
		console.error('Get parcel error:', error);
		return res.status(500).json({ success: false, message: 'Server error while fetching parcel', error: error.message });
	}
};

// POST /api/admin/parcels
export const createParcel = async (req, res) => {
	try {
		const {
			tracking_code,
			sender,
			recipient,
			origin_hub_id,
			dest_hub_id,
			weight_grams,
			declared_value,
			status
		} = req.body;

		if (!tracking_code || !sender || !recipient || !origin_hub_id || !dest_hub_id) {
			return res.status(400).json({ success: false, message: 'Missing required fields' });
		}

		const exists = await Parcel.findOne({ tracking_code });
		if (exists) return res.status(409).json({ success: false, message: 'Parcel with this tracking code already exists' });

		const parcel = await Parcel.create({
			tracking_code,
			sender,
			recipient,
			origin_hub_id,
			dest_hub_id,
			weight_grams: weight_grams ? Number(weight_grams) : undefined,
			declared_value: declared_value ? Number(declared_value) : undefined,
			status: status || undefined
		});

		return res.status(201).json({ success: true, parcel });
	} catch (error) {
		console.error('Create parcel error:', error);
		return res.status(500).json({ success: false, message: 'Server error while creating parcel', error: error.message });
	}
};

// PUT /api/admin/parcels/:id
export const updateParcel = async (req, res) => {
	try {
		const updates = req.body || {};
		const parcel = await Parcel.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
		if (!parcel) return res.status(404).json({ success: false, message: 'Parcel not found' });
		return res.status(200).json({ success: true, parcel });
	} catch (error) {
		console.error('Update parcel error:', error);
		return res.status(500).json({ success: false, message: 'Server error while updating parcel', error: error.message });
	}
};

//---------------------------------------------------------------- POD ------------------------------------------------------------------- //
// GET /api/admin/pods/:id
export const getProofDetail = async (req, res) => {
    try {
        const { id } = req.params;
        
        const proof = await ProofOfDelivery.findById(id).lean();
        if (!proof) {
            return res.status(404).json({ message: 'Proof of Delivery not found' });
        }

        // Get parcel details
        const parcel = proof.parcel_id ? await Parcel.findById(proof.parcel_id)
            .select('tracking_code status created_at delivered_at')
            .lean() : null;

        // Get courier details
        const courier = proof.courier_id ? await Employee.findById(proof.courier_id)
            .select('first_name last_name employee_id phone')
            .lean() : null;

        // Get recipient info from parcel if available
        let recipientInfo = null;
        if (parcel && parcel.recipient) {
            recipientInfo = parcel.recipient;
        }

        return res.json({
            success: true,
            proof: {
                ...proof,
                parcel,
                courier,
                recipient_info: recipientInfo
            }
        });
    } catch (err) {
        console.error('Get proof detail error:', err);
        return res.status(500).json({ message: 'Failed to fetch proof details', error: err.message });
    }
};

// ------------------------------------------------------------------- STAFF ------------------------------------------------------------------- //

// GET /api/admin/staff
export const listStaff = async (req, res) => {
    try {
        const { search, hub, role, active } = req.query;
        const query = { role: { $in: ['manager', 'staff'] } }; // Only show managers and staff

        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { first_name: regex },
                { last_name: regex },
                { phone: regex },
                { employee_id: regex }
            ];
        }

        if (hub) {
            query.current_hub = hub;
        }

        if (role) {
            query.role = role;
        }

        if (active !== undefined) {
            query.active = active === 'true';
        }

        const staff = await Employee.find(query)
            .select('first_name last_name phone employee_id role active current_hub')
            .populate('current_hub', 'hub_name address_text sub_district')
            .sort({ role: 1, last_name: 1 })
            .lean();

        const mapped = staff.map(s => ({
            ...s,
            current_hub: s.current_hub ? { ...s.current_hub, name: s.current_hub.hub_name } : null
        }));

        return res.json({ 
            success: true, 
            staff: mapped
        });
    } catch (err) {
        console.error('List staff error:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch staff', 
            error: err.message 
        });
    }
};

// GET /api/admin/staff/:id
export const getStaffDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        const staff = await Employee.findById(id)
            .select('first_name last_name phone employee_id role active current_hub')
            .populate('current_hub', 'hub_name address_text sub_district')
            .lean();

        if (!staff || !['manager', 'staff'].includes(staff.role)) {
            return res.status(404).json({ 
                success: false, 
                message: 'Staff member not found' 
            });
        }

        // ensure name alias exists for frontend
        if (staff.current_hub) staff.current_hub.name = staff.current_hub.hub_name || staff.current_hub.name;

        // Get shift history/attendance (you'll need to implement this based on your system)
        const today = new Date();
        const lastWeek = new Date(today.setDate(today.getDate() - 7));
        
        // Get recent activities (scan events, etc.)
        const recentActivities = await ParcelScanEvent.find({
            hub_id: staff.current_hub?._id
        })
        .sort({ event_time: -1 })
        .limit(10)
        .populate('parcel_id', 'tracking_code')
        .lean();

        // Get parcels currently at hub
        const parcelsAtHub = await Parcel.countDocuments({
            status: 'at_origin_hub',
            origin_hub_id: staff.current_hub?._id
        });

        // Get recent deliveries processed at hub
        const recentHubDeliveries = await ParcelScanEvent.aggregate([
            {
                $match: {
                    hub_id: staff.current_hub?._id,
                    event_type: 'departed_hub',
                    event_time: { $gte: lastWeek }
                }
            },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);

        const metrics = {
            parcelsAtHub: parcelsAtHub || 0,
            recentDeliveries: recentHubDeliveries[0]?.count || 0,
            activitiesCount: recentActivities.length || 0
        };

        return res.json({
            success: true,
            staff,
            recentActivities,
            metrics
        });
    } catch (err) {
        console.error('Get staff details error:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch staff details', 
            error: err.message 
        });
    }
};

// POST /api/admin/staff
export const createStaff = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            first_name,
            last_name,
            phone,
            password,
            employee_id,
            role,
            current_hub,
            active = true,
        } = req.body;

        /* ------------------ validation ------------------ */
        if (!first_name || !last_name || !phone || !password || !employee_id || !role) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        if (!['manager', 'staff'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be 'manager' or 'staff'",
            });
        }

        /* -------- prevent duplicate phone / employee_id -------- */
        const exists = await Employee.findOne({
            $or: [{ phone }, { employee_id }],
        });

        if (exists) {
            return res.status(409).json({
                success: false,
                message: "Employee with this phone or employee_id already exists",
            });
        }

        /* ---------------- validate hub if provided ---------------- */
        if (current_hub) {
            const hubExists = await mongoose.model('Hub').findById(current_hub);
            if (!hubExists) {
                return res.status(404).json({
                    success: false,
                    message: "Hub not found",
                });
            }
        }

        /* ---------------- password hashing ---------------- */
        const hashedPassword = await bcrypt.hash(password, 12);

        /* ---------------- create staff ---------------- */
        const staff = await Employee.create({
            first_name,
            last_name,
            phone,
            password: hashedPassword,
            employee_id,
            role,
            current_hub,
            active,
        });

        await staff.populate('current_hub', 'name code');

        /* -------- hide password in response -------- */
        const staffResponse = staff.toObject();
        delete staffResponse.password;

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
            success: true,
            message: "Staff created successfully",
            staff: staffResponse
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        
        console.error("Create staff error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

// PATCH /api/admin/staff/:id/active
export const updateStaffActive = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;
        
        if (typeof active !== 'boolean') {
            return res.status(400).json({ 
                success: false,
                message: 'active must be boolean' 
            });
        }
        
        const staff = await Employee.findByIdAndUpdate(
            id, 
            { active }, 
            { new: true, runValidators: true }
        )
        .select('first_name last_name phone employee_id role active current_hub')
        .populate('current_hub', 'name code');
        
        if (!staff) {
            return res.status(404).json({ 
                success: false,
                message: 'Staff not found' 
            });
        }

        return res.json({ 
            success: true,
            staff 
        });
    } catch (err) {
        console.error('Update staff active error:', err);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to update staff', 
            error: err.message 
        });
    }
};

// PUT /api/admin/staff/:id
export const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Remove password from updates if present
        delete updates.password;

        // Validate role if being updated
        if (updates.role && !['manager', 'staff'].includes(updates.role)) {
            return res.status(400).json({
                success: false,
                message: "Role must be 'manager' or 'staff'",
            });
        }

        // Validate hub if being updated
        if (updates.current_hub) {
            const hubExists = await mongoose.model('Hub').findById(updates.current_hub);
            if (!hubExists) {
                return res.status(404).json({
                    success: false,
                    message: "Hub not found",
                });
            }
        }

        const staff = await Employee.findByIdAndUpdate(
            id,
            { $set: updates },
            { 
                new: true, 
                runValidators: true 
            }
        )
        .select('first_name last_name phone employee_id role active current_hub')
        .populate('current_hub', 'name code');

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff not found'
            });
        }

        return res.json({
            success: true,
            message: 'Staff updated successfully',
            staff
        });
    } catch (error) {
        console.error('Update staff error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update staff',
            error: error.message
        });
    }
};

export default { listCouriers };


