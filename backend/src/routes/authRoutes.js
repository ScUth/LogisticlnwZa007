// authentication routes
import express from "express";
import {
  loginUser,
  registerUser,
  changePassword,
  getCurrentUser,
  loginEmployee,
  registerEmployee,
  getCurrentEmployee,
  loginAdmin,
  getCurrentAdmin,
} from "../controllers/authController.js";
import { auth, requireSender, requireEmployee, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

// sender auth routes
router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/change-password", changePassword);
router.post("/logout", auth, (req, res) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
});
router.get("/me", auth, requireSender, getCurrentUser);

// employee auth routes
router.post("/employee/login", loginEmployee);
router.post("/employee/register", registerEmployee);
router.post("/employee/logout", auth, (req, res) => {
  res.clearCookie("employeeAccessToken");
  res.clearCookie("employeeRefreshToken");
  res.status(200).json({ message: "Logged out successfully" });
});
router.get("/employee/me", auth, requireEmployee, getCurrentEmployee);

// admin auth routes
router.post("/admin/login", loginAdmin);
router.post("/admin/logout", auth, (req, res) => {
  res.clearCookie("adminAccessToken");
  res.clearCookie("adminRefreshToken");
  res.status(200).json({ message: "Logged out successfully" });
});
router.get("/admin/me", auth, requireAdmin, getCurrentAdmin);

export default router;
