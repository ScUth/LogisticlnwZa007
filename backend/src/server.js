import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://192.168.1.90:4060",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const RETRY_MS = 30000;
let db_status = false;

// basic test route
app.get("/api/health", (req, res) => {
    res.send({ backend: true, database: db_status });
});

// Auth routes
app.use("/api/auth", authRoutes);

// connect DB + start
const PORT = process.env.PORT || 4826;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dbproject";

mongoose.connection.on("connected", () => {
    console.log("MongoDB connected")
    db_status = true;
})

mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
    db_status = false;
    setTimeout(connectWithRetry, RETRY_MS);
})

mongoose.connection.on("error", (err) => {
    console.error("MongoDB error:", err.message);
})


const connectWithRetry = async () => {
    console.log("Connecting to MongoDB...");
    try {
        await mongoose.connect(MONGO_URI);
    } catch (err) {
        console.error(`Mongo connect failed. Retrying in ${RETRY_MS / 1000}s...`, err.message);
        setTimeout(connectWithRetry, RETRY_MS);
    }
};

app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
connectWithRetry();
