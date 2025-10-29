import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:4060",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// basic test route
app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
});

// connect DB + start
const PORT = process.env.PORT || 4826;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dbproject";

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log("Mongo connected");
        app.listen(PORT, () => {
        console.log("API running on port", PORT);
        });
    })
    .catch(err => {
        console.error("DB connection error:", err);
        process.exit(1);
    });
