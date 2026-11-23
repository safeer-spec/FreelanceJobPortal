const jwt = require("jsonwebtoken");


const createAuth = ({ cookieName, role, reqKey }) => {
  return (req, res, next) => {
    try {
     const token = req.cookies?.[cookieName];

      if (!token) {
        return res.status(401).json({ message: "jwt not found" });
      }

     
      const verifiedToken = jwt.verify(token, process.env.JWT_SECRETE);

      if (verifiedToken.role !== role) {
        return res.status(403).json({ message: "access denied" });
      }

      req[reqKey] = verifiedToken.id;
      next();
    } catch (error) {
      res.status(401).json({ error: error.message || `${role} authorization failed` });
    }
  };
};

const authFreelancer = createAuth({
  cookieName: "Freelancer_token",
  role: "freelancer",
  reqKey: "freelancer",
});

const authClient = createAuth({
  cookieName: "Client_token",
  role: "client",
  reqKey: "client",
});

module.exports = { authFreelancer, authClient };

