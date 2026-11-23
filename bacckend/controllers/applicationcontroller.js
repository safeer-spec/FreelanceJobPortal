const mongoose = require("mongoose");
const Application = require("../models/applicationmodel");
const Job = require("../models/jobmodel");
const Freelancer = require("../models/freelancermodel");
const Notification = require("../models/notificationmodel");

const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!mongoose.isValidObjectId(jobId)) {
      return res.status(400).json({ message: "Invalid job id." });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: "Job not found." });
    if (job.status !== "open") {
      return res.status(409).json({ message: "This job is no longer accepting applications." });
    }
    const existingApplication = await Application.findOne({ job: job._id, freelancer: req.freelancer });
    if (existingApplication) {
      return res.status(409).json({
        message: existingApplication.status === "pending"
          ? "You have already applied to this job."
          : `Your application was already ${existingApplication.status}.`,
        application: existingApplication,
      });
    }

    const bidAmount = req.body?.bidAmount === "" || req.body?.bidAmount == null ? Number(job.budget) : Number(req.body.bidAmount);
    const applicationNote = String(req.body?.applicationNote || "").trim();
    if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
      return res.status(400).json({ message: "Enter a valid bid amount greater than zero." });
    }
    if (applicationNote.length > 2000) return res.status(400).json({ message: "Your note must be 2,000 characters or fewer." });
    const application = await Application.create({
      job: job._id,
      freelancer: req.freelancer,
      status: "pending",
      bidAmount,
      applicationNote,
    });
    try { await Notification.create({ recipient: job.client, role: "client", title: "New freelancer application", message: `A freelancer applied for “${job.title}”.`, link: "/client" }); }
    catch (notificationError) { console.error("Could not create application notification:", notificationError); }
    return res.status(201).json({ message: "Application sent to the client.", application });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You have already applied to this job." });
    }
    console.error(error);
    return res.status(500).json({ message: error.message || "Could not submit application." });
  }
};

const updateFreelancerApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    if (!mongoose.isValidObjectId(applicationId)) return res.status(400).json({ message: "Invalid application id." });
    const application = await Application.findOne({ _id: applicationId, freelancer: req.freelancer }).populate("job", "status budget");
    if (!application) return res.status(404).json({ message: "Application not found." });
    if (application.status !== "pending" || application.job?.status !== "open") {
      return res.status(409).json({ message: "You can edit your bid and note only while the application is pending and the job is open." });
    }
    const bidAmount = req.body?.bidAmount === "" || req.body?.bidAmount == null ? Number(application.job.budget) : Number(req.body.bidAmount);
    const applicationNote = String(req.body?.applicationNote || "").trim();
    if (!Number.isFinite(bidAmount) || bidAmount <= 0) return res.status(400).json({ message: "Enter a valid bid amount greater than zero." });
    if (applicationNote.length > 2000) return res.status(400).json({ message: "Your note must be 2,000 characters or fewer." });
    application.bidAmount = bidAmount;
    application.applicationNote = applicationNote;
    await application.save();
    return res.status(200).json({ message: "Your application details were updated.", application });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Could not update your application." });
  }
};

const listFreelancerApplications = async (req, res) => {
  try {
    const applications = await Application.find({ freelancer: req.freelancer })
      .populate("job", "title category status image budget duration description skills")
      .populate("review.client", "name")
      .sort({ createdAt: -1 });
    return res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Could not load your applications." });
  }
};

const listClientApplications = async (req, res) => {
  try {
    const clientJobs = await Job.find({ client: req.client }).select("_id");
    const applications = await Application.find({ job: { $in: clientJobs.map((job) => job._id) } })
      .populate("job", "title category status client")
      .populate("freelancer", "name profilePhoto")
      .populate("review.client", "name")
      .sort({ createdAt: -1 });
    return res.status(200).json(applications);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Could not load job applications." });
  }
};

const shareResumeWithClient = async (req, res) => {
  try {
    const { applicationId } = req.params;
    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({ message: "Invalid application id." });
    }
    const application = await Application.findById(applicationId).populate("job", "client title");
    if (!application || !application.job) {
      return res.status(404).json({ message: "The job for this application is unavailable." });
    }
    if (application.freelancer.toString() !== req.freelancer) {
      return res.status(403).json({ message: "You can only share your resume for your own application." });
    }
    if (application.status === "rejected") {
      return res.status(409).json({ message: "You cannot share a resume for a rejected application." });
    }

    const profile = await Freelancer.findById(req.freelancer).select("name email phone profilePhoto headline bio location skills portfolioUrl websiteUrl linkedinUrl experience education");
    if (!profile) return res.status(404).json({ message: "Freelancer profile not found." });
    application.resumeSnapshot = {
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      profilePhoto: profile.profilePhoto,
      headline: profile.headline,
      bio: profile.bio,
      location: profile.location,
      skills: profile.skills,
      portfolioUrl: profile.portfolioUrl,
      websiteUrl: profile.websiteUrl,
      linkedinUrl: profile.linkedinUrl,
      experience: profile.experience,
      education: profile.education,
    };
    application.resumeSharedAt = new Date();
    await application.save();
    try { await Notification.create({ recipient: application.job.client, role: "client", title: "Freelancer shared a resume", message: `A freelancer shared their resume for “${application.job.title}”.`, link: "/client" }); }
    catch (notificationError) { console.error("Could not create resume notification:", notificationError); }
    return res.status(200).json({ message: "Your resume was sent to the client.", application });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Could not share your resume." });
  }
};

const submitClientReview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const rating = Number(req.body?.rating);
    const comment = typeof req.body?.comment === "string" ? req.body.comment.trim() : "";
    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({ message: "Invalid application id." });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Choose a rating from 1 to 5 stars." });
    }
    if (!comment || comment.length > 2000) {
      return res.status(400).json({ message: "Write a review of 1 to 2,000 characters." });
    }

    const application = await Application.findById(applicationId).populate("job", "client title");
    if (!application || !application.job) {
      return res.status(404).json({ message: "The job for this application is unavailable." });
    }
    if (application.job.client.toString() !== req.client) {
      return res.status(403).json({ message: "Only the client who posted this job can review this work." });
    }
    if (application.status !== "approved" || !application.submissionUrl) {
      return res.status(409).json({ message: "A review can be posted after approved work has been submitted." });
    }
    if (application.review?.client) {
      return res.status(409).json({ message: "You have already reviewed this work." });
    }

    application.review = { rating, comment, client: req.client, createdAt: new Date() };
    await application.save();
    try { await Notification.create({ recipient: application.freelancer, role: "freelancer", title: "New client review", message: `Your completed work for “${application.job.title}” received a client review.`, link: "/freelancer" }); }
    catch (notificationError) { console.error("Could not create review notification:", notificationError); }
    const saved = await Application.findById(application._id)
      .populate("job", "title")
      .populate("freelancer", "name profilePhoto")
      .populate("review.client", "name");
    return res.status(201).json({ message: "Your review was posted.", application: saved });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Could not post your review." });
  }
};

const listFreelancerReviews = async (req, res) => {
  try {
    const reviews = await Application.find({ freelancer: req.freelancer, "review.client": { $exists: true } })
      .populate("job", "title")
      .populate("review.client", "name")
      .sort({ "review.createdAt": -1 });
    return res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Could not load freelancer reviews." });
  }
};

const listClientReviews = async (req, res) => {
  try {
    const reviews = await Application.find({ "review.client": req.client })
      .populate("job", "title")
      .populate("freelancer", "name profilePhoto")
      .populate("review.client", "name")
      .sort({ "review.createdAt": -1 });
    return res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Could not load your reviews." });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body || {};
    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({ message: "Invalid application id." });
    }
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Choose approve or reject for this application." });
    }

    const application = await Application.findById(applicationId).populate("job", "client status title");
    if (!application || !application.job) {
      return res.status(404).json({ message: "Application or job not found." });
    }
    if (application.job.client.toString() !== req.client) {
      return res.status(403).json({ message: "You can only review applications for your own jobs." });
    }
    if (application.status !== "pending") {
      return res.status(409).json({ message: "This application has already been reviewed." });
    }
    if (status === "approved" && application.job.status !== "open") {
      return res.status(409).json({ message: "This job is no longer open for approval." });
    }

    application.status = status;
    await application.save();
    if (status === "approved") {
      await Job.findByIdAndUpdate(application.job._id, { status: "in-progress" });
    }
    try { await Notification.create({ recipient: application.freelancer, role: "freelancer", title: `Application ${status}`, message: `Your application for “${application.job.title}” was ${status} by the client.`, link: "/freelancer" }); }
    catch (notificationError) { console.error("Could not create application review notification:", notificationError); }
    return res.status(200).json({ message: `Application ${status}.`, application });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Could not review application." });
  }
};


const submitWork = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { submissionUrl, submissionNote = "" } = req.body || {};
    if (!mongoose.isValidObjectId(applicationId)) {
      return res.status(400).json({ message: "Invalid application id." });
    }
    if (typeof submissionUrl !== "string" || !submissionUrl.trim()) {
      return res.status(400).json({ message: "Add a link to your completed work." });
    }

    let parsedUrl;
    try { parsedUrl = new URL(submissionUrl.trim()); }
    catch { return res.status(400).json({ message: "Enter a valid work link." }); }
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({ message: "Work links must start with http:// or https://." });
    }
    if (typeof submissionNote !== "string" || submissionNote.trim().length > 2000) {
      return res.status(400).json({ message: "The delivery note must be 2,000 characters or fewer." });
    }

    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).json({ message: "Application not found." });
    if (application.freelancer.toString() !== req.freelancer) {
      return res.status(403).json({ message: "You can only submit work for your own application." });
    }
    if (application.status !== "approved") {
      return res.status(409).json({ message: "You can submit work after the client approves your application." });
    }

    application.submissionUrl = parsedUrl.toString();
    application.submissionNote = submissionNote.trim();
    application.submittedAt = new Date();
    await application.save();
    try {
      const job = await Job.findById(application.job).select("client title").lean();
      if (job) await Notification.create({ recipient: job.client, role: "client", title: "Work submitted", message: `A freelancer submitted work for “${job.title}”.`, link: "/client" });
    } catch (notificationError) { console.error("Could not create work submission notification:", notificationError); }
    return res.status(200).json({ message: "Your work link was sent to the client.", application });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Could not submit your work." });
  }
};

module.exports = {
  applyToJob,
  updateFreelancerApplication,
  listFreelancerApplications,
  listClientApplications,
  updateApplicationStatus,
  submitWork,
  shareResumeWithClient,
  submitClientReview,
  listFreelancerReviews,
  listClientReviews,
};


