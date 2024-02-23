const express = require("express");
const cart = require("../Database_Related_Info/Schemas/cart");
const authentication = require("../Authentication/user_authentication");
const products = require("../Database_Related_Info/Schemas/product");
const cart_router = express.Router();

cart_router.post("/product/add_to_cart", authentication, async (req, res) => {
  const { quantity, product } = req.body;
  if (!product) {
    return res
      .status(404)
      .json({ success: false, msg: `Not found any product.` });
  }
  try {
    const isProductAvailable = await products.findOne({ _id: product });
    if (!isProductAvailable) {
      return res
        .status(404)
        .json({ success: false, msg: `Not found any product.` });
    }
    const isAddIntoCart = await new cart({ quantity, product }).save();
    if (!isAddIntoCart) {
      return res.status(500).json({
        success: false,
        msg: `Sorry, Your data is not saved, Please try again ....`,
      });
    }
    const isAddUserCart = await req.user.cart.push(isAddIntoCart._id);
    await req.user.save();
    if (!isAddUserCart) {
      return res
        .status(500)
        .json({ success: false, msg: `Sorry, Your data is not saved` });
    }
    res
      .status(200)
      .json({ success: true, msg: `Your data is saved successfully` });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: `Internal server error ${error}` });
  }
});

cart_router.put(
  "/product/update_cart/:id",
  authentication,
  async (req, res) => {
    try {
      const isProductIntoCart = await cart
        .updateOne(
          { _id: req.params.id },
          { $set: { quantity: req.body.quantity } }
        )
        .exec();
      if (!isProductIntoCart) {
        return res.status(500).json({
          success: false,
          msg: `Sorry, Your data is not present ....`,
        });
      }
      res
        .status(200)
        .json({ success: true, msg: `Your cart is update successfully` });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, msg: `Internal server error ${error}` });
    }
  }
);

cart_router.delete(
  "/product/remove_from_cart/:id",
  authentication,
  async (req, res) => {
    try {
      const isDeleteIntoCart = await cart
        .deleteOne({ _id: req.params.id })
        .exec();
      if (!isDeleteIntoCart) {
        return res.status(500).json({
          success: false,
          msg: `Sorry, Your data is not present ....`,
        });
      }
      const isDeleteUserCart = await req.user.cart.map(async (cartId) => {
        const user_carts = await req.user.cart;
        user_carts.map(async (cartId) => {
          if (cartId == req.params.id) {
            await req.user.cart.pull(cartId);
            await req.user.save();
          }
        });
      });
      if (!isDeleteUserCart) {
        return res.status(500).json({
          success: false,
          msg: `Sorry, Your cart item is not deleted`,
        });
      }
      res
        .status(200)
        .json({ success: true, msg: `Your cart is update successfully` });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, msg: `Internal server error ${error}` });
    }
  }
);

module.exports = cart_router;
