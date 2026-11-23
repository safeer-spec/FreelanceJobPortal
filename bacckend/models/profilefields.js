const mongoose = require("mongoose");

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: 120, default: "" },
    company: { type: String, trim: true, maxlength: 120, default: "" },
    location: { type: String, trim: true, maxlength: 120, default: "" },
    startDate: { type: String, trim: true, maxlength: 20, default: "" },
    endDate: { type: String, trim: true, maxlength: 20, default: "" },
    current: { type: Boolean, default: false },
    description: { type: String, trim: true, maxlength: 1200, default: "" },
  },
  { _id: true },
);

const educationSchema = new mongoose.Schema(
  {
    school: { type: String, trim: true, maxlength: 160, default: "" },
    degree: { type: String, trim: true, maxlength: 120, default: "" },
    field: { type: String, trim: true, maxlength: 120, default: "" },
    startDate: { type: String, trim: true, maxlength: 20, default: "" },
    endDate: { type: String, trim: true, maxlength: 20, default: "" },
    description: { type: String, trim: true, maxlength: 800, default: "" },
  },
  { _id: true },
);

module.exports = {
  profilePhoto: { type: String, default: "", maxlength: 3000000 },
  headline: { type: String, trim: true, maxlength: 160, default: "" },
  bio: { type: String, trim: true, maxlength: 2000, default: "" },
  location: { type: String, trim: true, maxlength: 120, default: "" },
  skills: { type: [String], default: [] },
  portfolioUrl: { type: String, trim: true, maxlength: 500, default: "" },
  websiteUrl: { type: String, trim: true, maxlength: 500, default: "" },
  linkedinUrl: { type: String, trim: true, maxlength: 500, default: "" },
  experience: { type: [experienceSchema], default: [] },
  education: { type: [educationSchema], default: [] },
  subscriptionPlan: { type: String, enum: ["free", "client-monthly", "client-yearly", "freelancer-premium"], default: "free" },
  subscriptionStatus: { type: String, enum: ["inactive", "active", "trialing", "past_due", "unpaid", "incomplete", "incomplete_expired", "paused", "canceled"], default: "inactive" },
  stripeCustomerId: { type: String, default: "", select: false },
  stripeSubscriptionId: { type: String, default: "", select: false },
};
