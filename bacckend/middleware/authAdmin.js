const jwt = require("jsonwebtoken");

//to test admin is jenuine when the course added
const authAdmin = (req, res, next) => {
  try {
    const { Admin_token } = req.cookies;
 

    if (!Admin_token) {
      return res.status(401).json({
        message: "jwt not found",
      });
    }
    const verifiedToken = jwt.verify(Admin_token, process.env.JWT_SECRETE);

    if (!verifiedToken) {
      return res.status(401).json({
        message: "admin not authorised",
      });
    }

    if (verifiedToken.role !== "admin") {
      return res.status(403).json({ message: "access denied" });
    }
    req.admin = verifiedToken.id;

    next();
  } catch (error) {
    res
      .status(error.status || 401)
      .json({ error: error.message || "admin authorization failed" });
  }
};

module.exports = authAdmin;
