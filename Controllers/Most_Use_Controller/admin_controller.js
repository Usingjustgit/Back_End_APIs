const express = require("express");
const authentication = require("../../Authentication/user_authentication");
const restrictTo = require("../../Authentication/auth_based_on_role");
const products = require("../../Database_Related_Info/Schemas/product");
const User = require("../../Database_Related_Info/Schemas/user");
const admin_router = express.Router();

//=================================================================================
//         Display Total incomes from Users
//================================================================================
admin_router.get(
  "/total_incomes",
  authentication,
  restrictTo("admin", "super_admin"),
  async (req, res) => {
    let total_incomes = 0;
    const total_User = await User.find();
    total_User.map((user) => {
      total_incomes += user.total_invest;
    });
    return res.status(200).json({
      success: true,
      msg: "Highest selling product",
      data: total_incomes,
    });
  }
);

//=================================================================================
//         Display Highest selling product
//================================================================================
admin_router.get(
  "/highest_selling_product",
  authentication,
  restrictTo("admin", "super_admin"),
  async (req, res) => {
    return res.status(200).json({
      success: true,
      msg: "Highest selling product",
      data: await products.find().sort({ count_selling: -1 }),
    });
  }
);

//=================================================================================
//         Display Highest investing User
//================================================================================
admin_router.get(
  "/highest_investing_user",
  authentication,
  restrictTo("admin", "super_admin"),
  async (req, res) => {
    const skip = req.query.page * 3 || 0;
    return res.status(200).json({
      success: true,
      msg: "Highest selling product",
      data: await User.find()
        .populate("order", "total_invest", "name", "email")
        .sort({ total_invest: -1 })
        .skip(skip)
        .limit(6),
    });
  }
);

//=================================================================================
//         Display Total Products
//================================================================================
admin_router.get(
  "/total_products",
  authentication,
  restrictTo("admin", "super_admin", "product_owner"),
  async (req, res) => {
    return res.status(200).json({
      success: true,
      msg: "Highest selling product",
      data: await products.countDocuments((count) => count),
    });
  }
);

module.exports = admin_router;
