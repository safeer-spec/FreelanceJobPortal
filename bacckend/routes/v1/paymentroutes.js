const paymentRouter = require("express").Router();
const { authClient, authFreelancer } = require("../../middleware/authMiddleWare");
const paymentController = require("../../controllers/paymentcontroller");

paymentRouter.post("/checkout/client", authClient, paymentController.createClientCheckout);
paymentRouter.post("/checkout/freelancer", authFreelancer, paymentController.createFreelancerCheckout);
paymentRouter.get("/session/client/:sessionId", authClient, paymentController.verifyClientCheckout);
paymentRouter.get("/session/freelancer/:sessionId", authFreelancer, paymentController.verifyFreelancerCheckout);
paymentRouter.post("/portal/client", authClient, paymentController.createClientPortal);
paymentRouter.post("/portal/freelancer", authFreelancer, paymentController.createFreelancerPortal);

module.exports = paymentRouter;
