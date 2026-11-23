const Notification = require("../models/notificationmodel");

const listFor = (role, req) => role === "admin" ? req.admin : req[role];

const list = async (req, res) => {
  try {
    const role = req.notificationRole;
    const recipient = listFor(role, req);
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ recipient, role }).sort({ createdAt: -1 }).limit(100).lean(),
      Notification.countDocuments({ recipient, role, readAt: null }),
    ]);
    return res.status(200).json({ notifications, unreadCount });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not load notifications." });
  }
};

const markRead = async (req, res) => {
  try {
    const role = req.notificationRole;
    const recipient = listFor(role, req);
    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, recipient, role },
      { readAt: new Date() },
      { new: true },
    );
    if (!updated) return res.status(404).json({ message: "Notification not found." });
    return res.status(200).json({ notification: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not update notification." });
  }
};

const deleteAll = async (req, res) => {
  try {
    const role = req.notificationRole;
    const recipient = listFor(role, req);
    const result = await Notification.deleteMany({ recipient, role });
    return res.status(200).json({ message: "All notifications deleted.", deletedCount: result.deletedCount });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not delete notifications." });
  }
};
const markAllRead = async (req, res) => {
  try {
    const role = req.notificationRole;
    const recipient = listFor(role, req);
    await Notification.updateMany({ recipient, role, readAt: null }, { readAt: new Date() });
    return res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Could not update notifications." });
  }
};

module.exports = { list, markRead, markAllRead, deleteAll };
