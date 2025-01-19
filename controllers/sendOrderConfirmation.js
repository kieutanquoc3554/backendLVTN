const transporter = require("./mailer");

function generateOrderTable(orders) {
  let orderRows = orders
    .map((order) => {
      return `
            <tr>
                <td>${order.name}</td>
                <td>${order.quantity}</td>
                <td>${order.weight} ${order.unit}</td>
                <td>${order.discount}%</td>
                <td>${order.price * order.quantity} VND</td>
            </tr>
        `;
    })
    .join("");

  return `
        <table border="1" cellpadding="10" cellspacing="0">
            <thead>
                <tr>
                    <th>Tên sản phẩm</th>
                    <th>Số lượng</th>
                    <th>Khối lượng</th>
                    <th>Đã giảm giá</th>
                    <th>Giá thanh toán</th>
                </tr>
            </thead>
            <tbody>
                ${orderRows}
            </tbody>
        </table>
    `;
}

async function sendOrderConfirmation(orderData) {
  const { userId, address, total, orders, email, name } = orderData;

  const emailContent = `
        <h1>Xác nhận đơn hàng thành công</h1>
        <p>Chào <strong>${name}</strong>,</p>
        <p>Cảm ơn bạn đã đặt hàng tại cửa hàng của chúng tôi.</p>
        <p><strong>Địa chỉ giao hàng:</strong> ${address}</p>
        <p><strong>Ngày đặt hàng:</strong> ${new Date(
          orderData.order_date
        ).toLocaleDateString()}</p>
        <p><strong>Tổng tiền:</strong> ${total.toLocaleString()} VND</p>
        <h3>Chi tiết đơn hàng:</h3>
        ${generateOrderTable(orders)}
        <p>Chúng tôi sẽ liên hệ với bạn khi đơn hàng được gửi đi.</p>
        <p>Trân trọng,</p>
        <p>Đội ngũ cửa hàng</p>
    `;

  let mailOptions = {
    from: "Kiều Tấn Quốc",
    to: email,
    subject: "Xác nhận đơn hàng của bạn",
    html: emailContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email đã được gửi thành công!");
  } catch (error) {
    console.error("Lỗi khi gửi email:", userId.name, error);
  }
}

module.exports = sendOrderConfirmation;
