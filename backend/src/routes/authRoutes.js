// authentication routes
import express from "express";
import {
  loginUser,
  registerUser,
  changePassword,
  logoutUser,
  getCurrentUser,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/change-password", changePassword);
router.post("/logout", logoutUser);
router.get("/me", authenticate, getCurrentUser);

export default router;
