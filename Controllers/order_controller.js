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

// //=================================================================================
// //         Update Single Order  &&  This user only for admin and product_owner
// //=================================================================================
// order_router.put(
//   "/:id",
//   authentication,
//   restrictTo("admin", "super_admin", "product_owner"),
//   async (req, res) => {
//     try {
//       const isOrderUpdate = await order
//         .updateOne(
//           {
//             _id: req.params.id,
//           },
//           { $set: { status: "shipped" } }
//         )
//         .exec();
//       if (!isOrderUpdate) {
//         res.status(404).json({ success: false, msg: `Order is not found` });
//       }
//       res
//         .status(200)
//         .json({ success: true, msg: `Order is updated`, data: singleOrder });
//     } catch (error) {
//       return res
//         .status(500)
//         .json({ success: false, msg: `Intern server error ${error}` });
//     }
//   }
// );

// //=================================================================================
// //         Delete Single Order
// //================================================================================
// order_router.delete("/:id", authentication, async (req, res) => {
//   try {
//     const deleteSingleOrder = await req.user.order
//       .deleteOne({ _id: req.params.id })
//       .then(async (order) => {
//         if (order) {
//           order.orderItems
//             .map(async (orderItemId) => {
//               req.user.total_invest -=
//                 orderItemId.products.price * orderItemId.quantity;
//               await order_items.deleteOne({ _id: orderItemId });
//             })
//             .catch((error) =>
//               res
//                 .status(400)
//                 .json({ success: false, msg: `Order is not found ${error}` })
//             );
//         } else {
//           return res
//             .status(404)
//             .json({ success: false, msg: `Order is not found` });
//         }
//       });
//     const isUserUpdate = await User.updateOne(
//       { _id: req.user._id },
//       { $pull: { order: req.params.id } }
//     );
//     if (!deleteSingleOrder || !isUserUpdate) {
//       res.status(404).json({ success: false, msg: `Order is not found` });
//     }
//     res
//       .status(200)
//       .json({ success: true, msg: `Order is deleted`, data: singleOrder });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, msg: `Intern server error ${error}` });
//   }
// });

// //=================================================================================
// //         Delete All Order
// //================================================================================
// order_router.delete("/", authentication, async (req, res) => {
//   try {
//     const allOrder = await req.user.order.map((singleOrder) =>
//       singleOrder.delete().then(async (order) => {
//         if (order) {
//           order
//             .map(async (order) =>
//               order.orderItems.map(async (orderItemId) => {
//                 req.user.total_invest -=
//                   orderItemId.products.price * orderItemId.quantity;
//                 await order_items.deleteOne({ _id: orderItemId });
//               })
//             )
//             .catch((error) =>
//               res
//                 .status(400)
//                 .json({ success: false, msg: `Order is not found ${error}` })
//             );
//         } else {
//           return res
//             .status(404)
//             .json({ success: false, msg: `Orders is not found` });
//         }
//       })
//     );
//     const isUserUpdate = await User.updateOne(
//       { _id: req.user._id },
//       { $set: { order: [] } }
//     );
//     if (!allOrder || !isUserUpdate) {
//       res.status(404).json({ success: false, msg: `Order is not found` });
//     }
//     res
//       .status(200)
//       .json({ success: true, msg: `Order is deleted`, data: allOrder });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ success: false, msg: `Intern server error ${error}` });
//   }
// });

// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//         User Order Multiple
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

order_router.post("/all/product/", authentication, async (req, res) => {
  const getMultipleProducts = await req.user.cart;
  if (!getMultipleProducts) {
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
    console.log(getMultipleProducts);
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
    req.user.order.push(newOrder._id);
    await req.user.save();

    return res
      .status(200)
      .json({ success: true, msg: `Order is added`, data: newOrder });
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
order_router.delete("/delete_order/:id", authentication, async (req, res) => {
  const deleteSingleOrder = await order
    .deleteOne({ _id: req.params.id })
    .then((deletedOrder) => {
      req.user.order = req.user.order.filter(
        (order) => order.toString() !== req.params.id
      );
    });
  req.user.save();
});

module.exports = order_router;
