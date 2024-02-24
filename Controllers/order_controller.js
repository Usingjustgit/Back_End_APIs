const express = require("express");
const order_router = express.Router();
const products = require("../Database_Related_Info/Schemas/product");
const order = require("../Database_Related_Info/Schemas/order");
const authentication = require("../Authentication/user_authentication");
const cart = require("../Database_Related_Info/Schemas/cart");

//=================================================================================
//         Get All Orders
//================================================================================
order_router.get("/", authentication, async (req, res) => {
  const allOrders = await req.user.order;
  res.status(200).json({ success: true, data: allOrders });
});

//=================================================================================
//         Count Total Orders
//================================================================================
order_router.get("/count_order", authentication, async (req, res) => {
  return res
    .status(200)
    .json({ success: true, msg: "Total Orders", data: req.user.order.length });
});

//=================================================================================
//         Add Order
//================================================================================
// order_router.post("/add/order/:productId", authentication, async (req, res) => {
order_router.get("/add/order/:productId", authentication, async (req, res) => {
  console.log(req.params.productId);
  const singleOrder = req.params.productId;
  if (!singleOrder) {
    return res.status(400).json({
      success: false,
      msg: `Product is not found. Please try again.`,
    });
  }
  const {
    phone,
    country,
    state,
    district,
    city,
    shippingAddress1,
    shippingAddress2,
  } = req.body;
  try {
    console.log(await cart.findOne().exec());
    const findProductPrice = await cart
      .findOne({ _id: singleOrder })
      .populate("product")
      .exec();
    const total_price =
      findProductPrice.product.price * findProductPrice.quantity;
    const cart_product = await cart
      .findOne({ _id: singleOrder })
      .populate("product")
      .exec();
    if (cart_product.product.countInStock >= cart_product.quantity) {
      await products.updateOne(
        { _id: cart_product.product._id },
        {
          $set: {
            countInStock: (cart_product.product.countInStock -=
              cart_product.quantity),
          },
        }
      );
    } else {
      return res
        .status(400)
        .json({ success: false, msg: `Product is out of stock` });
    }
    const newOrder = await new order({
      cartItems: req.params.productId,
      phone: phone ? phone : req.user.phone,
      country: country ? country : req.user.country,
      state: state ? state : req.user.state,
      district: district ? district : req.user.district,
      city: city ? city : req.user.city,
      shippingAddress1: shippingAddress1 ? shippingAddress1 : req.user.address,
      shippingAddress2: shippingAddress2 ? shippingAddress2 : "",
      status: "Pending",
      totalPrice: total_price,
      user: req.user._id,
    }).save();
    if (!newOrder) {
      return res.status(400).json({
        success: false,
        msg: `Sorry, Your order is not added.`,
      });
    }
    req.user.cart.pull(singleOrder);
    req.user.order.push(newOrder._id);
    await req.user.save();
    res.redirect("/user/order/item");
    // return res
    //   .status(200)
    //   .json({ success: true, msg: `Order is added`, data: newOrder });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: `Intern server error ${error}` });
  }
});

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//         User Order Multiple
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// order_router.post("/all/product/", authentication, async (req, res) => {
order_router.get("/all/product/", authentication, async (req, res) => {
  const getMultipleProducts = await req.user.cart;
  console.log(getMultipleProducts.length);
  if (getMultipleProducts.length === 0) {
    return res
      .status(400)
      .json({ success: false, msg: `Product is not found. Please try again.` });
  }
  const {
    phone,
    country,
    state,
    district,
    city,
    shippingAddress1,
    shippingAddress2,
  } = req.body;
  try {
    const total_prices = await Promise.all(
      getMultipleProducts.map(async (item) => {
        const findProductPrice = await cart
          .findOne({ _id: item })
          .populate("product")
          .exec();
        return findProductPrice.product.price * findProductPrice.quantity;
      })
    );
    const total_price = total_prices.reduce((sum, num) => sum + num, 0);
    const updateProduct = await Promise.all(
      getMultipleProducts.map(async (item) => {
        const cart_product = await cart
          .findOne({ _id: item })
          .populate("product")
          .exec();
        if (cart_product.product.countInStock >= cart_product.quantity) {
          return await products.updateOne(
            { _id: cart_product.product._id },
            {
              $set: {
                countInStock: (cart_product.product.countInStock -=
                  cart_product.quantity),
              },
            }
          );
        }
        return false;
      })
    );
    if (updateProduct[0] === false) {
      return res.status(400).json({
        success: false,
        msg: `Product is out of stock. Please try again.`,
      });
    }
    const newOrder = await new order({
      cartItems: getMultipleProducts,
      phone: phone ? phone : req.user.phone,
      country: country ? country : req.user.country,
      state: state ? state : req.user.state,
      district: district ? district : req.user.district,
      city: city ? city : req.user.city,
      shippingAddress1: shippingAddress1 ? shippingAddress1 : req.user.address,
      shippingAddress2: shippingAddress2 ? shippingAddress2 : "",
      status: "Pending",
      totalPrice: total_price,
      user: req.user._id,
    }).save();
    if (!newOrder) {
      return res.status(400).json({
        success: false,
        msg: `Sorry, Your order is not added.`,
      });
    }
    getMultipleProducts.map((cart_item) => req.user.cart.pull(cart_item));
    req.user.order.push(newOrder._id);
    req.user.total_invest += total_price;
    await req.user.save();
    res.redirect("/user/order/item");
    // return res
    //   .status(200)
    //   .json({ success: true, msg: `Order is added`, data: newOrder });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: `Intern server error ${error}` });
  }
});

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//         User Delete Order
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// order_router.delete("/delete_order/:id", authentication, async (req, res) => {
order_router.get("/delete_order/:id", authentication, async (req, res) => {
  const productId = await order
    .findOne({ _id: req.params.id })
    .populate({ path: "cartItems", populate: "product" });
  const deleteSingleOrder = await order
    .deleteOne({ _id: req.params.id })
    .then((deletedOrder) => {
      req.user.order = req.user.order.filter(
        (order) => order.toString() !== req.params.id
      );
    });

  await products.updateOne(
    { _id: productId.cartItems.product._id },
    {
      $set: {
        countInStock:
          productId.cartItems.product.countInStock +
          productId.cartItems.quantity,
      },
    }
  );
  req.user.save();
  res.redirect("/user/order/item");
});

module.exports = order_router;
