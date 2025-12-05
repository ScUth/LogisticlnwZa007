// authentication routes
import express from "express";
import {
  loginUser,
  registerUser,
  changePassword,
  getCurrentUser,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/change-password", changePassword);
router.post("/logout", authenticate, (req, res) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.status(200).json({ message: "Logged out successfully" });
});
router.get("/me", authenticate, getCurrentUser);

export default router;
