const express = require("express");
const products = require("../Database_Related_Info/Schemas/product");
const product_router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authentication = require("../Authentication/user_authentication");
const restrictTo = require("../Authentication/auth_based_on_role");
const dummy = require("../Dummy");

//=================================================================================
//      Get All Products
//================================================================================
product_router.get("/", async (req, res) => {
  const AllProducts = await products.find();
  res.status(200).json({ success: true, data: AllProducts });
});

//=================================================================================
//      Get Single Products
//================================================================================
product_router.get("/:id", async (req, res) => {
  const products = await products.find({ _id: req.params.id }).exec();
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
  uploads.fields(
    {
      name: "image",
      maxCount: 1,
    },
    {
      name: "images",
      maxCount: 5,
    },
    {
      name: "videos",
      maxCount: 5,
    }
  ),
  restrictTo("admin", "super_admin", "product_owner"),
  async (req, res) => {
    let image = "demo.jpg";
    let images = [];
    let videos = [];
    if (req.files["image"][0].filename) {
      let image = `${req.protocol}://${req.get(
        "host"
      )}/uploads/users_profile_pictures/${req.fields["image"][0].filename}`;
    }
    if (req.files["images"] || null) {
      images = req.fields.images.map(
        (image) =>
          `${req.protocol}://${req.get(
            "host"
          )}/uploads/users_profile_pictures/${image.filename}`
      );
    }
    if (req.files["videos"] || null) {
      videos = req.fields.videos.map(
        (video) =>
          `${req.protocol}://${req.get(
            "host"
          )}/uploads/users_profile_pictures/${video.filename}`
      );
    }
    const {
      product_name,
      description,
      richdescription,
      company,
      price,
      weight,
      color,
      category,
      subcategory_name,
      countInStock,
      isFeatured,
    } = req.body;
    if (
      !product_name ||
      !description ||
      !company ||
      !category ||
      !price ||
      !image
    ) {
      return res
        .status(400)
        .json({ success: false, msg: `All fields are required` });
    }
    try {
      const isPoroductExist = await products.findOne({ product_name }).exec();
      if (isPoroductExist) {
        return res.status(400).json({
          success: false,
          msg: `Product ${isPoroductExist} is already exist`,
        });
      }
      const isProductadded = await new products({
        product_name,
        description,
        richdescription,
        image,
        images,
        videos,
        company,
        price,
        weight,
        color,
        category,
        subcategory_name,
        countInStock,
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
//      Update Product
//================================================================================
product_router.put(
  "/:id",
  authentication,
  restrictTo("admin", "super_admin", "product_owner"),
  uploads.single("image"),
  async (req, res) => {
    if (req.file) {
      image = `${req.protocol}://${req.get(
        "host"
      )}/uploads/users_profile_pictures/${image.filename}`;
    }
    const isPoroductExist = await products
      .findOne({
        _id: req.params.id,
      })
      .exec();
    if (!isPoroductExist) {
      return res.status(400).json({
        success: false,
        msg: `Product ${name} is not exist`,
      });
    }
    const {
      product_name,
      description,
      richdescription,
      company,
      price,
      weight,
      color,
      category,
      subcategory_name,
      countInStock,
      isFeatured,
    } = req.body;
    try {
      const isProductadded = await products
        .updateOne(
          { _id: req.params.id },
          {
            product_name: product_name
              ? product_name
              : isPoroductExist.product_name,
            description: description
              ? description
              : isPoroductExist.description,
            richdescription,
            company: company ? company : isPoroductExist.company,
            price: price ? price : isPoroductExist.price,
            image: image ? image : isPoroductExist.image,
            weight: weight ? weight : isPoroductExist.weight,
            color: color ? color : isPoroductExist.color,
            category: category ? category : isPoroductExist.category,
            subcategory_name: subcategory_name
              ? subcategory_name
              : isPoroductExist.subcategory_name,
            countInStock: countInStock
              ? countInStock
              : isPoroductExist.countInStock,
            isFeatured: isFeatured ? isFeatured : isPoroductExist.isFeatured,
          }
        )
        .exec();
      if (!isProductadded) {
        return res
          .status(400)
          .json({ success: false, msg: `something went wrong` });
      }
      res
        .status(200)
        .json({ success: true, msg: `Product update successfully` });
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
product_router.delete(
  "/:id",
  authentication,
  restrictTo("admin", "super_admin", "product_owner"),
  async (req, res) => {
    try {
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      //      Is User Exist on Our Database or not
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      const isProductExist = await products
        .findOne({ _id: req.params.id })
        .exec();
      if (!isProductExist) {
        return res.status(400).json({ success: false, msg: `User not found` });
      }
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      //      Remove Image from Storage and clean space
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      if (isProductExist.image && isProductExist.image !== "demo.jpg") {
        const imagePath = path.resolve(
          __dirname,
          `../uploads/products_images/${isProductExist.image}`
        );
        fs.unlinkSync(imagePath);
      }
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      //      Remove Images from Storage and clean space
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      if (isProductExist.images.length) {
        isProductExist.images.forEach((image) => {
          const imagePath = path.resolve(
            __dirname,
            `../uploads/products_images/${image}`
          );
          fs.unlinkSync(imagePath);
        });
      }
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      //      Remove Videos from Storage and clean space
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      if (isProductExist.videos.length) {
        isProductExist.videos.forEach((video) => {
          const videoPath = path.resolve(
            __dirname,
            `../uploads/products_videos/${video}`
          );
          fs.unlinkSync(videoPath);
        });
      }
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      //      Delete User  from Storage and clean space
      //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      const isProductDelete = await products
        .deleteOne({
          _id: isProductExist._id,
        })
        .exec();
      if (!isProductDelete) {
        return res
          .status(400)
          .json({ success: false, msg: `Something went wrong` });
      }
      res
        .status(200)
        .json({ success: true, msg: `Product deleted successfully` });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, msg: `Internal server error ${error}` });
    }
  }
);

//=================================================================================
//      Other Query for Products Like find Based on Product name, Price rang,
//      price, price acceding order and order
//================================================================================

//=================================================================================
//      Add Product
//================================================================================

module.exports = product_router;
