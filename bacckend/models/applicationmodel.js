const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "freelancer",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    bidAmount: { type: Number, min: 0, default: null },
    applicationNote: { type: String, trim: true, maxlength: 2000, default: "" },
    submissionUrl: { type: String, trim: true, maxlength: 2000, default: "" },
    submissionNote: { type: String, trim: true, maxlength: 2000, default: "" },
    submittedAt: { type: Date, default: null },
    resumeSharedAt: { type: Date, default: null },
    resumeSnapshot: { type: mongoose.Schema.Types.Mixed, default: null },
    review: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, trim: true, maxlength: 2000 },
      client: { type: mongoose.Schema.Types.ObjectId, ref: "client" },
      createdAt: { type: Date },
    },
  },
  { timestamps: true },
);

applicationSchema.index({ job: 1, freelancer: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
