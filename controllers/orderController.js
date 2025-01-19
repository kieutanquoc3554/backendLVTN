const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const Notification = require("../models/notificationModel");
const sendOrderConfirmation = require("./sendOrderConfirmation");
const moment = require("moment-timezone");
const { wss, broadcast } = require("../controllers/websocket");
const UserNotification = require("../models/userNotificationModel");

const getOrder = async (req, res) => {
  try {
    const orders = await Order.find().populate("promotionId");
    res.status(200).json({ message: "Lấy đơn hàng thành công!", orders });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách đơn hàng." });
  }
};

const notifyNewOrder = async (order) => {
  const message = `Bạn vừa có 1 đơn hàng mới: Tổng giá: <b>${order.total}</b> của khách hàng <b>${order.name}</b>`;
  const newNotification = new Notification({ message });
  await newNotification.save();
  broadcast({ type: "NEW_ORDER", order });
};

const addOrder = async (req, res) => {
  try {
    const {
      address,
      name,
      email,
      phone,
      total,
      paymentMethod,
      discount,
      shipping_fee,
      orders,
      order_date,
      promotionId,
    } = req.body;
    if (!name || !address || !email || !phone) {
      return res
        .status(400)
        .json({ message: "Thông tin giao hàng chưa đầy đủ. Vui lòng thử lại" });
    }

    if (orders.length === 0) {
      return res
        .status(400)
        .json({ message: "Giỏ hàng đang trống! Vui lòng thử lại" });
    }

    const localOrderDate = moment.tz(order_date, "Asia/Ho_Chi_Minh").toDate();
    const newOrder = new Order({
      userId: req.user.userId,
      name,
      email,
      phone,
      address,
      total,
      paymentMethod,
      discount,
      shipping_fee,
      orders,
      promotionId,
      order_date: localOrderDate,
    });

    for (const orderItem of orders) {
      const product = await Product.findById(orderItem.productId);
      if (product) {
        const detail = product.details.find(
          (d) => d.weight == orderItem.weight
        );

        if (!detail) {
          return res.status(400).json({
            message: `Không tìm thấy chi tiết với trọng lượng ${orderItem.weight} cho sản phẩm ${product.name}.`,
          });
        }

        if (typeof detail.quantity !== "number") {
          return res.status(400).json({
            message: `Sản phẩm ${product.name} thiếu trường quantity trong chi tiết.`,
          });
        }

        detail.revenue += orderItem.price * orderItem.quantity;
        detail.soldQuantity += orderItem.quantity;
        if (detail.quantity < 0) {
          return res.status(400).json({
            message: `Sản phẩm ${product.name} với trọng lượng ${orderItem.weight} không đủ số lượng tồn kho.`,
          });
        }
      } else {
        return res.status(400).json({
          message: `Không tìm thấy sản phẩm với ID: ${orderItem.productId}.`,
        });
      }

      await product.save();
    }

    await newOrder.save();
    sendOrderConfirmation(newOrder);
    notifyNewOrder(newOrder);
    return res
      .status(201)
      .json({ message: "Đã tạo đơn hàng thành công", order: newOrder });
  } catch (error) {
    console.error("Lỗi trong quá trình tạo đơn hàng:", error);
    return res.status(500).json({ message: "Lỗi tạo đơn hàng", error });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId })
      .populate("userId")
      .populate("orders.productId")
      .exec();
    return res
      .status(200)
      .json({ message: "Lấy thông tin thành công", orders });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi lấy thông tin", error });
  }
};

const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id).populate("promotionId");
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    return res.status(200).json({ order: order });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const cancelOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Chỉ có thể hủy đơn hàng đang chờ xử lý" });
    }

    // Cập nhật trạng thái đơn hàng
    order.status = "cancelled";

    // Duyệt qua các sản phẩm trong đơn hàng
    for (const item of order.orders) {
      const product = await Product.findById(item.productId).populate(
        "details.unit"
      );

      if (!product) {
        return res.status(404).json({
          message: `Không tìm thấy sản phẩm với ID ${item.productId}`,
        });
      }

      // Tìm đúng chi tiết sản phẩm dựa trên weight và unit
      const detail = product.details.find((detail) => {
        console.log("Checking detail:", detail);

        return (
          detail.weight === item.weight &&
          String(detail.unit.name) === String(item.unit)
        );
      });

      if (detail) {
        detail.soldQuantity -= item.quantity;
      }
      if (!detail) {
        console.error("Không tìm thấy chi tiết sản phẩm", {
          weight: item.weight,
          unit: item.unit,
          productDetails: product.details,
        });
      }
      await product.save();
    }
    await order.save();
    return res.status(200).json({
      message: "Đơn hàng đã được hủy và cập nhật số lượng sản phẩm",
      order,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Lỗi server khi hủy đơn hàng", error });
  }
};

const reOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }
    if (order.status !== "cancelled") {
      return res
        .status(400)
        .json({ message: "Chỉ có thể đặt lại đơn hàng đã huỷ" });
    }
    order.status = "pending";
    await order.save();

    return res
      .status(200)
      .json({ message: "Đặt lại đơn hàng thành công", order });
  } catch (error) {}
};

const getOrdersByPeriod = async (req, res) => {
  const { date, period } = req.params;
  const momentDate = moment(date);
  if (!momentDate.isValid()) {
    return res.status(400).json({ message: "Ngày không hợp lệ" });
  }
  let startOfPeriod, endOfPeriod;

  switch (period) {
    case "day":
      startOfPeriod = momentDate.clone().startOf("day");
      endOfPeriod = momentDate.clone().endOf("day");
      break;
    case "month":
      startOfPeriod = momentDate.clone().startOf("month");
      endOfPeriod = momentDate.clone().endOf("month");
      break;
    case "year":
      startOfPeriod = momentDate.clone().startOf("year");
      endOfPeriod = momentDate.clone().endOf("year");
      break;
    default:
      return res.status(400).json({ message: "Khoảng thời gian không hợp lệ" });
  }

  try {
    const orders = await Order.find({
      order_date: { $gte: startOfPeriod.toDate(), $lt: endOfPeriod.toDate() },
    }).populate("orders.productId");

    return res.status(200).json({ orders });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách đơn hàng", error });
  }
};

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const order = await Order.findById(id);
    if (order.status === "cancelled" || order.status === "completed") {
      return res.status(400).json({
        message: "Không thể cập nhật đơn hàng đã bị huỷ hoặc đã hoàn thành",
      });
    }

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    }

    order.status = status;
    await order.save();
    const message = `Đơn hàng mã số ${id} đã được cập nhật trạng thái thành "${status}".`;
    const userNotification = new UserNotification({
      userId: order.userId,
      message: message,
    });
    broadcast({
      type: "ORDER_STATUS_UPDATED",
      orderId: id,
      status: status,
      message: `Đơn hàng mã số ${id} đã được cập nhật trạng thái thành "${status}".`,
    });
    await userNotification.save();
    return res
      .status(200)
      .json({ message: "Cập nhật trạng thái đơn hàng thành công", order });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi cập nhật trạng thái đơn hàng", error });
  }
};

const getNewOrdersCount = async (req, res) => {
  const count = await Order.countDocuments({ status: "new" });
  res.status(200).json({ count });
};

const getNoti = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error("Lỗi khi lấy thông báo:", error);
    res.status(500).json({ message: "Lỗi khi lấy thông báo", error });
  }
};

module.exports = {
  getOrder,
  addOrder,
  getUserOrders,
  getOrderById,
  cancelOrder,
  reOrder,
  getOrdersByPeriod,
  updateOrderStatus,
  getNewOrdersCount,
  getNoti,
};
