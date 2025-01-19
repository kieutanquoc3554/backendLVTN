const Product = require("../models/productModel");
const ImportReceipt = require("../models/importModel");

const createImportReceipt = async (req, res) => {
  try {
    const { supplier, products, note } = req.body;
    let totalAmount = 0;
    for (let product of products) {
      const foundProduct = await Product.findById(product.product).populate(
        "details.unit"
      );
      if (!foundProduct) {
        return res.status(404).json({ message: "Sản phẩm không tồn tại" });
      }
      product.totalPrice = product.quantity * product.price;
      totalAmount += product.totalPrice;

      const productDetail = foundProduct.details.find(
        (detail) =>
          detail.weight === product.weight && detail.unit.name === product.unit
      );

      if (productDetail) {
        productDetail.quantity += product.quantity;
        productDetail.initPrice = product.price;
        productDetail.finalPrice =
          productDetail.initPrice -
          productDetail.initPrice * (productDetail.discount / 100);
        await foundProduct.save();
      }
    }
    const newImportReceipt = new ImportReceipt({
      supplier,
      products,
      totalAmount,
      note,
    });
    await newImportReceipt.save();
    res.status(201).json({
      success: true,
      message: "Phiếu nhập hàng đã được tạo thành công!",
      importReceipt: newImportReceipt,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi tạo phiếu nhập hàng", error });
  }
};

const getAllImportReceipts = async (req, res) => {
  try {
    const importReceipts = await ImportReceipt.find()
      .populate("products.product")
      .populate("supplier");

    res.status(200).json({ success: true, data: importReceipts });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách phiếu nhập hàng", error });
  }
};

const getImportReceiptById = async (req, res) => {
  try {
    const { id } = req.params;
    const importReceipts = await ImportReceipt.findById(id)
      .populate("products.product")
      .populate("supplier");
    if (!importReceipts) {
      return res.status(404).json({ message: "Phiếu nhập hàng không tồn tại" });
    }
    res.status(200).json({ success: true, data: importReceipts });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy chi tiết phiếu nhập hàng", error });
  }
};

const deleteImportReceipt = async (req, res) => {
  try {
    const { id } = req.params;
    await ImportReceipt.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "Phiếu nhập hàng đã được xoá thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi xoá phiếu nhập hàng", error });
  }
};

module.exports = {
  createImportReceipt,
  getAllImportReceipts,
  getImportReceiptById,
  deleteImportReceipt,
};
