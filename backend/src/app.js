import express from "express";
import cors from "cors";
import { compareAllHashes } from "./utils/hashComparison.js";

const app = express();
app.disable("x-powered-by");

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173", "http://localhost:3000", "http://localhost:3001"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());

// default route
app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/uploads", express.static("uploads"));


app.get("/api/system/hash-check", async (req, res) => {
  try {
    const report = await compareAllHashes();
    res.json({
      message: "Hash comparison completed",
      report
    });
  } catch (error) {
    res.status(500).json({
      message: "Error during hash comparison",
      error: error.message
    });
  }
});

export default app;


export const registerRoutes = async (app) => {
  const userRoutes = await import("./routes/userRoutes.js");
  const complaintRoutes = await import("./routes/complaintRoutes.js");
  const officialRoutes = await import("./routes/officialRoutes.js");
  const validationRoutes = await import("./routes/validationRoutes.js");
  const predictionRoutes = await import("./routes/predictionRoutes.js");
  const blockchainRoutes = await import("./routes/blockchainRoutes.js");
  
  app.use("/api/users", userRoutes.default);
  app.use("/api/complaints", complaintRoutes.default);
  app.use("/api/officials", officialRoutes.default);
  app.use("/api/validation", validationRoutes.default);
  app.use("/api", predictionRoutes.default);
  app.use("/api/blockchain", blockchainRoutes.default);
};