const Virtual = async (req, res) => {
  const { path } = req.query;

  let hint = "Xin chào!";
  if (path === "/") {
    hint = "Khám phá các sản phẩm nổi bật!";
  } else if (path.includes("/cart")) {
    hint = "Bạn muốn kiểm tra lại giỏ hàng của mình chứ?";
  } else if (path.includes("/profile")) {
    hint = "Xem thông tin tài khoản của bạn ở đây!";
  }

  res.json({ hint });
};

module.exports = { Virtual };
