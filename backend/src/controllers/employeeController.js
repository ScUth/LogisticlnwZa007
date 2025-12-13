import { Employee } from '../models/people.js';

// GET /api/admin/couriers
export const listCouriers = async (req, res) => {
	try {
		const couriers = await Employee.find({ role: 'courier' }).select('first_name last_name phone employee_id active ');
		return res.json({ couriers });
	} catch (err) {
		return res.status(500).json({ message: 'Failed to fetch couriers', error: err.message });
	}
};

export default { listCouriers };


