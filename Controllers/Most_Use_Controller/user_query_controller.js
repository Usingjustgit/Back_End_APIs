const express = require("express");
const user_query_router = express.Router();
const product = require("../../Database_Related_Info/Schemas/product");

user_query_router.get("/get_product/", async (req, res) => {
  console.log(typeof req.query);
  const { name, company, price, category, rating, isFeatured, sort } =
    req.query;
  const userQueryObject = {};
  try {
    if (name) {
      userQueryObject.name = {
        $regex: name,
        $options: "i",
      };
    }
    if (company) {
      userQueryObject.company = {
        $regex: company,
        $options: "i",
      };
    }
    if (price) {
      userQueryObject.price = {
        $lte: price,
      };
    }
    if (category) {
      userQueryObject.category = {
        $regex: category,
        $options: "i",
      };
    }
    if (rating) {
      userQueryObject.rating = {
        $gte: rating,
      };
    }
    if (isFeatured) {
      userQueryObject.isFeatured = {
        $eq: isFeatured,
      };
    }
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //      This variable is finding the all products;
    let preSortQuery = product
      .find(userQueryObject)
      .select("-__v -_id -password");
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    if (sort) {
      let sortFlex = sort.replace(",", " ");
      userQueryObject.sort = sortFlex;
      preSortQuery = preSortQuery.sort(userQueryObject.sort);
      console.log(preSortQuery);
    }
    const filteredProduct = await preSortQuery.exec();
    if (!filteredProduct) {
      res.status(200).json({ success: true, data: filteredProduct });
    } else {
      res.status(200).json({
        success: true,
        data: await product.find().select("-__v -_id -password").exec(),
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: `Something went wrong ${error}`,
    });
  }
});

module.exports = user_query_router;
