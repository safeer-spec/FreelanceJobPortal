const mongoose = require("mongoose");
const cartDb = require("../models/cartmodel");
const courseDb = require("../models/coursemodel");

const addToCart = async (req, res) => {
  try {
    const userId = req.user;
    const courseId = req.params.courseId;

    if (!userId) {
      return res.status(401).json({ message: "Please log in" });
    }
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: "Invalid course id" });
    }

    const course = await courseDb.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "course not found" });
    }

    let cart = await cartDb.findOne({ userId });
    if (!cart) {
      cart = new cartDb({ userId, courses: [], totalprice: 0 });
    }

    const alreadyAdded = cart.courses.some(
      (item) => String(item.courseId) === String(course._id),
    );
    if (alreadyAdded) {
      return res.status(409).json({ message: "course already in cart", cart });
    }

    cart.courses.push({ courseId: course._id, price: course.price });
    cart.totalprice = cart.courses.reduce((sum, item) => sum + item.price, 0);
    await cart.save();

    return res.status(200).json({ message: "added to cart", cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message || "internal server error",
    });
  }
};

module.exports = { addToCart }