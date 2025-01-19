const express = require("express");
const {
  signUp,
  Login,
  getUserInfo,
  googleLogin,
  updateUserInfo,
  addAddress,
  getUserAddress,
  getUser,
  updateUser,
  deleteUser,
  deleteAddress,
  getUserById,
  AdminLogin,
  addViewedProduct,
  getViewedProduct,
  resetPassword,
  sendOTP,
  verifyOTP,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  markAllNotificationsAsUnread,
  markNotificationAsUnread,
} = require("../controllers/notificationController");
const router = express.Router();

router.post("/login", Login);
router.post("/admin/login", AdminLogin);
router.post("/signup", signUp);
router.get("/info", protect, getUserInfo);
router.post("/google-login", googleLogin);
router.post("/update-info", protect, updateUserInfo);
router.post("/addAddress", protect, addAddress);
router.get("/getAddress", protect, getUserAddress);
router.get("/get/allUsers", getUser);
router.put("/update", protect, updateUser);
router.put("/resetPassword", resetPassword);
router.delete("/delete/:id", deleteUser);
router.delete("/delete/address/:addressId", protect, deleteAddress);
router.get("/getUser", protect, getUserById);
router.post("/viewed", protect, addViewedProduct);
router.get("/viewed", protect, getViewedProduct);
router.post("/sendOtp", sendOTP);
router.post("/verifyOTP", verifyOTP);
router.get("/notification", protect, getUserNotifications);
router.patch("/notification/:id", protect, markNotificationAsRead);
router.patch("/notifications/markAllRead", protect, markAllNotificationsAsRead);
router.patch(
  "/notifications/update/markAllUnread",
  protect,
  markAllNotificationsAsUnread
);
router.delete("/notifications/:id", protect, deleteNotification);
router.delete(
  "/notifications/delete/deleteAll",
  protect,
  deleteAllNotifications
);
router.patch(
  "/notification/update/unread/:id",
  protect,
  markNotificationAsUnread
);

module.exports = router;
