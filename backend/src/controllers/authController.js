import express from 'express';
import bcrypt from 'bcrypt';
import { Sender, Recipient, Courier } from '../models/people.js';
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from '../utils/jwt.js';
import { parseTtlToMs, addMsToCurrentTime } from "../utils/time.js";

// set base cookie and function, access & refresh
const baseCookieOptions = {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax',
	path: '/',
};

const access_ttl = parseTtlToMs('7d');
const refresh_ttl = parseTtlToMs('90d');

const setAuthCookies = (res, accessToken, refreshToken) => {
	res.cookie('accessToken', accessToken, {
		...baseCookieOptions, maxAge: access_ttl, // 7 days
	});
	res.cookie('refreshToken', refreshToken, {
		...baseCookieOptions, maxAge: refresh_ttl, // 90 days
	});
}

// Function to handle user registration
export const registerUser = async (req, res) => {
	try {
		const { first_name, last_name, phone, password, password_confirmation } = req.body;

		// Check if user already exists
		const existingUser = await Sender.findOne({ phone });
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' });
		}

		// Hash the password
		if (password !== password_confirmation) {
			return res.status(400).json({ message: 'Passwords do not match' });
		}
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create new user
		const newUser = new Sender({
			first_name: first_name,
			last_name: last_name,
			phone: phone,
			password: hashedPassword
		});

		await newUser.save();
		res.status(201).json({ status: "OK", message: 'User registered successfully' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// Function to handle user login
export const loginUser = async (req, res) => {
	try {
		const { phone, password } = req.body;

		// Find user by phone
		const user = await Sender.findOne({ phone }).select('+password');
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		// Compare passwords
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}
		// Generate JWT token
		const payload = { id: user._id.toString() };

		const token = generateAccessToken(payload);
		const refreshToken = generateRefreshToken(payload);

		// send cookie
		setAuthCookies(res, token, refreshToken);

		res.status(200).json({ status: "OK", message: 'User logged in successfully', user: { id: user._id, first_name: user.first_name, last_name: user.last_name } });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// Function to handle user change password (no authentication required)
export const changePassword = async (req, res) => {
	try {
		const { phone, oldPassword, newPassword } = req.body;
		// Find user by phone
		const user = await Sender.findOne({ phone }).select('+password');
		if (!user) {
			return res.status(400).json({ message: 'User not found' });
		}
		// Compare old passwords
		const isMatch = await bcrypt.compare(oldPassword, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Old password is incorrect' });
		}
		// Hash the new password
		const hashedNewPassword = await bcrypt.hash(newPassword, 10);
		user.password = hashedNewPassword;
		await user.save();
		res.status(200).json({ message: 'Password changed successfully' });

	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

// Function to get current user info
export const getCurrentUser = async (req, res) => {
	try {
		const user = await Sender.findById(req.userId).select('-password');
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(200).json({ user });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};