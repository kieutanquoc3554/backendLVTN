const Product = require("../models/productModel");
const Category = require("../models/categoryProductModel");

const addProduct = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      category,
      rating,
      details,
      images,
      videos,
    } = req.body;

    const newProduct = new Product({
      code,
      name,
      description,
      category,
      rating: rating || 0,
      details,
      images,
      videos,
    });

    await newProduct.save();

    res.status(201).json({
      message: "Sản phẩm đã được tạo thành công!",
      product: newProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi thêm sản phẩm!" });
  }
};

const getAllProduct = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category")
      .populate("details.unit");

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi không thể lấy sản phẩm" });
  }
};

const searchProduct = async (req, res) => {
  const query = req.query.q;
  try {
    const results = await Product.find({
      name: { $regex: query, $options: "i" },
    });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server." });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const finalValues = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
    }

    product.name = finalValues.name;
    product.category = finalValues.category;
    product.description = finalValues.description;
    product.details = finalValues.details;

    await product.save();

    res.status(200).json({
      message: "Cập nhật sản phẩm thành công!",
      product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi cập nhật sản phẩm!" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Xoá sản phẩm thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Xoá sản phẩm không thành công!" });
  }
};

const addCategoryProduct = async (req, res) => {
  const { name } = req.body;
  try {
    const existingCategory = await Category.findOne({ name: name });
    if (!existingCategory) {
      const newCategory = new Category({ name });
      newCategory.save();
      res
        .status(200)
        .json({ success: true, message: "Đã thêm danh mục sản phẩm" });
    } else {
      res.status(500).json({
        success: false,
        message: "Danh mục này đã tồn tại trên hệ thống",
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Có lỗi xảy ra, vui lòng thử lại" });
  }
};

const getCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Có lỗi xảy ra!",
    });
  }
};

const getProductByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.categoryId })
      .populate("category")
      .populate("details.unit");

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error("Error in getProductByCategory:", error);
    res.status(500).json({ success: false, message: "Lỗi khi lấy sản phẩm" });
  }
};

const deleteCategory = async (req, res) => {
  const { categoryId } = req.params;
  try {
    await Category.findByIdAndDelete(categoryId);
    return res.status(200).json({ message: "Xoá danh mục thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi" });
  }
};

const getProductByID = async (req, res) => {
  const productId = req.params.id;
  try {
    const product = await Product.findById(productId).populate("details.unit");
    if (!product) {
      return res.status(404).json({ message: "Không có sản phẩm này" });
    }

    const detailsWithUnits = product.details.map((detail) => ({
      weight: detail.weight,
      unit: detail.unit.name,
    }));

    res.status(200).json({
      product: {
        _id: product._id,
        code: product.code,
        name: product.name,
        description: product.description,
        category: product.category,
        rating: product.rating,
        details: detailsWithUnits,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server: " + error.message });
  }
};

const getRevenueByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.categoryId });
    let totalRevenue = 0;
    let totalSold = 0;
    products.forEach((product) => {
      product.details.forEach((detail) => {
        totalRevenue += detail.revenue;
        totalSold += detail.soldQuantity;
      });
    });
    res.status(200).json({
      success: true,
      category: req.params.categoryId,
      totalRevenue,
      totalSold,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi khi lấy doanh thu" });
  }
};

const getPriceHistoryByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category: categoryId })
      .populate("category")
      .populate("details.unit", "name");

    const priceHistories = products.map((product) => ({
      productId: product._id,
      productName: product.name,
      details: product.details.map((detail) => ({
        weight: detail.weight,
        unit: detail.unit,
        priceHistory: detail.priceHistory.map((history) => ({
          oldPrice: history.oldPrice,
          newPrice: history.newPrice,
          oldDiscount: history.oldDiscount,
          newDiscount: history.newDiscount,
          oldWeight: history.oldWeight,
          newWeight: history.newWeight,
          oldUnit: history.oldUnit,
          newUnit: history.newUnit,
          updatedAt: history.updatedAt,
        })),
      })),
    }));

    res
      .status(200)
      .json({ message: "Lấy lịch sử giá thành công", priceHistories });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy lịch sử giá", error });
  }
};

const addProductImage = async (req, res) => {
  const { productId } = req.params;
  const { url, public_id } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
    }

    product.images.push({ url, public_id });
    await product.save();

    res.status(200).json({ message: "Thêm ảnh thành công!", url });
  } catch (error) {
    console.error("Lỗi khi thêm ảnh:", error);
    res.status(500).json({ message: "Lỗi khi thêm ảnh" });
  }
};

const deleteProductImage = async (req, res) => {
  const { productId, imageId } = req.params;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại!" });
    }
    product.images = product.images.filter((i) => i._id.toString() != imageId);
    await product.save();
    res.status(200).json({ message: "Xoá ảnh thành công!" });
  } catch (error) {
    console.error("Lỗi khi xoá ảnh:", error);
    res.status(500).json({ message: "Lỗi khi xoá ảnh" });
  }
};

const addBannerProductCategory = async (req, res) => {
  const { id } = req.params;
  const { coverImage } = req.body;
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục!" });
    }
    category.coverImages.push(coverImage);
    await category.save();
    res
      .status(200)
      .json({ message: "Ảnh đã được thêm vào danh mục!", category });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi thêm ảnh vào danh mục.", error });
  }
};

const deleteBannerProductCategory = async (req, res) => {
  const { id, imageId } = req.params;
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục!" });
    }
    const imageIndex = category.coverImages.findIndex(
      (index) => index._id === imageId
    );
    if (imageIndex === -1) {
      return res
        .status(404)
        .json({ message: "Ảnh không tìm thấy trong danh mục!" });
    }
    category.coverImages.splice(imageIndex, 1);
    await category.save();
    res
      .status(200)
      .json({ message: "Ảnh đã được xóa khỏi danh mục!", category });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xóa ảnh khỏi danh mục.", error });
  }
};

const getBannerByCategoryName = async (req, res) => {
  const { categoryName } = req.params;
  try {
    const category = await Category.findOne({ name: categoryName }).select(
      "coverImages"
    );
    console.log(category.coverImages);

    if (!category) {
      return res.status(404).json({ message: "Danh mục không tìm thấy" });
    }

    res.json({ banners: category.coverImages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  addProduct,
  addCategoryProduct,
  getCategory,
  getAllProduct,
  updateProduct,
  deleteProduct,
  getProductByID,
  getProductByCategory,
  deleteCategory,
  getRevenueByCategory,
  getPriceHistoryByCategory,
  addProductImage,
  deleteProductImage,
  searchProduct,
  addBannerProductCategory,
  deleteBannerProductCategory,
  getBannerByCategoryName,
};
