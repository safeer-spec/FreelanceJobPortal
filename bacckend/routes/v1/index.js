const adminRouter = require("./adminroute");
const clientRouter = require("./clientroute");
const freelancerRouter = require("./freelancerroute");
const jobRouter = require("./jobroutes");
const paymentRouter = require("./paymentroutes");
const notificationRouter = require("./notificationroutes");

const v1Router = require("express").Router();

v1Router.use("/client", clientRouter);
v1Router.use("/admin", adminRouter);
v1Router.use("/freelancer", freelancerRouter);
v1Router.use("/job", jobRouter);
v1Router.use("/payment", paymentRouter);
v1Router.use("/notifications", notificationRouter);

module.exports = v1Router;

