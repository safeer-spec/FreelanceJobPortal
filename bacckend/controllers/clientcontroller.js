const clientDb = require("../models/clientmodel");;
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

    const clientExists = await clientDb.findOne({ email });

    if (clientExists) {
      return res.status(400).json({ message: "client already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const mewClient = new clientDb({
      name,
      email,
      phone,
      password: hashedPassword,
    });

    const saved = await mewClient.save();

    if (saved) {
      const token = await createToken(saved._id, "client");
      res.cookie("Client_token", token, { httpOnly: true, sameSite: "lax" });
      return res.status(200).json({
        message: "user registered successfully",
      });
    }
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

    const clientExists = await clientDb.findOne({ email });

    if (!clientExists) {
      return res.status(400).json({ message: "client not found" });
    }

    const passwordMatch = await comparePassword(
      password,
      clientExists.password,
    );
    console.log(passwordMatch);

    if (!passwordMatch) {
      return res.status(400).json({ message: "Password does not match" });
    }

const token = await createToken(clientExists._id, "client");
res.cookie("Client_token", token, { httpOnly: true, sameSite: "lax" });

    return res.status(200).json({
      message: "client logged in successfully",
      role: "client",
      client: { _id: clientExists._id, name: clientExists.name, email: clientExists.email },
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
    res.clearCookie("Client_token");
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
