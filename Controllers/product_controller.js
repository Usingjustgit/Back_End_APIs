const express = require("express");
const products = require("../Database_Related_Info/Schemas/product");
const product_router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authentication = require("../Authentication/user_authentication");
const restrictTo = require("../Authentication/auth_based_on_role");
const Category = require("../Database_Related_Info/Schemas/category");

//=================================================================================
//      Get All Products
//================================================================================
product_router.get("/", async (req, res) => {
  const AllProducts = await products.find().populate("category", "-_id").exec();
  res.status(200).json({ success: true, data: AllProducts });
});

//=================================================================================
//      Get Single Products
//================================================================================
product_router.get("/:id", async (req, res) => {
  const products = await products
    .find({ _id: req.params.id })
    .populate("category")
    .exec();
  res.status(200).json({ success: true, data: products });
});

//=================================================================================
//      Add Product
//================================================================================
//      Image Uploads and Validation
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const videosMimeTypes = ["video/mp4", "video/webm", "video/ogg"];

const storage = multer.diskStorage({
  destination: function (res, file, cb) {
    const isValidImage = imageMimeTypes.includes(file.mimetype);
    const isValidVideo = videosMimeTypes.includes(file.mimetype);
    if (!isValidImage && !isValidVideo) {
      const error = res.status(400).json({
        success: false,
        msg: `Invalid image or video type ${file.mimetype}`,
      });
      cb(error, "uploads/products_images/");
    }
    if (isValidImage) {
      cb(null, "uploads/products_images/");
    }
    if (isValidVideo) {
      cb(null, "uploads/products_videos/");
    }
  },
  filename: function (res, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const uploads = multer({ storage });
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
product_router.post(
  "/add",
  authentication,
  restrictTo("admin", "super_admin", "product_owner"),
  uploads.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 11 },
    { name: "videos", maxCount: 5 },
  ]),
  async (req, res) => {
    const image = req.files["image"][0].filename;
    const images = req.files["images"].map((file) => file.filename);
    const videos = req.files["videos"].map((file) => file.filename);
    const {
      name,
      description,
      richdescription,
      brand,
      price,
      category,
      countInStock,
      rating,
      isFeatured,
    } = req.body;
    if (
      !name ||
      !description ||
      !image ||
      !brand ||
      !category ||
      !price ||
      !isFeatured
    ) {
      return res
        .status(400)
        .json({ success: false, msg: `All fields are required` });
    }
    try {
      const isPoroductExist = await products.findOne({ name }).exec();
      console.log(isPoroductExist);
      if (isPoroductExist) {
        return res.status(400).json({
          success: false,
          msg: `Product ${isPoroductExist} is already exist`,
        });
      }
      // const isCategoryExist = await Category.findOne({ _id: category }).exec();
      // if (isCategoryExist) {
      //   return res
      //     .status(400)
      //     .json({ success: false, msg: `Category is not find.` });
      // }
      const isProductadded = await new products({
        name,
        description,
        richdescription,
        image,
        images,
        brand,
        price,
        category,
        countInStock,
        rating,
        isFeatured,
        videos,
      }).save();
      if (!isProductadded) {
        return res
          .status(400)
          .json({ success: false, msg: `something went wrong` });
      }
      res
        .status(200)
        .json({ success: true, msg: `Product added successfully` });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, msg: `Internal server error ${error}` });
    }
  }
);

//=================================================================================
//      Update Product
//================================================================================
product_router.put(
  "/:id",
  authentication,
  restrictTo("admin", "super_admin", "product_owner"),
  async (req, res) => {
    const isPoroductExist = await products
      .findOne({
        _id: req.params.id,
      })
      .exec();
    if (!isPoroductExist) {
      return res.status(400).json({
        success: false,
        msg: `Product ${name} is already exist`,
      });
    }

    const {
      name,
      description,
      richdescription,
      brand,
      price,
      category,
      countInStock,
      rating,
      isFeatured,
    } = req.body;
    if (
      !name ||
      !description ||
      !image ||
      !brand ||
      !category ||
      !price ||
      !isFeatured
    ) {
      return res
        .status(400)
        .json({ success: false, msg: `All fields are required` });
    }
    try {
      const isProductadded = await Product({
        name,
        description,
        richdescription,
        brand,
        price,
        category,
        countInStock,
        rating,
        isFeatured,
      }).save();
      if (!isProductadded) {
        return res
          .status(400)
          .json({ success: false, msg: `something went wrong` });
      }
      res
        .status(200)
        .json({ success: true, msg: `Product added successfully` });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, msg: `Internal server error ${error}` });
    }
  }
);

//=================================================================================
//      Delete Product
//================================================================================
product_router.delete("/:id", async (req, res) => {
  try {
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //      Is User Exist on Our Database or not
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    const isUserExist = await products.findOne({ _id: req.params.id }).exec();
    if (!isUserExist) {
      return res.status(400).json({ success: false, msg: `User not found` });
    }
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //      Remove Image from Storage and clean space
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    const imagePath = path.resolve(
      __dirname,
      `../uploads/products_images/${isUserExist.image}`
    );

    fs.unlinkSync(imagePath);
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //      Remove Images from Storage and clean space
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    isUserExist.images.forEach((image) => {
      const imagePath = path.resolve(
        __dirname,
        `../uploads/products_images/${image}`
      );
      fs.unlinkSync(imagePath);
    });
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //      Remove Videos from Storage and clean space
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    isUserExist.videos.forEach((video) => {
      const videoPath = path.resolve(
        __dirname,
        `../uploads/products_videos/${video}`
      );
      fs.unlinkSync(videoPath);
    });
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //      Delete User  from Storage and clean space
    //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    const isProductDelete = await products
      .deleteOne({
        _id: isUserExist._id,
      })
      .exec();
    if (!isProductDelete) {
      return res
        .status(400)
        .json({ success: false, msg: `Something went wrong` });
    }
    res.status(200).json({ success: true, msg: `user deleted successfully` });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: `Internal server error ${error}` });
  }
});

//=================================================================================
//      Update Product Images, Image, and Video
//================================================================================

//=================================================================================
//      Other Query for Products Like find Based on Product name, Price rang,
//      price, price acceding order and order
//================================================================================

//=================================================================================
//      Add Product
//================================================================================

module.exports = product_router;
