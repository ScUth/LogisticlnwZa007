import { verifyAccessToken } from '../utils/jwt.js';

export const auth = (req, res, next) => {
	// Check for both sender and employee tokens
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
	if (req.auth?.role !== "admin") {
		return res.status(403).json({ message: "Admin only" });
	}
	next();
};

