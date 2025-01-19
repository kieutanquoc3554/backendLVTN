const express = require("express");
const {
  getStatistics,
  getOrderStatistics,
  getOrderStatisticByDate,
  getInventoryStatistics,
  getOrderStatisticByCategory,
  getPotentialCustomersByOrders,
  getPotentialCustomersByRevenue,
  getTopSellingProducts,
} = require("../controllers/statisController");
const { getPaymentStats } = require("../controllers/paymentController");
const router = express.Router();

router.get("/get", getStatistics);
router.get("/orders/:period", getOrderStatistics);
router.get("/orders/by-date/:date", getOrderStatisticByDate);
router.get("/orders/by-category/:period", getOrderStatisticByCategory);
router.get("/inventory", getInventoryStatistics);
router.get("/stats", getPaymentStats);
router.get("/potential-customers/orders", getPotentialCustomersByOrders);
router.get("/potential-customers/revenue", getPotentialCustomersByRevenue);
router.get("/top-products", getTopSellingProducts);

module.exports = router;
