const { authClient } = require("../../middleware/authMiddleWare");
const profileController = require("../../controllers/profilecontroller");

const {register, login , logout} = require("../../controllers/clientcontroller")
const clientRouter = require("express").Router()


clientRouter.post("/register",register)
clientRouter.post("/login",login)
clientRouter.post("/logout" , logout)

clientRouter.get("/profile", authClient, profileController.client.getProfile);
clientRouter.put("/profile", authClient, profileController.client.updateProfile);

module.exports = clientRouter