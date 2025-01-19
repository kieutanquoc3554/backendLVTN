const UserNotification = require("../models/userNotificationModel");

const getUserNotifications = async (req, res) => {
  try {
    const notifications = await UserNotification.find({
      userId: req.user.userId,
    }).sort({ createdAt: -1 });
    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Lỗi khi lấy thông báo của người dùng:", error);
    res
      .status(500)
      .json({ message: "Lỗi khi lấy thông báo của người dùng", error });
  }
};

const markNotificationAsRead = async (req, res) => {
  const { id } = req.params;

  try {
    const notification = await UserNotification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }

    notification.read = true;
    await notification.save();
    return res
      .status(200)
      .json({ message: "Thông báo đã được đánh dấu là đã đọc" });
  } catch (error) {
    console.error("Lỗi khi đánh dấu thông báo là đã đọc:", error);
    return res
      .status(500)
      .json({ message: "Lỗi khi đánh dấu thông báo", error });
  }
};

const markAllNotificationsAsUnread = async (req, res) => {
  try {
    await UserNotification.updateMany(
      { userId: req.user.userId, read: true },
      { read: false }
    );
    res
      .status(200)
      .json({ message: "Tất cả thông báo đã được đánh dấu là chưa đọc" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi đánh dấu tất cả là đã đọc", error });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    await UserNotification.updateMany(
      { userId: req.user.userId, read: false },
      { read: true }
    );
    res
      .status(200)
      .json({ message: "Tất cả thông báo đã được đánh dấu là đã đọc" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi đánh dấu tất cả là đã đọc", error });
  }
};

const markNotificationAsUnread = async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await UserNotification.findByIdAndUpdate(
      id,
      { read: false },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteNotification = async (req, res) => {
  const { id } = req.params;
  try {
    await UserNotification.findByIdAndDelete(id);
    res.status(200).json({ message: "Thông báo đã được xóa" });
  } catch (error) {
    console.error("Lỗi khi xóa thông báo:", error);
    res.status(500).json({ message: "Lỗi khi xóa thông báo", error });
  }
};

const deleteAllNotifications = async (req, res) => {
  try {
    await UserNotification.deleteMany({ userId: req.user.userId });
    res.status(200).json({ message: "Tất cả thông báo đã được xóa" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa tất cả thông báo", error });
  }
};

module.exports = {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  markAllNotificationsAsUnread,
  markNotificationAsUnread,
};
