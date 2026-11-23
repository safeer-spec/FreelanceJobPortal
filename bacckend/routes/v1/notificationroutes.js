const router = require("express").Router();
const { list, markRead, markAllRead, deleteAll } = require("../../controllers/notificationcontroller");
const authAdmin = require("../../middleware/authAdmin");
const { authClient, authFreelancer } = require("../../middleware/authMiddleware");

const scoped = (role, auth) => {
  const scopedRouter = require("express").Router();
  scopedRouter.use(auth, (req, res, next) => { req.notificationRole = role; next(); });
  scopedRouter.get("/", list);
  scopedRouter.delete("/", deleteAll);
  scopedRouter.patch("/read-all", markAllRead);
  scopedRouter.patch("/:notificationId/read", markRead);
  return scopedRouter;
};

router.use("/admin", scoped("admin", authAdmin));
router.use("/client", scoped("client", authClient));
router.use("/freelancer", scoped("freelancer", authFreelancer));

module.exports = router;
