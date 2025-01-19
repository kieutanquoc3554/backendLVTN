const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const protect = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = { userId: decoded.id };

      next();
    } catch (error) {
      return res
        .status(401)
        .json({
          message: "Vui lòng đăng nhập trước khi sử dụng tính năng này",
        });
    }
  }
  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có token, không có quyền truy cập" });
  }
};

module.exports = { protect };
