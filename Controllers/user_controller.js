const express = require("express");
const User = require("../Database_Related_Info/Schemas/user");
const user_router = express.Router();
const bcrypt = require("bcryptjs");
const authentication = require("../Authentication/user_authentication");
const restrictTo = require("../Authentication/auth_based_on_role");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sendMail = require("../Authentication/send_email");

//=================================================================================
//      Get All Users
//=================================================================================
user_router.get(
  "/",
  authentication,
  restrictTo("admin", "super_admin", "product_owner"),
  async (req, res) => {
    if (req.user.role === "admin" || req.user.role === "super_admin") {
      const allUser = await User.find().sort({ createdAt: -1 }).exec();
      res.status(200).json({ msg: "Here Your all users", data: allUser });
    }
    if (req.user.role === "product_owner") {
      const allUser = await User.find({ role: "user" })
        .populate({ path: "order", populate: { path: "product" } })
        .sort({ createdAt: -1 })
        .exec();
      res.status(200).json({ msg: "Here Your all users", data: allUser });
    }
  }
);

//=================================================================================
//      Get Single User
//================================================================================
user_router.get(
  "/:id",
  authentication,
  restrictTo("admin", "super_admin", "product_owner"),
  async (req, res) => {
    if (req.user.role === "admin" || req.user.role === "super_admin") {
      const allUser = await User.find({ _id: req.params.id })
        .sort({ createdAt: -1 })
        .exec();
      res.status(200).json({ msg: "Here Your all users", data: allUser });
    }
    if (req.user.role === "product_owner") {
      const allUser = await User.find(
        $and[({ _id: req.params.id }, { role: "user" })]
      )
        .populate({ path: "order", populate: { path: "product" } })
        .sort({ createdAt: -1 })
        .exec();
      res.status(200).json({ msg: "Here Your all users", data: allUser });
    }
  }
);

//================================================================================
//      Add User
// ================================================================================
const imageMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValidImage = imageMimeTypes.includes(file.mimetype);
    if (!isValidImage) {
      return res
        .status(400)
        .json({ success: false, msg: `Invalid ${file.mimetype}` });
    }
    cb(null, "uploads/users_profile_pictures/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });
user_router.post(
  "/add",
  authentication,
  restrictTo("admin", "super_admin"),
  upload.single("profile_picture"),
  async (req, res) => {
    const profile_picture = req.file.filename;
    const { name, email, street, apartment, city, zip, country, phone } =
      req.body;
    let password = req.body.password;

    if (!name || !email || !password || !country || !phone) {
      return res
        .status(400)
        .json({ success: false, msg: "All fields are required" });
    }

    try {
      const isUserExist = await User.findOne({ email }).exec();

      if (isUserExist) {
        return res.status(400).json({
          success: false,
          msg: `User with email ${email} already exist`,
        });
      }

      password = await bcrypt.hash(password, 11);

      const isUserSave = await User({
        name,
        email,
        password,
        street,
        apartment,
        city,
        zip,
        country,
        phone,
        profile_picture,
      }).save();

      if (!isUserSave) {
        return res
          .status(500)
          .json({ success: false, msg: "Something went wrong" });
      }

      res.status(200).json({ success: true, msg: "User created successfully" });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, msg: `Internal server error ${error}` });
    }
  }
);

//================================================================================
//      Update User
// ================================================================================
user_router.put(
  "/:email",
  authentication,
  restrictTo("user", "admin", "super_admin", "product_owner"),
  upload.single("profile_picture"),
  async (req, res) => {
    if (req.file.filename) {
      const oldFilePath = path.resolve(
        __dirname,
        `../uploads/users_profile_pictures/${req.body.old_profile_picture}`
      );
      fs.unlinkSync(oldFilePath);
      profile_picture = req.file.filename;
    }
    const { name, email, street, apartment, city, zip, country, phone } =
      req.body;

    if (!name || !email || !phone || !country) {
      return res
        .status(400)
        .json({ success: false, msg: "All fields are required" });
    }

    try {
      const isUserExist = await User.findOne({
        email: req.params.email,
      }).exec();
      if (!isUserExist) {
        return res.status(400).json({ success: false, msg: "User not found" });
      }
      const isUpdateUser = await User.updateOne(
        { _id: isUserExist._id },
        { name, street, apartment, city, zip, country, phone, profile_picture }
      );
      if (!isUpdateUser) {
        return res
          .status(400)
          .json({ success: false, msg: `Something went wrong` });
      }
      res.status(200).json({ success: true, msg: `User updated successfully` });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, msg: `Internal server error ${error}` });
    }
  }
);

//================================================================================
//      Delete User
// ================================================================================
user_router.delete(
  "/:id",
  authentication,
  restrictTo("admin", "super_admin", "product_owner", "user"),
  async (req, res) => {
    try {
      const isUserExist = await User.findOne({ _id: req.params.id }).exec();
      if (!isUserExist) {
        return res.status(400).json({ success: false, msg: `User not found` });
      }
      const profile_picture_file_path = path.resolve(
        __dirname,
        `../uploads/users_profile_pictures/${isUserExist.profile_picture}`
      );
      fs.unlinkSync(profile_picture_file_path);
      const isUserDeleted = await User.deleteOne({
        _id: isUserExist._id,
      }).exec();
      if (!isUserDeleted) {
        return res
          .status(400)
          .json({ success: false, msg: `Something went wrong` });
      }
      res.status(200).json({ success: true, msg: `User deleted successfully` });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, msg: `something went wrong` });
    }
  }
);

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      Password Reset
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
user_router.post("/reset_password", authentication, async (req, res) => {
  const userPassword = req.body.password;
  if (!userPassword || userPassword.length < 8) {
    return res
      .status(400)
      .json({ success: false, msg: `Please, Enter strong password` });
  }
  const password = await bcrypt.hash(userPassword, 11);
  const isPasswordChanged = await User.updateOne(
    { email: req.user.email },
    { $set: { password } }
  );
  if (!isPasswordChanged) {
    return res.status(404).json({ success: false, msg: `User not found` });
  }
  const message = {
    from: process.env.EMAIL_SENDER,
    to: email,
    subject: `Ecommarse Shopping web app in user forgot password.`,
    text: `<h3><b>Welcome to Ecommarse Shopping site.</b></h3>`,
    html: `<p>Hii, ${req.user.name} </p></br> <h5>Your password <b>${userPassword}</b> changed successfully</h5></br><p>Please do not share this password to anyone.</br>no reply</p>`,
  };
  if (!sendMail(message)) {
    return res.status(404).json({ success: false, msg: `User not found` });
  }
});

module.exports = user_router;
