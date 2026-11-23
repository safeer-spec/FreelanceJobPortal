const adminDb = require("../models/adminmodel");
const Client = require("../models/clientmodel");
const Freelancer = require("../models/freelancermodel");
const { createToken } = require("../utilities/generatetoken");
const {
  hashPassword,
  comparePassword,
} = require("../utilities/passwordutilities");

const register = async (req, res) => {
  try {
    const { name, email, phone, password, confirmpassword } = req.body;

    if (!name || !email || !phone || !password || !confirmpassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const adminExists = await adminDb.findOne({ email });

    if (adminExists) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const admin = await adminDb.create({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    const token = await createToken(admin._id, "admin");
    res.cookie("Admin_token", token, { httpOnly: true, sameSite: "lax" });

    const saved = await admin.save();

    if (saved) {
      return res.status(200).json({
        message: "admin created",
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
        },
      });
    }
    return res.status(201).json({ message: "Admin registered successfully" });
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

    const adminExists = await adminDb.findOne({ email });

    if (!adminExists) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const passwordMatches = await comparePassword(
      password,
      adminExists.password,
    );

    if (!passwordMatches) {
      return res.status(400).json({ message: "Password does not match" });
    }
    const token = await createToken(adminExists._id, "admin");
    res.cookie("Admin_token", token, { httpOnly: true, sameSite: "lax" });

    return res.status(200).json({
      message: "Admin logged in successfully",
      role: "admin",
      admin: {
        _id: adminExists._id,
        name: adminExists.name,
        email: adminExists.email,
      },
    });
  } 
  catch (error) {
    console.error(error);
    return res.status(error.status || 500).json({
      error: error.message || "Internal server error",
    });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("Admin_token");
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

const dashboardStats = async (_req, res) => {
  try {
    const [freelancers, clients] = await Promise.all([
      Freelancer.countDocuments(),
      Client.countDocuments(),
    ]);
    return res.status(200).json({ freelancers, clients });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || "Could not load dashboard stats." });
  }
};

module.exports = { register, login, logout, dashboardStats };
