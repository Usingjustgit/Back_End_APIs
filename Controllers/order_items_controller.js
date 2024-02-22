const express = require("express");
const order_items = require("../Database_Related_Info/Schemas/orderItems");
const order_items_router = express.Router();

order_items_router.post("/", async (req, res) => {
  const { quantity, products } = req.body;
  if (!products) {
    return res
      .status(404)
      .json({ success: false, msg: `Not found any product.` });
  }
  try {
    const isAddOrderItem = await new order_items({ quantity, products }).save();
    if (!isAddOrderItem) {
      return res.status(500).json({
        success: false,
        msg: `Sorry, Your data is not saved, Please try again ....`,
      });
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

module.exports = order_items_router;
