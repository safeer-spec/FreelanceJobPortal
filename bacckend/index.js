require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const apiRouter = require("./routes");
const paymentController = require("./controllers/paymentcontroller");
const cookieparser = require("cookie-parser");
const cors = require("cors");

const PORT = process.env.PORT || 8500;
const app = express();
const allowedOrigins = new Set([
  "http://localhost:5173",
  "https://freelancejobportalfrontend.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean).map((origin) => origin.replace(/\/+$/, "")));
const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin.replace(/\/+$/, ""))) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

app.get("/health", (_req, res) => {
  res.json({
    server: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

let databaseConnection;
async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGO_URL) throw new Error("MONGO_URL is not configured.");
  if (mongoose.connection.readyState !== 2 || !databaseConnection) {
    databaseConnection = mongoose.connect(process.env.MONGO_URL, { serverSelectionTimeoutMS: 10000 })
      .catch((error) => { databaseConnection = null; throw error; });
  }
  await databaseConnection;
}

app.use("/api", async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error("Database unavailable for API request:", error.message);
    res.status(503).json({ message: "The service is temporarily unavailable. Please try again shortly." });
  }
});

app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook,
);
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use("/api", apiRouter);

module.exports = app;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log("Server running on " + PORT);
    connectDatabase()
      .then(() => console.log("MongoDB connected"))
      .catch((error) => console.error("MongoDB connection failed:", error.message));
  });
}
