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
  // restrictTo("admin", "super_admin", "product_owner"),
  async (req, res) => {
    if (req.user.role === "admin" || req.user.role === "super_admin") {
      const allUser = await User.find({
        $or: [{ role: "product_owner" }, { role: "user" }],
      })
        .select("-_id -password -v")
        .sort({ createdAt: -1 })
        .exec();
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
//      Show My cart Item
// ================================================================================
user_router.get("/cart/item", authentication, async (req, res) => {
  try {
    console.log(req.user.email);
    res.status(200).json({ success: true, data: req.user.cart });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: `Internal server error.` });
  }
});

//================================================================================
//      Show My orders User
// ================================================================================
user_router.get("/order/item", authentication, async (req, res) => {
  try {
    const myCart = await User.findOne({ _id: req.user._id });
    res.status(200).json({ success: true, data: myCart.order });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: `Internal server error.` });
  }
});
//================================================================================
//      Update User
// ================================================================================
user_router.put("/", authentication, async (req, res) => {
  const {
    name,
    birth_date,
    country,
    state,
    district,
    city,
    address,
    zip,
    phone,
  } = req.body;
  try {
    const isUpdateUser = await User.updateOne(
      { _id: req.user._id },
      {
        name,
        birth_date,
        country,
        state,
        district,
        city,
        address,
        zip,
        phone,
      }
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
});

//================================================================================
//      Delete User
//================================================================================
user_router.delete(
  "/",
  authentication,
  restrictTo("admin", "super_admin", "product_owner", "user"),
  async (req, res) => {
    try {
      const profile_picture_file_path = path.resolve(
        __dirname,
        `../uploads/users_profile_pictures/${isUserExist.profile_picture}`
      );
      fs.unlinkSync(profile_picture_file_path);
      await User.deleteOne({
        _id: req.user._id,
      })
        .then((user) => {
          if (!user) {
            return res
              .status(400)
              .json({ success: false, msg: `Something went wrong` });
          }
          const isCartDeleted = user.cart.map(async (cart) => {
            await cart.deleteOne({ _id: cart._id });
          });
          if (!isCartDeleted) {
            return res
              .status(400)
              .json({ success: false, msg: `Something went wrong` });
          }
          const isOrderDeleted = user.order.map(async (cart) => {
            await cart.deleteOne({ _id: cart._id });
          });
          if (!isOrderDeleted) {
            return res
              .status(400)
              .json({ success: false, msg: `Something went wrong` });
          }
        })
        .catch((error) => {
          return res
            .status(500)
            .json({ success: false, msg: `Something went wrong ${error}` });
        });
      res.status(200).json({ success: true, msg: `User deleted successfully` });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, msg: `something went wrong` });
    }
  }
);

// =================================================================================
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let isValidImage = imageMimeTypes.includes(file.mimetype);
    if (isValidImage) {
      cb(null, "uploads/users_profile_pictures/");
    }
    if (!isValidImage) {
      const error = res.status(400).json({
        success: false,
        msg: `Invalid image type ${file.mimetype}`,
      });
    }
    cb(null, "uploads/users_profile_pictures/");
  },
  filename: (res, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      Update Profile picture Reset
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
user_router.put(
  "/update_profile_picture",
  authentication,
  upload.single("profile_picture"),
  async (req, res) => {
    if (req.file.filename) {
      const oldFilePath = path.resolve(
        __dirname,
        `../uploads/users_profile_pictures/${req.user.profile_picture}`
      );
      fs.unlinkSync(oldFilePath);
      profile_picture = `${req.protocol}://${req.get(
        "host"
      )}/uploads/users_profile_pictures/${req.file.filename}`;
    }
    try {
      let profile_picture = req.user.profile_picture;
      if (req.file.filename) {
        profile_picture = `${req.protocol}://${req.get(
          "host"
        )}/uploads/users_profile_pictures/${req.file.filename}`;
      }
      const isProfilePictureUpdated = await User.updateOne(
        { _id: req.user._id },
        { $set: { profile_picture } }
      );
      if (!isProfilePictureUpdated) {
        return res.status(404).json({ success: false, msg: `User not found` });
      }
      res.status(200).json({ success: true, msg: `Profile picture updated` });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, msg: `Something went wrong ${error}` });
    }
  }
);

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
//      Password Reset
//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
user_router.post("/reset_password", authentication, async (req, res) => {
  const { userPassword, confirmPassword } = req.body;
  if (!userPassword || userPassword.length < 8) {
    return res
      .status(400)
      .json({ success: false, msg: `Please, Enter strong password` });
  }
  if (userPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ success: false, msg: `Password not matched` });
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
