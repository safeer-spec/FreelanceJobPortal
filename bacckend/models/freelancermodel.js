const mongoose = require("mongoose");
const profileFields = require("./profilefields");
const freelancerSchema = new mongoose.Schema(
 {
    ...profileFields,
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    phone: {
      type : Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  
  {timestamps : true},
)


module.exports = mongoose.model("freelancer" , freelancerSchema)
