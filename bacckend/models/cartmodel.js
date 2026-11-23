const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  courses: [
    {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "courses",
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  totalprice: {
    type: Number,
    required: true,
    default: 0,
  },
});



module.exports = mongoose.model("carts", cartSchema);