const authAdmin = require("../../middleware/authAdmin");
const profileController = require("../../controllers/profilecontroller");
const premiumSupportController = require("../../controllers/premiumSupportController");

const {register, login, logout, dashboardStats} = require("../../controllers/admincontroller")
const adminRouter = require("express").Router()


adminRouter.post("/register",register)
adminRouter.post("/login",login)
adminRouter.post("/logout",logout)
adminRouter.get("/dashboard-stats", authAdmin, dashboardStats);


adminRouter.get("/profile", authAdmin, profileController.admin.getProfile);
adminRouter.put("/profile", authAdmin, profileController.admin.updateProfile);

module.exports = adminRouter

adminRouter.get("/premium-support", authAdmin, premiumSupportController.listAdminRequests);
adminRouter.patch("/premium-support/:requestId", authAdmin, premiumSupportController.replyToRequest);
