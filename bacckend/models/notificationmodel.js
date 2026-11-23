const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
  role: { type: String, enum: ["admin", "client", "freelancer"], required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 140 },
  message: { type: String, required: true, trim: true, maxlength: 500 },
  link: { type: String, trim: true, default: "/notifications" },
  readAt: { type: Date, default: null, index: true },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, role: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
