const { addToCart } = require("../../controllers/cartcontrollers")
const authUser = require("../../middleware/authUser")

const cartRouter = require("express").Router()

cartRouter.post("/addtocart/:courseId",authUser,addToCart)

module.exports = cartRouter