const jobDb = require("../models/jobmodel");
const Application = require("../models/applicationmodel");
const Admin = require("../models/adminmodel");
const Notification = require("../models/notificationmodel");

// keeps only the fields that were actually sent in the request body
const pickUpdates = (body) => {
  const { title, description, budget, duration, skills, category, status, image } = body || {};
  const updates = { title, description, budget, duration, skills, category, status, image };
  Object.keys(updates).forEach(
    (key) => updates[key] === undefined && delete updates[key],
  );
  return updates;
};

// CLIENT: post a new job (route protected by authClient -> req.client)
const create = async (req, res) => {
  try {
    const { title, description, budget, duration, skills, category, image } = req.body || {};

    if (!title || !description || !budget || !duration) {
      return res.status(400).json({
        message: "title, description, budget and duration are required",
      });
    }

    const newJob = new jobDb({
      title,
      description,
      budget,
      duration,
      skills, // array of strings, e.g. ["react", "node"]
      category,
      image,
      client: req.client, // set from the auth middleware, never from req.body
    });

    const savedJob = await newJob.save();
    try {
      const admins = await Admin.find().select("_id").lean();
      if (admins.length) await Notification.insertMany(admins.map((admin) => ({ recipient: admin._id, role: "admin", title: "Job needs review", message: `A client submitted â€œ${savedJob.title}â€ for approval.`, link: "/admin" })));
    } catch (notificationError) { console.error("Could not create job submission notification:", notificationError); }

    return res.status(201).json({
      message: "Job submitted for admin review. It will be listed after approval.",
      savedJob,
    });
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({
      error: error.message || "internal server error",
    });
  }
};

// PUBLIC / FREELANCER: list all open jobs
const listJobs = async (req, res) => {
  try {
    const jobList = await jobDb
      .find({
        status: "open",
        $or: [{ moderationStatus: "approved" }, { moderationStatus: { $exists: false } }],
      })
      .populate("client", "name") // adjust to your client model's fields
      .sort({ createdAt: -1 });

    res.status(200).json(jobList);
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({
      error: error.message || "internal server error",
    });
  }
};

// CLIENT: list only the jobs this client posted
const listMyJobs = async (req, res) => {
  try {
    const jobList = await jobDb.find({ client: req.client }).sort({ createdAt: -1 });
    res.status(200).json(jobList);
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({
      error: error.message || "internal server error",
    });
  }
};

// ADMIN: list every job (all statuses) for moderation
const adminListJobs = async (req, res) => {
  try {
    const jobList = await jobDb
      .find()
      .populate("client", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(jobList);
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({
      error: error.message || "internal server error",
    });
  }
};

// PUBLIC / FREELANCER: single job details
const jobDetails = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await jobDb.findOne({
      _id: jobId,
      $or: [{ moderationStatus: "approved" }, { moderationStatus: { $exists: false } }],
    }).populate("client", "name");
    if (!job) {
      return res.status(404).json({
        message: "job not found",
      });
    }

    return res.status(200).json(job);
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({
      error: error.message || "internal server error",
    });
  }
};

// CLIENT: update own job
const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await jobDb.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "job not found",
      });
    }


    if (job.client.toString() !== req.client) {
      return res.status(403).json({
        message: "you can only update your own jobs",
      });
    }

    const updatedJob = await jobDb.findByIdAndUpdate(jobId, {
      ...pickUpdates(req.body),
      moderationStatus: "pending",
      adminSuggestion: "",
      adminSuggestedAt: null,
    }, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ message: "job updated", updatedJob });
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({
      error: error.message || "internal server error",
    });
  }
};


const suggestJobEdit = async (req, res) => {
  try {
    const suggestion = String(req.body?.suggestion || "").trim();
    if (!suggestion) {
      return res.status(400).json({ message: "Please enter an edit suggestion." });
    }
    if (suggestion.length > 3000) {
      return res.status(400).json({ message: "Suggestion must be 3000 characters or fewer." });
    }
    const updatedJob = await jobDb.findByIdAndUpdate(
      req.params.jobId,
      { adminSuggestion: suggestion, adminSuggestedAt: new Date() },
      { new: true, runValidators: true },
    );
    if (!updatedJob) return res.status(404).json({ message: "job not found" });
    return res.status(200).json({ message: "Edit suggestion sent to the client.", updatedJob });
  } catch (error) {
    return res.status(error.status || 500).json({ error: error.message || "internal server error" });
  }
};


const adminUpdateJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const updatedJob = await jobDb.findByIdAndUpdate(jobId, pickUpdates(req.body), {
      new: true,
      runValidators: true,
    });

    if (!updatedJob) {
      return res.status(404).json({
        message: "job not found",
      });
    }

    res.status(200).json({ message: "job updated by admin", updatedJob });
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({
      error: error.message || "internal server error",
    });
  }
};

const reviewJob = async (req, res) => {
  try {
    const { decision } = req.body || {};
    if (!["approved", "rejected"].includes(decision)) {
      return res.status(400).json({ message: "Choose approve or reject for this job." });
    }
    const updatedJob = await jobDb.findOneAndUpdate(
      { _id: req.params.jobId, moderationStatus: "pending" },
      { moderationStatus: decision },
      { new: true, runValidators: true },
    ).populate("client", "name");
    if (updatedJob) {
      try {
        await Notification.create({ recipient: updatedJob.client._id, role: "client", title: `Job ${decision}`, message: `Your job â€œ${updatedJob.title}â€ was ${decision} by the admin.`, link: "/client" });
      } catch (notificationError) { console.error("Could not create job review notification:", notificationError); }
      return res.status(200).json({ message: `Job ${decision}.`, updatedJob });
    }
    const job = await jobDb.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found." });
    return res.status(409).json({ message: "Only jobs waiting for review can be approved or rejected." });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message || "Could not review job." });
  }
};



const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await jobDb.findById(jobId);
    if (!job) {
      return res.status(404).json({
        message: "job not found",
      });
    }

    if (job.client.toString() !== req.client) {
      return res.status(403).json({
        message: "you can only delete your own jobs",
      });
    }

    await job.deleteOne();
    await Application.deleteMany({ job: job._id });

    return res.status(200).json({
      message: "job deleted",
    });
  } catch (error) {
    console.error(error);
    return res.status(error.status || 500).json({
      error: error.message || "internal server error",
    });
  }
};


const adminDeleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const deletedJob = await jobDb.findByIdAndDelete(jobId);
    if (!deletedJob) {
      return res.status(404).json({
        message: "job not found",
      });
    }
    await Application.deleteMany({ job: deletedJob._id });

    return res.status(200).json({
      message: "job deleted by admin",
    });
  } catch (error) {
    console.error(error);
    return res.status(error.status || 500).json({
      error: error.message || "internal server error",
    });
  }
};

module.exports = {
  create,
  listJobs,
  listMyJobs,
  adminListJobs,
  jobDetails,
  updateJob,
  adminUpdateJob,
  suggestJobEdit,
  reviewJob,
  deleteJob,
  adminDeleteJob,
};


