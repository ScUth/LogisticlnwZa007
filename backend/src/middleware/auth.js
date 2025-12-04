import { verifyAccessToken } from '../utils/jwt.js';

export const authenticate = (req, res, next) => {
	// cookie
	const token = req.cookies.accessToken;
	if (!token) {
		return res.status(401).json({ message: 'Access token is missing' });
	}
	try {
		const user = verifyAccessToken(token);
		req.userId = user.id;
		next();
	} catch (error) {
		return res.status(401).json({ message: 'Invalid access token' });
	}
};
