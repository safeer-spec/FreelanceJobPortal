const jobRouter = require("express").Router();
const {create,listJobs,listMyJobs,adminListJobs,jobDetails,updateJob,adminUpdateJob,suggestJobEdit,reviewJob,deleteJob,adminDeleteJob,
} = require("../../controllers/jobcontroller");
const { authClient } = require("../../middleware/authMiddleWare");
const authAdmin = require("../../middleware/authAdmin");
const { applyToJob, updateFreelancerApplication, listFreelancerApplications, listClientApplications, updateApplicationStatus, submitWork, shareResumeWithClient, submitClientReview, listFreelancerReviews, listClientReviews } = require("../../controllers/applicationcontroller");
const { authFreelancer } = require("../../middleware/authMiddleWare");

// applications
jobRouter.get("/freelancer/applications", authFreelancer, listFreelancerApplications);
jobRouter.get("/freelancer/reviews", authFreelancer, listFreelancerReviews);
jobRouter.put("/freelancer/applications/:applicationId/submission", authFreelancer, submitWork);
jobRouter.put("/freelancer/applications/:applicationId", authFreelancer, updateFreelancerApplication);
jobRouter.put("/freelancer/applications/:applicationId/resume", authFreelancer, shareResumeWithClient);
jobRouter.post("/:jobId/apply", authFreelancer, applyToJob);
jobRouter.get("/client/applications", authClient, listClientApplications);
jobRouter.get("/client/reviews", authClient, listClientReviews);
jobRouter.post("/client/applications/:applicationId/review", authClient, submitClientReview);
jobRouter.patch("/client/applications/:applicationId/status", authClient, updateApplicationStatus);

// public
jobRouter.get("/list", listJobs);
jobRouter.get("/details/:jobId", jobDetails);

// client
jobRouter.post("/create", authClient, create);
jobRouter.get("/my-jobs", authClient, listMyJobs);
jobRouter.put("/update/:jobId", authClient, updateJob);
jobRouter.delete("/delete/:jobId", authClient, deleteJob);

// admin
jobRouter.get("/admin/list", authAdmin, adminListJobs);
jobRouter.put("/admin/update/:jobId", authAdmin, adminUpdateJob);
jobRouter.put("/admin/suggest/:jobId", authAdmin, suggestJobEdit);
jobRouter.patch("/admin/review/:jobId", authAdmin, reviewJob);
jobRouter.delete("/admin/delete/:jobId", authAdmin, adminDeleteJob);

module.exports = jobRouter;
