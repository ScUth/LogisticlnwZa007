import { Employee } from '../models/people.js';
import { Route, Parcel, ParcelRouteAssignment, ProofOfDelivery } from '../models/operations.js';

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
				{ $match: { _id: { $in: parcelIds } , delivered_at: { $exists: true, $ne: null } } },
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

export default { listCouriers };


