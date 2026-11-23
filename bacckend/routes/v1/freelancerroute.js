const { authFreelancer } = require("../../middleware/authMiddleWare");
const profileController = require("../../controllers/profilecontroller");
const premiumCvController = require("../../controllers/premiumCvController");
const premiumSupportController = require("../../controllers/premiumSupportController");

const { register, login , logout } = require("../../controllers/freelancercontroller");
const freelancerRouter = require("express").Router()


freelancerRouter.post("/register",register)
freelancerRouter.post("/login",login)
freelancerRouter.post("/logout",logout)


freelancerRouter.get("/profile", authFreelancer, profileController.freelancer.getProfile);
freelancerRouter.put("/profile", authFreelancer, profileController.freelancer.updateProfile);
freelancerRouter.post("/premium/cv-review", authFreelancer, premiumCvController.reviewCv);

module.exports = freelancerRouter
freelancerRouter.post("/premium/support", authFreelancer, premiumSupportController.createRequest);
freelancerRouter.get("/premium/support/mine", authFreelancer, premiumSupportController.listMyRequests);
