require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const apiRouter = require("./routes");
const paymentController = require("./controllers/paymentcontroller");
const cookieparser = require("cookie-parser");
const cors = require("cors");

const PORT = process.env.PORT || 8500;
const app = express();
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "https://freelancejobportalfrontend.vercel.app",
  ],
  credentials: true,
}));

app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleWebhook,
);
app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());
app.use("/api", apiRouter);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB connected successfully"))
  .catch((error) => console.error("Database connection failed:", error));

app.listen(PORT, () => console.log("Server running on " + PORT));
