const mongoose = require("mongoose");

const userNotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const UserNotification = mongoose.model(
  "UserNotification",
  userNotificationSchema
);
module.exports = UserNotification;
