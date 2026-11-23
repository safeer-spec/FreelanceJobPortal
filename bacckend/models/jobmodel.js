const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
      minlength: 5,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, "description is required"],
      trim: true,
      minlength: 20,
    },
    budget: {
      type: Number,
      required: true,
    },

    duration: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "General",
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    adminSuggestion: {
      type: String,
      trim: true,
      default: "",
    },
    adminSuggestedAt: {
      type: Date,
      default: null,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "client",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["open", "in-progress", "completed", "closed"],
      default: "open",
    },
    moderationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ moderationStatus: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Job", jobSchema);
