const mongoose = require("mongoose");

const premiumSupportRequestSchema = new mongoose.Schema({
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: "freelancer", required: true, index: true },
  category: { type: String, trim: true, maxlength: 80, required: true },
  subject: { type: String, trim: true, maxlength: 120, required: true },
  message: { type: String, trim: true, maxlength: 3000, required: true },
  status: { type: String, enum: ["open", "replied"], default: "open", index: true },
  adminReply: { type: String, trim: true, maxlength: 3000, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("PremiumSupportRequest", premiumSupportRequestSchema);
