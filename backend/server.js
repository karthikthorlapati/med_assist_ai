import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import triageRoutes from "./routes/triage.js";
import hospitalRoutes from "./routes/hospitals.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ status: "MedAssist AI backend is running" });
});

app.use("/api/triage", triageRoutes);
app.use("/api/hospitals", hospitalRoutes);

if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("MongoDB connection error (continuing without DB):", err);
    });
} else {
  console.log("No MONGODB_URI set — running without session logging.");
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
