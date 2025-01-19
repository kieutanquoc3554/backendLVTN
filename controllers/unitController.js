const Unit = require("../models/unitWeight");

const addUnit = async (req, res) => {
  try {
    const { name } = req.body;
    const existingUnit = await Unit.findOne({ name: name });
    if (existingUnit) {
      res.status(500).json({
        success: false,
        message: "Đơn vị tính đã tồn tại trong hệ thống",
      });
    } else {
      const newUnit = new Unit({
        name,
      });
      newUnit.save();
      res.status(200).json({ success: true, message: "Đã thêm đơn vị tính" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error });
  }
};

const getUnit = async (req, res) => {
  try {
    const units = await Unit.find();
    res.status(200).json({
      success: true,
      data: units,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error,
    });
  }
};

module.exports = { addUnit, getUnit };
