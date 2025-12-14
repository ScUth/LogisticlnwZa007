import { verifyAccessToken } from '../utils/jwt.js';
import jwt from 'jsonwebtoken';
import { Employee } from '../models/people.js';

// Generic auth middleware (fallback - checks all tokens)
export const auth = (req, res, next) => {
	const token = req.cookies.accessToken || req.cookies.employeeAccessToken || req.cookies.adminAccessToken;
	if (!token) {
		return res.status(401).json({ message: 'Access token is missing' });
	}
	try {
		const decoded = verifyAccessToken(token);
		req.auth = { id: decoded.id, type: decoded.type, role: decoded.role };
		next();
	} catch (error) {
		return res.status(401).json({ message: 'Invalid access token' });
	}
};

// Specific auth middleware for senders
export const authSender = (req, res, next) => {
	const token = req.cookies.accessToken;
	if (!token) {
		return res.status(401).json({ message: 'Sender access token is missing' });
	}
	try {
		const decoded = verifyAccessToken(token);
		if (decoded.type !== 'sender') {
			return res.status(403).json({ message: 'Sender only' });
		}
		req.auth = { id: decoded.id, type: decoded.type };
		next();
	} catch (error) {
		return res.status(401).json({ message: 'Invalid access token' });
	}
};

// Specific auth middleware for employees
export const authEmployee = (req, res, next) => {
	const token = req.cookies.employeeAccessToken;
	if (!token) {
		return res.status(401).json({ message: 'Employee access token is missing' });
	}
	try {
		const decoded = verifyAccessToken(token);
		if (decoded.type !== 'employee') {
			return res.status(403).json({ message: 'Employee only' });
		}
		req.auth = { id: decoded.id, type: decoded.type, role: decoded.role };
		next();
	} catch (error) {
		return res.status(401).json({ message: 'Invalid access token' });
	}
};

// Specific auth middleware for admins
export const authAdmin = (req, res, next) => {
	const token = req.cookies.adminAccessToken;
	if (!token) {
		return res.status(401).json({ message: 'Admin access token is missing' });
	}
	try {
		const decoded = verifyAccessToken(token);
		if (decoded.type !== 'admin') {
			return res.status(403).json({ message: 'Admin only' });
		}
		req.auth = { id: decoded.id, type: decoded.type };
		next();
	} catch (error) {
		return res.status(401).json({ message: 'Invalid access token' });
	}
};

// Legacy role-based middleware (kept for backward compatibility)
export const requireSender = (req, res, next) => {
	if (req.auth?.type !== "sender") {
		return res.status(403).json({ message: "Sender only" });
	}
	next();
};

export const requireEmployee = (req, res, next) => {
	if (req.auth?.type !== "employee") {
		return res.status(403).json({ message: "Employee only" });
	}
	next();
};

export const requireAdmin = (req, res, next) => {
	if (req.auth?.type !== "admin" && req.auth?.role !== "admin") {
		return res.status(403).json({ message: "Admin only" });
	}
	next();
};

export const authenticate = async (req, res, next) => {
	try {
		const token = req.header("Authorization")?.replace("Bearer ", "");

		if (!token) {
			return res.status(401).json({
				success: false,
				error: "No authentication token provided",
			});
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const employee = await Employee.findById(decoded.id).select("-password");

		if (!employee) {
			return res.status(401).json({
				success: false,
				error: "User not found",
			});
		}

		req.user = employee;
		req.token = token;
		next();
	} catch (error) {
		res.status(401).json({
			success: false,
			error: "Please authenticate",
		});
	}
};

export const authorizeCourier = (req, res, next) => {
	if (req.user.role !== "courier") {
		return res.status(403).json({
			success: false,
			error: "Access denied. Courier role required.",
		});
	}
	next();
};