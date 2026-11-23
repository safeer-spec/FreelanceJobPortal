const Freelancer = require("../models/freelancermodel");
const PremiumSupportRequest = require("../models/premiumSupportRequest");

async function requirePremium(freelancerId) {
  const account = await Freelancer.findById(freelancerId).select("subscriptionPlan subscriptionStatus");
  return Boolean(account && account.subscriptionPlan === "freelancer-premium" && ["active", "trialing"].includes(account.subscriptionStatus));
}

async function createRequest(req, res) {
  try {
    if (!await requirePremium(req.freelancer)) return res.status(403).json({ message: "An active Premium Career subscription is required." });
    const category = String(req.body?.category || "").trim().slice(0, 80);
    const subject = String(req.body?.subject || "").trim().slice(0, 120);
    const message = String(req.body?.message || "").trim().slice(0, 3000);
    if (!category || !subject || message.length < 10) return res.status(400).json({ message: "Choose a topic and add a subject and message of at least 10 characters." });
    const request = await PremiumSupportRequest.create({ freelancer: req.freelancer, category, subject, message });
    return res.status(201).json({ request: { _id: request._id, category, subject, message, status: request.status, createdAt: request.createdAt } });
  } catch (error) {
    console.error("Could not create Premium support request:", error.message);
    return res.status(500).json({ message: "Could not send your request." });
  }
}

async function listMyRequests(req, res) {
  try {
    if (!await requirePremium(req.freelancer)) return res.status(403).json({ message: "An active Premium Career subscription is required." });
    const requests = await PremiumSupportRequest.find({ freelancer: req.freelancer }).sort({ createdAt: -1 }).lean();
    return res.json({ requests });
  } catch (error) {
    console.error("Could not load Premium support requests:", error.message);
    return res.status(500).json({ message: "Could not load your requests." });
  }
}

async function listAdminRequests(req, res) {
  try {
    const requests = await PremiumSupportRequest.find().populate("freelancer", "name email").sort({ createdAt: -1 }).lean();
    return res.json({ requests });
  } catch (error) {
    console.error("Could not load Premium support inbox:", error.message);
    return res.status(500).json({ message: "Could not load the support inbox." });
  }
}

async function replyToRequest(req, res) {
  try {
    const reply = String(req.body?.reply || "").trim().slice(0, 3000);
    if (reply.length < 3) return res.status(400).json({ message: "Add a reply of at least 3 characters." });
    const request = await PremiumSupportRequest.findByIdAndUpdate(req.params.requestId, { adminReply: reply, status: "replied" }, { new: true });
    if (!request) return res.status(404).json({ message: "Support request not found." });
    return res.json({ message: "Reply saved.", request: { _id: request._id, status: request.status, adminReply: request.adminReply } });
  } catch (error) {
    console.error("Could not reply to Premium support request:", error.message);
    return res.status(500).json({ message: "Could not save the reply." });
  }
}

module.exports = { createRequest, listMyRequests, listAdminRequests, replyToRequest };
