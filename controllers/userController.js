const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const dotenv = require("dotenv");
const { OAuth2Client } = require("google-auth-library");
const transporter = require("./mailer");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const getUser = async (req, res) => {
  try {
    const user = await User.find();
    res.status(200).json({ message: "Lấy người dùng thành công!", data: user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách người dùng." });
  }
};

const updateUser = async (req, res) => {
  try {
    const id = req.user.userId;
    const userInfo = req.body;
    const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    let phoneFormat = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    if (!userInfo.email.match(emailFormat)) {
      return res.status(400).json({ message: "Email không đúng định dạng" });
    }
    if (!userInfo.phone.match(phoneFormat)) {
      return res
        .status(400)
        .json({ message: "Số điện thoại không đúng định dạng" });
    }
    const haveUser = await User.findOne({ email: userInfo.email });
    const userId = req.user.userId;
    const myEmail = await User.findById(userId);
    if (haveUser && userInfo.email !== myEmail.email) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }
    if (
      !userInfo.name ||
      !userInfo.fullname ||
      !userInfo.phone ||
      !userInfo.email
    ) {
      return res
        .status(400)
        .json({ message: "Vui lòng không nhập dữ liệu rỗng" });
    }

    const updatedUser = await User.findByIdAndUpdate(id, userInfo, {
      new: true,
    });
    res.status(200).json({
      data: updatedUser,
      message: "Thông tin người dùng đã được cập nhật thành công.",
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật người dùng." });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Người dùng đã được xóa thành công." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa người dùng." });
  }
};

const signUp = async (req, res) => {
  const { name, email, password, rePassword, fullname, phone } = req.body;
  try {
    let user = await User.findOne({ email });
    let emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    let phoneFormat = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    if (!email.match(emailFormat)) {
      return res.status(400).json({
        message: "Email không đúng định dạng",
      });
    }
    if (!phone.match(phoneFormat)) {
      return res.status(400).json({
        message: "Số điện thoại không đúng định dạng",
      });
    }
    if (user) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }
    if (!name || !email || !password || !fullname || !phone) {
      return res.status(500).json({
        message: "Thông tin cung cấp chưa đầy đủ, vui lòng kiểm tra lại",
      });
    }
    if (password !== rePassword) {
      return res.status(500).json({
        message: "Mật khẩu xác nhận không trùng khớp",
      });
    }
    user = new User({ name, email, password, fullname, phone });
    await user.save();
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" + error });
  }
};

const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res
        .status(404)
        .json({ message: "Email hoặc mật khẩu không được để trống" });
      return;
    }
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "Người dùng không tồn tại" });
      return;
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không chính xác" });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "48h",
    });
    res.status(200).json({ token, lk: user._id });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" + error });
  }
};

const AdminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu không chính xác" });
    }
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "48h",
    });
    res.status(200).json({ token, user: { id: user._id, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" + error });
  }
};

const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "Người dùng không tồn tại" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" + error });
  }
};

const googleLogin = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name } = payload;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
      });
      await user.save();
    }
    const authToken = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "48h",
    });
    res.status(200).json({ token: authToken, user });
  } catch (error) {
    res.status(500).json({ message: "Đăng nhập Google thất bại", error });
  }
};

const updateUserInfo = async (req, res) => {
  const { fullname, phone, password, email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    if (fullname) user.fullname = fullname;
    if (phone) user.phone = phone;
    if (password) user.password = password;
    await user.save();
    res.status(200).json({ message: "Thông tin người dùng đã được cập nhật" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật thông tin", error });
  }
};

const resetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    user.password = newPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    res.status(200).json({ message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi đổi mật khẩu." });
  }
};

const getUserAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    res.status(200).json({ addresses: user.addresses });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server: " + error });
  }
};

const addAddress = async (req, res) => {
  const newAddress = req.body;
  const id = req.user.userId;
  try {
    const user = await User.findById(id);
    if (newAddress.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }
    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm địa chỉ", error: error });
  }
};

const deleteAddress = async (req, res) => {
  const { userId } = req.user;
  const { addressId } = req.params;

  try {
    const result = await User.findByIdAndUpdate(
      userId,
      { $pull: { addresses: { _id: addressId } } },
      { new: true }
    );

    if (!result) {
      return res
        .status(404)
        .json({ message: "Địa chỉ hoặc người dùng không tìm thấy" });
    }

    res.json({ message: "Địa chỉ đã được xóa thành công" });
  } catch (error) {
    res.status(500).json({ message: "Có lỗi khi xóa địa chỉ" });
  }
};

const getUserById = async (req, res) => {
  const id = req.user.userId;
  try {
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(error);
  }
};

const addViewedProduct = async (req, res) => {
  const userId = req.user.userId;
  const { productId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    const isProductViewed = user.viewedProduct.some(
      (item) => item.product.toString() === productId
    );
    if (!isProductViewed) {
      user.viewedProduct.push({ product: productId });
      await user.save();
    }
    res.status(200).json({ message: "Sản phẩm đã lưu vào danh sách đã thêm" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

const getViewedProduct = async (req, res) => {
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId).populate("viewedProduct.product");
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }
    res.status(200).json({ products: user.viewedProduct });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error });
  }
};

const sendOTP = async (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000);

  console.log("Email gửi OTP:", email);

  await User.findOneAndUpdate(
    { email },
    { otp, otpExpires: Date.now() + 10 * 60 * 1000 },
    { new: true }
  );

  let mailOptions = {
    from: "Kiều Tấn Quốc <kieutanquoc2002@gmail.com>",
    to: email,
    subject: "Mã OTP đổi mật khẩu",
    text: `Mã OTP của bạn là: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ success: true, message: "OTP đã được gửi đến email." });
  } catch (error) {
    console.error("Lỗi khi gửi email:", error.message);
    console.error("Thông tin chi tiết:", error);
    res
      .status(500)
      .json({ success: false, message: "Có lỗi xảy ra khi gửi OTP." });
  }
};

const verifyOTP = async (req, res) => {
  const { email, otpCode } = req.body;
  try {
    const user = await User.findOne({ email, otp: otpCode });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }
    if (user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "OTP không hợp lệ hoặc hết hạn" });
    }
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    res.status(200).json({ success: true, message: "Xác thực thành công" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

module.exports = {
  signUp,
  Login,
  AdminLogin,
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
  addViewedProduct,
  getViewedProduct,
  resetPassword,
  sendOTP,
  verifyOTP,
};
