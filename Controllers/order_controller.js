const express = require("express");
const order_router = express.Router();
const order_items = require("../Database_Related_Info/Schemas/orderItems");
const products = require("../Database_Related_Info/Schemas/product");
const User = require("../Database_Related_Info/Schemas/user");
const order = require("../Database_Related_Info/Schemas/order");
const authentication = require("../Authentication/user_authentication");
const restrictTo = require("../Authentication/auth_based_on_role");

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
//         Count Total Of Orders By Orders
//================================================================================
order_router.get("/count_order", authentication, async (req, res) => {
  return res
    .status(200)
    .json({ success: true, msg: "Total Orders", data: req.user.order.length });
});

//=================================================================================
//         Add Orders
//================================================================================
order_router.post("/add", authentication, async (req, res) => {
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //      Calculating Total Price
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const calculateTotalPrice = (
    await Promise.all(
      req.body.orderItems.map(async (item) => {
        const isProductExist = await products
          .findOne({ _id: item.products })
          .exec();
        if (!isProductExist) {
          return res.status(400).json({
            success: false,
            msg: `Product is not found. Please try again.`,
          });
        }
        return isProductExist.price * item.quantity;
      })
    )
  ).reduce((sum, num) => sum + num, 0);
  req.user.total_invest += calculateTotalPrice;
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //     Get data from body.
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const { shippingAddress1, shippingAddress2, city, zip, country, phone } =
    req.body;
  if (!phone || !country || !city) {
    return res
      .status(400)
      .json({ success: false, msg: `All fields are required` });
  }

  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //     Get All orderItems ids from body.
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  const orderItemsIds = await Promise.all(
    await req.body.orderItems.map(async (item) => {
      const isAddItem = await new order_items({
        products: item.products,
        quantity: item.quantity,
      }).save();
      if (!isAddItem) {
        return res
          .status(500)
          .json({ success: false, msg: `Sorry, Your order is not added.` });
      }
      return isAddItem._id;
    })
  );
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  //     Create Order
  //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  try {
    const createOrder = await new order({
      orderItems: orderItemsIds,
      shippingAddress1,
      shippingAddress2,
      city,
      zip,
      country,
      phone,
      totalPrice: calculateTotalPrice,
      user: req.user._id,
    }).save();
    if (!createOrder) {
      return res
        .status(400)
        .json({ success: false, msg: `Sorry,Order not created` });
    }
    res.status(200).json({ success: true, msg: `Order created successfully` });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: `Intern server error ${error}` });
  }
});

//=================================================================================
//         Update Single Order  &&  This user only for admin and product_owner
//=================================================================================
order_router.put(
  "/:id",
  authentication,
  restrictTo("admin", "super_admin", "product_owner"),
  async (req, res) => {
    try {
      const isOrderUpdate = await order
        .updateOne(
          {
            _id: req.params.id,
          },
          { $set: { status: "shipped" } }
        )
        .exec();
      if (!isOrderUpdate) {
        res.status(404).json({ success: false, msg: `Order is not found` });
      }
      res
        .status(200)
        .json({ success: true, msg: `Order is updated`, data: singleOrder });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, msg: `Intern server error ${error}` });
    }
  }
);

//=================================================================================
//         Delete Single Order
//================================================================================
order_router.delete("/:id", authentication, async (req, res) => {
  try {
    const deleteSingleOrder = await req.user.order
      .deleteOne({ _id: req.params.id })
      .then(async (order) => {
        if (order) {
          order.orderItems
            .map(async (orderItemId) => {
              req.user.total_invest -=
                orderItemId.products.price * orderItemId.quantity;
              await order_items.deleteOne({ _id: orderItemId });
            })
            .catch((error) =>
              res
                .status(400)
                .json({ success: false, msg: `Order is not found ${error}` })
            );
        } else {
          return res
            .status(404)
            .json({ success: false, msg: `Order is not found` });
        }
      });
    const isUserUpdate = await User.updateOne(
      { _id: req.user._id },
      { $pull: { order: req.params.id } }
    );
    if (!deleteSingleOrder || !isUserUpdate) {
      res.status(404).json({ success: false, msg: `Order is not found` });
    }
    res
      .status(200)
      .json({ success: true, msg: `Order is deleted`, data: singleOrder });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, msg: `Intern server error ${error}` });
  }
});

//=================================================================================
//         Delete All Order
//================================================================================
order_router.delete("/", authentication, async (req, res) => {
  try {
    console.log(req.user.order);
    const allOrder = await req.user.order.map((singleOrder) =>
      singleOrder.delete().then(async (order) => {
        if (order) {
          order
            .map(async (order) =>
              order.orderItems.map(async (orderItemId) => {
                req.user.total_invest -=
                  orderItemId.products.price * orderItemId.quantity;
                await order_items.deleteOne({ _id: orderItemId });
              })
            )
            .catch((error) =>
              res
                .status(400)
                .json({ success: false, msg: `Order is not found ${error}` })
            );
        } else {
          return res
            .status(404)
            .json({ success: false, msg: `Orders is not found` });
        }
      })
    );
    const isUserUpdate = await User.updateOne(
      { _id: req.user._id },
      { $set: { order: [] } }
    );
    if (!allOrder || !isUserUpdate) {
      res.status(404).json({ success: false, msg: `Order is not found` });
    }
    res
      .status(200)
      .json({ success: true, msg: `Order is deleted`, data: allOrder });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, msg: `Intern server error ${error}` });
  }
});

module.exports = order_router;
