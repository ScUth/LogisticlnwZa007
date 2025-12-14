import { Employee } from '../models/people.js';
import { Route, Parcel, ParcelRouteAssignment, ProofOfDelivery, Vehicle } from '../models/operations.js';

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

export const createCourier = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { 
            first_name, 
            last_name, 
            phone, 
            employee_id, 
            role = 'courier',
            active = true,
            vehicle_type = 'None', // "Company", "Courier", "Other", or "None"
            vehicle_details = null
        } = req.body;

        // Step 1: Validate required fields
        if (!first_name || !last_name || !phone || !employee_id) {
            return res.status(400).json({
                success: false,
                message: 'Please provide first name, last name, phone, and employee ID'
            });
        }

        // Step 2: Check if employee ID already exists
        const existingEmployee = await Employee.findOne({ employee_id }).session(session);
        if (existingEmployee) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Employee ID already exists'
            });
        }

        // Step 3: Check if phone already exists
        const existingPhone = await Employee.findOne({ phone }).session(session);
        if (existingPhone) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                success: false,
                message: 'Phone number already exists'
            });
        }

        // Step 4: Create the courier (Employee) record
        const courier = new Employee({
            first_name,
            last_name,
            phone,
            employee_id,
            role,
            active,
            // Set default password (should be changed on first login)
            password: `temp${employee_id}123`
        });

        await courier.save({ session });

        let vehicle = null;

        // Step 5: Handle vehicle if provided
        if (vehicle_type && vehicle_type !== 'None' && vehicle_details) {
            switch(vehicle_type) {
                case 'Company':
                    // Validate company vehicle data
                    if (!vehicle_details.vehicle_id) {
                        await session.abortTransaction();
                        session.endSession();
                        return res.status(400).json({
                            success: false,
                            message: 'Company vehicle ID is required'
                        });
                    }

                    // Check if vehicle exists and is available
                    vehicle = await Vehicle.findById(vehicle_details.vehicle_id).session(session);
                    if (!vehicle) {
                        await session.abortTransaction();
                        session.endSession();
                        return res.status(404).json({
                            success: false,
                            message: 'Company vehicle not found'
                        });
                    }

                    if (vehicle.assigned_courier) {
                        await session.abortTransaction();
                        session.endSession();
                        return res.status(400).json({
                            success: false,
                            message: 'Vehicle is already assigned to another courier'
                        });
                    }

                    if (vehicle.Owner !== 'Company') {
                        await session.abortTransaction();
                        session.endSession();
                        return res.status(400).json({
                            success: false,
                            message: 'Selected vehicle is not a company vehicle'
                        });
                    }

                    // Assign vehicle to courier
                    vehicle.assigned_courier = courier._id;
                    await vehicle.save({ session });
                    break;

                case 'Courier':
                    // Validate courier vehicle data
                    if (!vehicle_details.plate_raw || 
                        !vehicle_details.province || 
                        !vehicle_details.vehicle_type || 
                        !vehicle_details.capacity_kg) {
                        await session.abortTransaction();
                        session.endSession();
                        return res.status(400).json({
                            success: false,
                            message: 'All vehicle fields are required for courier vehicle'
                        });
                    }

                    // Check if vehicle with same plate and province already exists
                    const normalizedPlate = vehicle_details.plate_no || 
                        vehicle_details.plate_raw.replace(/[\s\-]/g, "").toUpperCase();

                    const existingVehicle = await Vehicle.findOne({
                        plate_no: normalizedPlate,
                        province: vehicle_details.province
                    }).session(session);

                    if (existingVehicle) {
                        await session.abortTransaction();
                        session.endSession();
                        return res.status(400).json({
                            success: false,
                            message: 'Vehicle with this plate number and province already exists'
                        });
                    }

                    // Create new vehicle record
                    vehicle = new Vehicle({
                        plate_raw: vehicle_details.plate_raw,
                        plate_no: normalizedPlate,
                        province: vehicle_details.province,
                        vehicle_type: vehicle_details.vehicle_type,
                        capacity_kg: Number(vehicle_details.capacity_kg),
                        Owner: 'Courier',
                        assigned_courier: courier._id
                    });

                    try {
                        await vehicle.validate();
                    } catch (validationError) {
                        await session.abortTransaction();
                        session.endSession();
                        return res.status(400).json({
                            success: false,
                            message: validationError.message || 'Invalid vehicle data'
                        });
                    }

                    await vehicle.save({ session });
                    break;

                case 'Other':
                    // For "Other" vehicles, we need to handle them differently
                    // Since Vehicle schema only allows "Company" or "Courier" as Owner
                    // We'll create it as "Courier" type but with notes or custom handling
                    if (!vehicle_details.plate_raw || 
                        !vehicle_details.province || 
                        !vehicle_details.vehicle_type || 
                        !vehicle_details.capacity_kg ||
                        !vehicle_details.Owner) {
                        await session.abortTransaction();
                        session.endSession();
                        return res.status(400).json({
                            success: false,
                            message: 'All vehicle fields are required for other vehicle'
                        });
                    }

                    // Check if vehicle with same plate and province already exists
                    const normalizedPlateOther = vehicle_details.plate_no || 
                        vehicle_details.plate_raw.replace(/[\s\-]/g, "").toUpperCase();

                    const existingVehicleOther = await Vehicle.findOne({
                        plate_no: normalizedPlateOther,
                        province: vehicle_details.province
                    }).session(session);

                    if (existingVehicleOther) {
                        await session.abortTransaction();
                        session.endSession();
                        return res.status(400).json({
                            success: false,
                            message: 'Vehicle with this plate number and province already exists'
                        });
                    }

                    // Create new vehicle record as "Courier" type
                    // Note: You might want to add a custom_owner field to Vehicle schema
                    // or handle "Other" vehicles differently in your business logic
                    vehicle = new Vehicle({
                        plate_raw: vehicle_details.plate_raw,
                        plate_no: normalizedPlateOther,
                        province: vehicle_details.province,
                        vehicle_type: vehicle_details.vehicle_type,
                        capacity_kg: Number(vehicle_details.capacity_kg),
                        Owner: 'Courier', // Using 'Courier' as fallback
                        assigned_courier: courier._id,
                        // You could add a custom field if you modify the schema:
                        // custom_owner: vehicle_details.Owner
                    });

                    try {
                        await vehicle.validate();
                    } catch (validationError) {
                        await session.abortTransaction();
                        session.endSession();
                        return res.status(400).json({
                            success: false,
                            message: validationError.message || 'Invalid vehicle data'
                        });
                    }

                    await vehicle.save({ session });
                    break;

                default:
                    // Invalid vehicle type
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid vehicle type'
                    });
            }
        }

        // Step 6: Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Step 7: Prepare response (exclude password)
        const courierResponse = await Employee.findById(courier._id)
            .select('-password -__v');

        const response = {
            success: true,
            message: 'Courier created successfully',
            data: {
                courier: courierResponse
            }
        };

        // Add vehicle to response if created
        if (vehicle) {
            const vehicleResponse = await Vehicle.findById(vehicle._id)
                .populate('assigned_courier', 'first_name last_name employee_id');
            response.data.vehicle = vehicleResponse;
        }

        res.status(201).json(response);

    } catch (error) {
        // Rollback transaction on error
        await session.abortTransaction();
        session.endSession();

        console.error('Create courier error:', error);
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.errors
            });
        }

        if (error.code === 11000) {
            const field = error.keyPattern ? Object.keys(error.keyPattern)[0] : 'field';
            return res.status(400).json({
                success: false,
                message: `${field} already exists`
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error while creating courier',
            error: error.message
        });
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
			Owner,
			assigned_courier
		} = req.body;

		// Validate required fields
		if (!plate_raw || !province || !vehicle_type || !capacity_kg || !Owner) {
			return res.status(400).json({
				success: false,
				message: 'Please provide all required fields'
			});
		}

		// Validate Owner enum
		if (!['Company', 'Courier', 'Other'].includes(Owner)) {
			return res.status(400).json({
				success: false,
				message: 'Owner must be either Company, Courier, or Other'
			});
		}

		// Validate vehicle type
		if (!['pickup', 'motorcycle', 'truck'].includes(vehicle_type)) {
			return res.status(400).json({
				success: false,
				message: 'Vehicle type must be pickup, motorcycle, or truck'
			});
		}

		// Check if vehicle already exists
		const normalizedPlate = plate_no || plate_raw.replace(/[\s\-]/g, "").toUpperCase();

		const existingVehicle = await Vehicle.findOne({
			plate_no: normalizedPlate,
			province
		});

		if (existingVehicle) {
			return res.status(400).json({
				success: false,
				message: 'Vehicle with this plate number and province already exists'
			});
		}

		// Create new vehicle
		const vehicle = new Vehicle({
			plate_raw,
			plate_no: normalizedPlate,
			province,
			vehicle_type,
			capacity_kg: parseInt(capacity_kg),
			Owner,
			assigned_courier: assigned_courier || null
		});

		// Validate the vehicle (this will trigger pre-validate middleware)
		await vehicle.validate();

		// Save to database
		await vehicle.save();

		res.status(201).json({
			success: true,
			message: 'Vehicle created successfully',
			vehicle: vehicle.toObject()
		});

	} catch (error) {
		console.error('Create vehicle error:', error);

		if (error.name === 'ValidationError') {
			return res.status(400).json({
				success: false,
				message: 'Validation error',
				errors: error.errors
			});
		}

		res.status(500).json({
			success: false,
			message: 'Server error while creating vehicle',
			error: error.message
		});
	}
};

// PUT /api/admin/vehicles/:id
export const updateVehicle = async (req, res) => {
	try {
		const vehicle = await Vehicle.findById(req.params.id);

		if (!vehicle) {
			return res.status(404).json({
				success: false,
				message: 'Vehicle not found'
			});
		}

		const updates = req.body;

		// Prevent changing Owner type if vehicle is already assigned
		if (updates.Owner && vehicle.assigned_courier) {
			return res.status(400).json({
				success: false,
				message: 'Cannot change Owner type of an assigned vehicle'
			});
		}

		// Update fields
		Object.keys(updates).forEach(key => {
			if (key !== 'assigned_courier' && key in vehicle) {
				vehicle[key] = updates[key];
			}
		});

		// Handle assigned_courier separately
		if (updates.assigned_courier !== undefined) {
			if (updates.assigned_courier === null || updates.assigned_courier === '') {
				vehicle.assigned_courier = undefined;
			} else {
				// Verify courier exists
				const courier = await Employee.findById(updates.assigned_courier);
				if (!courier) {
					return res.status(404).json({
						success: false,
						message: 'Courier not found'
					});
				}
				vehicle.assigned_courier = updates.assigned_courier;
			}
		}

		await vehicle.save();

		res.status(200).json({
			success: true,
			message: 'Vehicle updated successfully',
			vehicle: vehicle.toObject()
		});

	} catch (error) {
		console.error('Update vehicle error:', error);

		if (error.name === 'ValidationError') {
			return res.status(400).json({
				success: false,
				message: 'Validation error',
				errors: error.errors
			});
		}

		res.status(500).json({
			success: false,
			message: 'Server error while updating vehicle',
			error: error.message
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


export default { listCouriers };


