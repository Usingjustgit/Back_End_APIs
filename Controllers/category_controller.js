const express = require("express");
const Category = require("../Database_Related_Info/Schemas/category");
const category_router = express.Router();
const path = require("path");
const fs = require("fs");

//===============================================================================
//      Get all Category
//===============================================================================
category_router.get("/", async (req, res) => {
  const allCategory = await Category.findOne().exec();
  return res.status(200).json({ success: true, data: allCategory });
});

//===============================================================================
//      Get Single Category
//===============================================================================
category_router.get("/:id", async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id }).exec();
  return res.status(200).json({ success: true, data: category });
});

//===============================================================================
//      Add Category
//===============================================================================
//      Image Validation
//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const multer = require("multer");
const authentication = require("../Authentication/user_authentication");
const restrictTo = require("../Authentication/auth_based_on_role");
const User = require("../Database_Related_Info/Schemas/user");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValidImage = imageMimeTypes.includes(file.mimetype);
    if (!isValidImage) {
      const error = new Error(`Invalid image type ${file.mimetype}`);
      error.code = "FILE_TYPE";
      return cb(error, "uploads/category_images/");
    }
    cb(null, "uploads/category_images/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const uploads = multer({ storage });
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
category_router.post(
  "/add",
  authentication,
  restrictTo("admin", "super_admin", "product_owner"),
  uploads.fields([
    { name: "image", maxCount: 1 },
    { name: "icon", maxCount: 1 },
  ]),
  async (req, res) => {
    const image = req.files["image"][0].filename;
    const icon = req.files["icon"][0].filename;
    const { name, color } = req.body;
    if (!name || !color || !icon || !image) {
      return res
        .status(400)
        .json({ success: false, msg: "All fields are required" });
    }
    try {
      const isCategoryExist = await Category.findOne({ name }).exec();
      if (isCategoryExist) {
        return res
          .status(400)
          .json({ success: false, msg: `${name} category already exists.` });
      }
      const isCategoryAdd = await Category({ name, image, color, icon }).save();
      if (!isCategoryAdd) {
        return res
          .status(400)
          .json({ success: false, msg: `Something went wrong` });
      }
      res
        .status(200)
        .json({ success: true, msg: `Category added successfully` });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, msg: `Internal server error ${error}` });
    }
  }
);

//===============================================================================
//      Update Category
//===============================================================================
category_router.put(
  "/:id",
  authentication,
  restrictTo("admin", "super_admin", "product_owner"),
  async (req, res) => {
    const { name, color } = req.body;
    try {
      const isCategoryExist = await Category.findOne({
        _id: req.params.id,
      }).exec();
      if (!isCategoryExist) {
        return res
          .status(404)
          .json({ success: false, msg: `Category is not found.` });
      }
      const isCategoryUpdate = await new Category({ name, color }).save();
      if (!isCategoryUpdate) {
        return res
          .status(400)
          .json({ success: false, msg: "Category is not update" });
      }
      res
        .status(200)
        .json({ success: true, msg: "Category update successfully." });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, msg: `Internal server error ${error}` });
    }
  }
);

//===============================================================================
//      Delete Category
//===============================================================================
category_router.delete("/:id", async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id }).exec();
  if (!category) {
    return res
      .status(404)
      .json({ success: false, msg: "Category is not found." });
  }
  const imagePath = path.resolve(
    __dirname,
    `../uploads/category_images/${category.image}`
  );
  const iconPath = path.resolve(
    __dirname,
    `../uploads/category_images/${category.icon}`
  );
  fs.unlinkSync(imagePath);
  fs.unlinkSync(iconPath);

  const isDeletedCategory = await Category.deleteOne({
    _id: category._id,
  }).exec();
  if (!isDeletedCategory) {
    return res
      .status(400)
      .json({ success: false, msg: "Category is not deleted." });
  }
  return res
    .status(200)
    .json({ success: true, msg: "Delete category successfully." });
});

module.exports = category_router;
