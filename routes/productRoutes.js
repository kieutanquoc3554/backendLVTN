const express = require("express");
const {
  addProduct,
  addCategoryProduct,
  getCategory,
  getAllProduct,
  updateProduct,
  deleteProduct,
  getProductByID,
  getProductByCategory,
  deleteCategory,
  getPriceHistoryByCategory,
  addProductImage,
  deleteProductImage,
  searchProduct,
  addBannerProductCategory,
  deleteBannerProductCategory,
  getBannerByCategoryName,
} = require("../controllers/productController");
const router = express.Router();

router.post("/add", addProduct);
router.get("/allProduct", getAllProduct);
router.post("/category/add", addCategoryProduct);
router.get("/category/getAll", getCategory);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.get("/:id", getProductByID);
router.get("/category/:categoryId", getProductByCategory);
router.put("/delete/:categoryId", deleteCategory);
router.get("/price-history/:categoryId", getPriceHistoryByCategory);
router.post("/:productId/addImage", addProductImage);
router.delete("/:productId/images/:imageId", deleteProductImage);
router.get("/search/query", searchProduct);
router.put("/addBanner/:id", addBannerProductCategory);
router.delete("/category/:id/banner/:imageUrl", deleteBannerProductCategory);
router.get("/category/:categoryName/banners", getBannerByCategoryName);

module.exports = router;
