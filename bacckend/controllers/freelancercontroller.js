const freelancerDb = require("../models/freelancermodel");
const { createToken } = require("../utilities/generatetoken");
const { hashPassword, comparePassword } = require("../utilities/passwordutilities");

const register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmpassword } = req.body;

    if (!name || !email || !phone || !password || !confirmpassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const freelancerExists = await freelancerDb.findOne({ email });

    if (freelancerExists) {
      return res.status(400).json({ message: "Freelancer already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const freelancer = await freelancerDb.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    const token = await createToken(freelancer._id, "freelancer");
    res.cookie("Freelancer_token", token, { httpOnly: true, sameSite: "lax" });

    return res.status(201).json({
      message: "Freelancer registered successfully",
      role: "freelancer",
    });
  } catch (error) {
    console.error(error);
    return res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const freelancer = await freelancerDb.findOne({ email });

    if (!freelancer) {
      return res.status(404).json({ message: "Freelancer not found" });
    }

   const passwordMatches = await comparePassword(password, freelancer.password);

    if (!passwordMatches) {
      return res.status(400).json({ message: "Password does not match" });
    }

    const token = await createToken(freelancer._id, "freelancer");
    res.cookie("Freelancer_token", token, { httpOnly: true, sameSite: "lax" });

    return res.status(200).json({
      message: "Freelancer logged in successfully",
      role: "freelancer",
      freelancer: { _id: freelancer._id, name: freelancer.name, email: freelancer.email },
    });
  } catch (error) {
    console.error(error);
    return res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("Freelancer_token");
    res.status(200).json({
      message: "logout successfull",
    });
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({
      error: error.message || "internal server error",
    });
  }
};
module.exports = { register, login, logout };
