// statisController.js
const Order = require("../models/orderModel");
const moment = require("moment-timezone");
const Product = require("../models/productModel");

const getStatistics = async (req, res) => {
  const startOfDay = moment().startOf("day");
  const endOfDay = moment().endOf("day");
  try {
    const orders = await Order.find({
      order_date: { $gte: startOfDay, $lt: endOfDay },
      status: { $ne: "cancelled" },
    }).populate("orders.productId");
    const statistics = [];
    orders.forEach((order) => {
      order.orders.forEach((item) => {
        const productName = item.name;
        const weight = item.weight;
        const unit = item.unit;
        const price = item.price;

        const existingStat = statistics.find(
          (stat) => stat.name === productName && stat.weight === weight
        );

        if (existingStat) {
          existingStat.totalSold += item.quantity;
          existingStat.totalPrice += price * item.quantity;
        } else {
          statistics.push({
            name: productName,
            weight: weight,
            unit: unit,
            totalSold: item.quantity,
            price: price,
            totalPrice: price * item.quantity,
            order_date: moment(order.order_date).utc().format(),
            shipping_fee: order.shipping_fee,
          });
        }
      });
    });

    return res.status(200).json({
      message: "Thống kê thành công",
      statistics,
    });
  } catch (error) {
    console.error("Error:", error); // Kiểm tra lỗi
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy thông tin thống kê", error });
  }
};

const getOrderStatistics = async (req, res) => {
  const { period } = req.params;
  let matchStage;

  switch (period) {
    case "day":
      const startDate = moment()
        .subtract(30, "days")
        .startOf("day")
        .tz("Asia/Ho_Chi_Minh")
        .toDate();
      const endDate = moment().endOf("day").utc().toDate();
      matchStage = {
        order_date: {
          $gte: startDate,
          $lte: endDate,
        },
      };
      break;
    case "month":
      const currentYear = moment().year();
      matchStage = {
        order_date: {
          $gte: moment()
            .month(0)
            .year(currentYear)
            .startOf("month")
            .utc()
            .toDate(),
          $lte: moment()
            .month(11)
            .year(currentYear)
            .endOf("month")
            .utc()
            .toDate(),
        },
      };
      break;
    case "year":
      const startYear = moment()
        .subtract(3, "years")
        .startOf("year")
        .utc()
        .toDate();
      matchStage = {
        order_date: {
          $gte: startYear,
          $lte: moment().endOf("year").utc().toDate(),
        },
      };
      break;
    default:
      return res.status(400).json({ message: "Invalid period type" });
  }

  try {
    const stats = await Order.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: {
              format:
                period === "day"
                  ? "%Y-%m-%d"
                  : period === "month"
                  ? "%Y-%m"
                  : "%Y",
              date: "$order_date",
            },
          },
          totalRevenue: { $sum: "$total" },
          totalShippingFee: { $sum: "$shipping_fee" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $addFields: {
          totalProfit: {
            $subtract: ["$totalRevenue", "$totalShippingFee"],
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.status(200).json({ stats });
  } catch (error) {
    res.status(500).json({ message: "Error fetching statistics", error });
  }
};

const getTopSellingProducts = async (req, res) => {
  try {
    const salesStats = await Order.aggregate([
      { $unwind: "$orders" },
      {
        $group: {
          _id: "$orders.productId",
          totalSold: { $sum: "$orders.quantity" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
      {
        $project: {
          productId: "$_id",
          totalSold: 1,
          productName: "$productDetails.name",
          productCategory: "$productDetails.category",
        },
      },
      {
        $sort: { totalSold: -1 },
      },
    ]);

    const topSelling = salesStats.slice(0, 5);
    const slowSelling = salesStats.slice(-5);

    return res.status(200).json({
      message: "Thống kê bán chạy và bán chậm thành công",
      topSelling,
      slowSelling,
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy thông tin thống kê", error });
  }
};

const getOrderStatisticByDate = async (req, res) => {
  const { date } = req.params;
  const startOfDay = moment(date)
    .startOf("day")
    .tz("Asia/Ho_Chi_Minh")
    .toDate();
  const endOfDay = moment(date).endOf("day").utc().toDate();
  try {
    const stats = await Order.aggregate([
      {
        $match: {
          order_date: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: date,
          totalRevenue: { $sum: "$total" },
          totalShippingFee: { $sum: "$shipping_fee" },
          orderCount: { $sum: 1 },
        },
      },
      {
        $addFields: {
          totalProfit: { $subtract: ["$totalRevenue", "$totalShippingFee"] },
        },
      },
    ]);
    res.status(200).json({ stats });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching statistics by date", error });
  }
};

const getOrderStatisticByCategory = async (req, res) => {
  const { period } = req.params;
  let matchStage;
  switch (period) {
    case "day":
      matchStage = {
        order_date: {
          $gte: moment()
            .subtract(6, "days")
            .startOf("day")
            .tz("Asia/Ho_Chi_Minh")
            .toDate(),
          $lte: moment().endOf("day").utc().toDate(),
        },
      };
      break;
    case "month":
      matchStage = {
        order_date: {
          $gte: moment().subtract(1, "months").startOf("month").toDate(),
          $lte: moment().endOf("month").toDate(),
        },
      };
      break;
    case "year":
      matchStage = {
        order_date: {
          $gte: moment().subtract(1, "years").startOf("year").toDate(),
          $lte: moment().endOf("year").toDate(),
        },
      };
      break;
    default:
      return res.status(400).json({ message: "Thời gian không hợp lệ" });
  }
  try {
    const orders = await Order.aggregate([
      { $match: matchStage },
      { $unwind: "$orders" },
      {
        $lookup: {
          from: "products",
          localField: "orders.productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $group: {
          _id: "$productDetails.category",
          orderCount: { $sum: "$orders.quantity" },
          totalProfit: {
            $sum: { $multiply: ["$orders.price", "$orders.quantity"] },
          },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails",
      },
    ]);
    res.status(200).json({ message: "Thống kê thành công", stats: orders });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin thống kê", error });
  }
};

const getInventoryStatistics = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("details.unit")
      .populate("category");

    const inventory = products.flatMap((product) =>
      product.details.map((detail) => ({
        name: product.name,
        quantity: detail.quantity - detail.soldQuantity,
        unit: detail.unit.name,
        weight: detail.weight,
        category: product.category.name,
      }))
    );

    return res.status(200).json({ inventory });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy thông tin tồn kho", error });
  }
};

const getPotentialCustomersByOrders = async (req, res) => {
  try {
    const potentialCustomers = await Order.aggregate([
      {
        $group: {
          _id: "$userId",
          orderCount: { $sum: 1 },
        },
      },
      {
        $match: { orderCount: { $gt: 1 } }, // Điều kiện cho khách hàng tiềm năng
      },
      {
        $lookup: {
          from: "users", // Tên collection người dùng
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $project: {
          id: "$userInfo._id",
          name: "$userInfo.name",
          orderCount: 1,
        },
      },
    ]);

    return res.status(200).json({ customers: potentialCustomers });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy khách hàng tiềm năng", error });
  }
};

const getPotentialCustomersByRevenue = async (req, res) => {
  try {
    const potentialCustomers = await Order.aggregate([
      {
        $group: {
          _id: "$userId",
          totalSpent: { $sum: "$total" },
        },
      },
      {
        $match: { totalSpent: { $gt: 100000 } },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $project: {
          id: "$userInfo._id",
          name: "$userInfo.name",
          totalSpent: 1,
        },
      },
    ]);

    return res.status(200).json({ customers: potentialCustomers });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy khách hàng tiềm năng", error });
  }
};

module.exports = {
  getStatistics,
  getOrderStatistics,
  getOrderStatisticByDate,
  getInventoryStatistics,
  getOrderStatisticByCategory,
  getPotentialCustomersByOrders,
  getPotentialCustomersByRevenue,
  getTopSellingProducts,
};
