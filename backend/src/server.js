import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import pickupRequestRoutes from "./routes/pickupRequestRoutes.js";
import pickupRequestItemRoutes from "./routes/pickupRequestItemRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import courierRoutes from "./routes/courierRoutes.js";
import InitializeDatabaseStructures from "./seed/seed.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://192.168.1.90:4060",
      "http://kumtho.trueddns.com:33860",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const RETRY_MS = 30000;
let db_status = false;

const RESET_SEED_DATA = process.env.RESET_SEED_DATA === "true" || true;

// basic test route
app.get("/api/health", (req, res) => {
  res.send({ backend: true, database: db_status });
});

// Auth routes
app.use("/api/auth", authRoutes);

// Pickup Request routes
app.use("/api/pickup-requests", pickupRequestRoutes);

// Pickup Request Item routes
app.use("/api/pickup-request-items", pickupRequestItemRoutes);

// Location routes
app.use("/api/locations", locationRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

// Courier routes
app.use("/api/courier", courierRoutes);

// connect DB + start
const PORT = process.env.PORT || 4826;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/dbproject";

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
  db_status = true;

  if (RESET_SEED_DATA) {
    try {
      InitializeDatabaseStructures().then(() => {
        console.log("Database structures initialized");
      });
    } catch (err) {
      console.error("Error initializing database structures:", err.message);
    }
  }
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected");
  db_status = false;
  setTimeout(connectWithRetry, RETRY_MS);
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB error:", err.message);
});

const connectWithRetry = async () => {
  console.log("Connecting to MongoDB...");
  try {
    await mongoose.connect(MONGO_URI);
  } catch (err) {
    console.error(
      `Mongo connect failed. Retrying in ${RETRY_MS / 1000}s...`,
      err.message
    );
    setTimeout(connectWithRetry, RETRY_MS);
  }
};

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
connectWithRetry();
