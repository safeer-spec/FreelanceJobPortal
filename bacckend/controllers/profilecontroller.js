const freelancerDb = require("../models/freelancermodel");
const clientDb = require("../models/clientmodel");
const adminDb = require("../models/adminmodel");

const createProfileHandlers = (model, requestKey) => {
  const getProfile = async (req, res) => {
    try {
      const profile = await model.findById(req[requestKey]).select("-password -stripeCustomerId -stripeSubscriptionId");
      if (!profile) return res.status(404).json({ message: "Account not found." });
      return res.status(200).json(profile);
    } catch (error) {
      return res.status(500).json({ message: error.message || "Could not load profile." });
    }
  };

  const updateProfile = async (req, res) => {
    try {
      const body = req.body || {};
      const updates = {};
      ["name", "email", "phone", "headline", "bio", "location", "portfolioUrl", "websiteUrl", "linkedinUrl"]
        .forEach((key) => {
          if (body[key] !== undefined) updates[key] = typeof body[key] === "string" ? body[key].trim() : body[key];
        });

      if (updates.email) updates.email = updates.email.toLowerCase();
      if (updates.phone !== undefined) {
        const phone = String(updates.phone).replace(/[^0-9+]/g, "");
        if (!phone || phone.length > 20) return res.status(400).json({ message: "Enter a valid phone number." });
        updates.phone = Number(phone.replace(/\D/g, ""));
      }
      if (body.profilePhoto !== undefined) {
        if (body.profilePhoto && !/^data:image\/(png|jpeg|webp);base64,/i.test(body.profilePhoto)) {
          return res.status(400).json({ message: "Upload a PNG, JPEG, or WebP profile photo." });
        }
        if (body.profilePhoto.length > 3000000) {
          return res.status(413).json({ message: "Profile photos must be smaller than 2 MB." });
        }
        updates.profilePhoto = body.profilePhoto;
      }
      if (body.skills !== undefined) {
        if (!Array.isArray(body.skills)) return res.status(400).json({ message: "Skills must be a list." });
        updates.skills = body.skills.slice(0, 30).map((skill) => String(skill).trim().slice(0, 60)).filter(Boolean);
      }
      for (const key of ["experience", "education"]) {
        if (body[key] !== undefined) {
          if (!Array.isArray(body[key])) return res.status(400).json({ message: `${key} must be a list.` });
          updates[key] = body[key].slice(0, 20);
        }
      }

      const profile = await model.findByIdAndUpdate(req[requestKey], updates, {
        new: true,
        runValidators: true,
      }).select("-password -stripeCustomerId -stripeSubscriptionId");
      if (!profile) return res.status(404).json({ message: "Account not found." });
      return res.status(200).json({ message: "Profile updated.", profile });
    } catch (error) {
      if (error.code === 11000) return res.status(409).json({ message: "That email address is already in use." });
      return res.status(400).json({ message: error.message || "Could not update profile." });
    }
  };

  return { getProfile, updateProfile };
};

module.exports = {
  freelancer: createProfileHandlers(freelancerDb, "freelancer"),
  client: createProfileHandlers(clientDb, "client"),
  admin: createProfileHandlers(adminDb, "admin"),
};
