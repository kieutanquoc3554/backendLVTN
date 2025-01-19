const express = require("express");
const Cart = require("../models/cartModel");

const updateCart = async (req, res) => {
  const { cartItems } = req.body;
  const userId = req.user.userId;
  try {
    let cart = await Cart.findOne({ userId });
    if (cart) {
      cart.items = cartItems;
      await cart.save();
    } else {
      cart = new Cart({ userId, items: cartItems });
      await cart.save();
    }
    res.status(200).json({ message: "Giỏ hàng đã được cập nhật thành công" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Có lỗi xảy ra", error });
  }
};

const getCart = async (req, res) => {
  const userId = req.user.userId;
  try {
    const cart = await Cart.findOne({ userId });
    if (cart) {
      res.status(200).json({ items: cart.items });
    } else {
      res.status(200).json({ items: [] });
    }
  } catch (error) {
    res.status(500).json({ message: "Có lỗi xảy ra", error });
  }
};

module.exports = { updateCart, getCart };
