const mongoose = require("mongoose");
const dotenv = require("dotenv");

const connectDatabase = async () => {
  dotenv.config();
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Đã kết nối đến cơ sở dữ liệu");
  } catch (error) {
    console.error("Có lỗi xảy ra!", error);
    process.exit(1);
  }
};

module.exports = connectDatabase;
