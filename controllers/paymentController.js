const dotenv = require("dotenv");
const Payment = require("../models/paymentModel");
const axios = require("axios").default;
const CryptoJS = require("crypto-js");
const moment = require("moment");
const qs = require("qs");
const Order = require("../models/orderModel");
dotenv.config();

const config = {
  app_id: "2553",
  key1: "PcY4iZIKFCIdgZvA6ueMcMHHUbRLYjPL",
  key2: "kLtgPl8HHhfvMuDHPwKfgfsY4Ydm9eIz",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create",
};

const getCID = (req, res) => {
  return res.status(200).json({
    status: "OK",
    data: process.env.CLIENT_ID,
  });
};

const addPaymentMethod = async (req, res) => {
  const { name } = req.body;
  try {
    const payment = await Payment.findOne({ name });
    if (payment) {
      return res
        .status(500)
        .json({ success: false, message: "Đã tồn tại phương thức này" });
    }
    const newPayment = new Payment({ name });
    newPayment.save();
    return res
      .status(200)
      .json({ success: true, message: "Đã thêm phương thức" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Lỗi server" + error });
  }
};

const getAllMethod = async (req, res) => {
  try {
    const data = await Payment.find();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

const getMethodById = async (req, res) => {
  try {
    const { id } = req.params;
    const method = await Payment.findById(id);
    if (!method) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy tên phương thức" });
    }
    return res.status(200).json({ name: method.name });
  } catch (error) {
    return res.status(500).json({ message: "Có lỗi xảy ra" });
  }
};

const payment = async (req, res) => {
  const { userId, total, orders } = req.body;
  console.log(userId, total, orders);

  const embed_data = {
    redirecturl: "http://localhost:3000/",
  };

  const transID = Math.floor(Math.random() * 1000000);
  const app_trans_id = `${moment().format("YYMMDD")}_${transID}`;
  const order = {
    app_id: config.app_id,
    app_trans_id: app_trans_id,
    app_user: userId,
    app_time: Date.now(),
    item: JSON.stringify(orders),
    embed_data: JSON.stringify(embed_data),
    amount: total,
    description: `Đơn hàng CAMAUNIQUE #${transID}`,
    bank_code: "",
    callback_url: "https://luanvan.loca.lt/payments/callback",
  };

  const data =
    config.app_id +
    "|" +
    order.app_trans_id +
    "|" +
    order.app_user +
    "|" +
    order.amount +
    "|" +
    order.app_time +
    "|" +
    order.embed_data +
    "|" +
    order.item;

  order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  try {
    const response = await axios.post(config.endpoint, null, { params: order });
    // console.log(response.data);
    res.status(200).json({
      success: true,
      message: "Payment processed",
      data: response.data,
      trans_id: app_trans_id,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi gọi API thanh toán." });
  }
};

const callback = async (req, res) => {
  let result = {};

  try {
    let dataStr = req.body.data;
    let reqMac = req.body.mac;

    let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    console.log("mac =", mac);
    if (reqMac !== mac) {
      result.return_code = -1;
      result.return_message = "mac not equal";
    } else {
      let dataJson = JSON.parse(dataStr, config.key2);
      console.log(
        "update order's status = success where app_trans_id =",
        dataJson["app_trans_id"]
      );

      result.return_code = 1;
      result.return_message = "success";
    }
  } catch (ex) {
    result.return_code = 0;
    result.return_message = ex.message;
  }
  res.json(result);
};

const orderStatus = async (req, res) => {
  const app_trans_id = req.params.app_trans_id;
  let postData = {
    app_id: config.app_id,
    app_trans_id: app_trans_id,
  };

  let data = postData.app_id + "|" + postData.app_trans_id + "|" + config.key1;
  postData.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

  let postConfig = {
    method: "post",
    url: "https://sb-openapi.zalopay.vn/v2/query",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: qs.stringify(postData),
  };

  axios(postConfig)
    .then(function (response) {
      console.log(response.data);
      res.json(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
};

const getPaymentStats = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    const orders = await Order.find({
      order_date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).populate("paymentMethod");

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;

    const completedOrders = orders.filter(
      (order) => order.status === "completed"
    ).length;
    const completionRate = totalOrders
      ? (completedOrders / totalOrders) * 100
      : 0;
    const paymentMethods = await Payment.find();
    const methodStats = paymentMethods.map((method) => {
      const count = orders.filter(
        (order) => order.paymentMethod.name === method.name
      ).length;
      return { method: method.name, count };
    });

    res.status(200).json({
      totalRevenue,
      totalOrders,
      methodStats,
      completionRate: completionRate.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy dữ liệu thống kê", error });
  }
};

module.exports = {
  getCID,
  addPaymentMethod,
  getAllMethod,
  getMethodById,
  payment,
  callback,
  orderStatus,
  getPaymentStats,
};
