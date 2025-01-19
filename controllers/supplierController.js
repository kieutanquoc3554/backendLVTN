const Supplier = require("../models/supplierModel");

const addSupplier = async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    await supplier.save();
    res.status(201).json({ message: "Đã thêm nhà cung cấp", supplier });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.find();
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSupplierByID = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
    }
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSupplierByID = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!supplier) {
      return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
    }
    res.status(200).json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
    }
    res.status(200).json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addSupplier,
  getSupplier,
  getSupplierByID,
  updateSupplierByID,
  deleteSupplier,
};
