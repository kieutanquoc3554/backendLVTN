const Promote = require("../models/promotionModel");

const getAllPromotions = async (req, res) => {
  try {
    const promotions = await Promote.find();
    return res.status(200).json(promotions);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi lấy danh sách khuyến mãi", error });
  }
};

const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promote.findById(id);
    if (!promotion) {
      return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
    }
    return res.status(200).json(promotion);
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi lấy khuyến mãi", error });
  }
};

const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      startDate,
      endDate,
      discountValue,
      discountType,
      paymentMethod,
      minOrderValue,
      maxDiscountAmount,
      isActive,
    } = req.body;

    const updatedPromotion = await Promote.findByIdAndUpdate(
      id,
      {
        name,
        startDate,
        endDate,
        discountValue,
        discountType,
        paymentMethod,
        minOrderValue,
        maxDiscountAmount,
        isActive,
      },
      { new: true }
    );

    if (!updatedPromotion) {
      return res.status(404).json({ message: "Không tìm thấy khuyến mãi" });
    }

    return res
      .status(200)
      .json({ message: "Cập nhật khuyến mãi thành công", updatedPromotion });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Lỗi khi cập nhật khuyến mãi", error });
  }
};

const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPromotion = await Promote.findByIdAndDelete(id);

    if (!deletedPromotion) {
      return res.status(404).json({ message: "Khuyến mãi không tìm thấy" });
    }

    return res.status(200).json({ message: "Xóa khuyến mãi thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Lỗi khi xóa khuyến mãi", error });
  }
};

const addPromote = async (req, res) => {
  try {
    const {
      name,
      startDate,
      endDate,
      discountValue,
      discountType,
      paymentMethod,
      minOrderValue,
      maxDiscountAmount,
      isActive,
    } = req.body;

    const promotion = new Promote({
      name,
      startDate,
      endDate,
      discountValue,
      discountType,
      paymentMethod,
      minOrderValue,
      maxDiscountAmount,
      isActive,
    });

    await promotion.save();
    res.status(201).json({ message: "Thêm khuyến mãi thành công", promotion });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi thêm khuyến mãi" });
  }
};

const applyPromote = async (req, res) => {
  const { name, purchaseAmount } = req.body;

  try {
    const promotion = await Promote.findOne({ name, isActive: true });
    if (!promotion) {
      return res.status(400).json({ message: "Mã khuyến mãi không hợp lệ" });
    }

    const now = new Date();
    if (promotion.startDate > now || promotion.endDate < now) {
      return res.status(400).json({ message: "Mã khuyến mãi đã hết hạn" });
    }

    let discountValue = promotion.discountValue;
    if (promotion.discountType === "percentage") {
      discountValue = (purchaseAmount * discountValue) / 100;
      if (
        promotion.maxDiscountAmount &&
        discountValue > promotion.maxDiscountAmount
      ) {
        discountValue = promotion.maxDiscountAmount;
      }
    }

    if (purchaseAmount < promotion.minOrderValue) {
      console.log(purchaseAmount, promotion.minOrderValue);

      return res
        .status(400)
        .json({ message: "Không đủ điều kiện áp dụng khuyến mãi" });
    }
    await promotion.save();

    return res.status(200).json({
      discountValue,
      discountType: promotion.discountType,
    });
  } catch (error) {
    return res.status(500).json({ message: "Có lỗi xảy ra", error });
  }
};

const revertPromotion = async (req, res) => {
  const { code } = req.params;
  const userId = req.user.userId;
  try {
    const promotion = await Promote.findOne({ code, isActive: true });
    if (!promotion) {
      return res
        .status(400)
        .json({ message: "Mã khuyến mãi không hợp lệ", promotion });
    }
    const userIndex = promotion.usedBy.findIndex(
      (user) => user.toString() === userId
    );
    if (userIndex === -1) {
      return res
        .status(400)
        .json({ message: "Người dùng chưa sử dụng mã khuyến mãi này" });
    }
    promotion.usedBy.splice(userIndex, 1);
    promotion.quantity += 1;
    await promotion.save();
    return res
      .status(200)
      .json({ message: "Đã hoàn lại mã khuyến mãi thành công" });
  } catch (error) {
    return res.status(500).json({ message: "Có lỗi xảy ra", error });
  }
};

const getApplicablePromotions = async (req, res) => {
  const { purchaseAmount, paymentMethod } = req.body;
  const userId = req.user.userId;
  try {
    const now = new Date();
    const promotions = await Promote.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
    const formattedPromotions = promotions.map((p) => {
      const reasons = [];
      if (p.quantity <= 0) {
        reasons.push("Khuyến mãi đã hết lượt sử dụng.");
      }
      if (p.minOrderValue > purchaseAmount) {
        const differentPrice = p.minOrderValue - purchaseAmount;
        reasons.push(
          `Mua sắm thêm ${differentPrice} VND để dùng được khuyến mãi.`
        );
      }
      if (p.paymentMethod !== "all" && p.paymentMethod !== paymentMethod) {
        reasons.push(
          `Thanh toán bằng ${p.paymentMethod} để áp dụng khuyến mãi này.`
        );
      }
      return {
        ...p.toObject(),
        isApplicable: reasons.length === 0,
        reasons,
      };
    });
    return res.status(200).json(formattedPromotions);
  } catch (error) {
    return res.status(500).json({
      message: "Có lỗi xảy ra khi lấy danh sách khuyến mãi khả dụng",
      error,
    });
  }
};

module.exports = {
  addPromote,
  applyPromote,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  revertPromotion,
  getApplicablePromotions,
};
