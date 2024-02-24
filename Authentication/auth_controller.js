const express = require("express");
const User = require("../Database_Related_Info/Schemas/user");
const auth_route = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const sendMail = require("./send_email");
const ecommarse = require("../Database_Related_Info/Schemas/ecommarse");
const authentication = require("./user_authentication");

//=================================================================================
//         This Function is for User Creating
//            and user is exist or not.
//================================================================================
auth_route.post("/registration", async (req, res) => {
  console.log(req.body);
  const {
    name,
    email,
    birth_date,
    gender,
    country,
    state,
    district,
    city,
    address,
    zip,
    phone,
  } = req.body;
  let password = req.body.password;
  const userPassword = password;

  if (!name || !email || !password || !country || !phone) {
    return res
      .status(400)
      .json({ success: false, msg: "All fields are required" });
  }

  try {
    const isUserExist = await User.findOne({ email }).exec();

    if (isUserExist) {
      res.render("emailAddress", { email });
      // return res.status(400).json({
      //   success: false,
      //   msg: `User with email ${email} already exist`,
      // });
    }
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
    //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    password = await bcrypt.hash(password, 11);

    const message = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: `Ecommarse Shopping web app in user registration.`,
      text: `<h3><b>Welcome to Ecommarse Shopping Web Application.</b></h3>`,
      html: `<p>Hii, ${name} </p></br><h5>Your Email is <b color="blue">${email}</b></h5></br> <h5>Your password is <b color="blue">${userPassword}</b></h5></br><p>Please do not share this password to anyone.</p></br><p>Here You can Shopping lot's of things with us.</p><h3>no reply</h3>`,
    };

    if (!sendMail(message)) {
      return res
        .status(404)
        .json({ success: false, msg: `This ${email} is not exist` });
    }

    const isUserSave = await User({
      name,
      email,
      password,
      birth_date,
      gender,
      country,
      state,
      district,
      city,
      address,
      zip,
      phone,
    }).save();

    if (!isUserSave) {
      return res
        .status(500)
        .json({ success: false, msg: "Something went wrong" });
    }
    res.redirect("/index/login");
    // res.status(200).json({ success: true, msg: "User created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: `Internal server error ${error}` });
  }
});

//=================================================================================
//         This Function is for User Login
//=================================================================================
auth_route.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, msg: `All fields are required` });
  }

  try {
    const isUserExist = await User.findOne({ email }).exec();
    if (!isUserExist) {
      return res.status(400).json({ success: false, msg: `User not found` });
    }
    if (isUserExist && (await bcrypt.compare(password, isUserExist.password))) {
      const token = await jwt.sign(
        {
          _id: isUserExist._id,
          email: isUserExist.email,
          isAdmin: isUserExist.isAdmin,
        },
        process.env.SECRET_KEY,
        { expiresIn: "1d" }
      );
      // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      //      This code for real Implementation of stored cookies in token
      // ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
      res.cookie("Ecommarse_User", token, {
        httpOnly: true,
        // expires: new Date(Date.now() + 60 * 60 * 24),
      });

      res.redirect("/index/login_success");
      // return res
      //   .status(200)
      //   .json({ success: true, msg: `Login successfully`, token: token });
    } else {
      return res
        .status(400)
        .json({ success: false, msg: `Invalid credentials` });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: `Internal server error ${error}` });
  }
});

//=================================================================================
//         This Function is Use for forgot Password
//=================================================================================
auth_route.post("/forgot_password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(404).json({ success: false, msg: `Please enter email.` });
  }
  try {
    const isUserExist = await User.findOne({ email }).exec();
    if (!isUserExist) {
      res.status(400).json({
        success: false,
        msg: `${email} is not exist please register fist`,
      });
      return res.redirect("/auth/registration");
    }
    const userPassword = Math.round(
      Math.random() * 1000000 +
        Math.random() * 1000000 +
        Math.random() * 1000000
    ).toString();
    const message = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: `Ecommarse Shopping web app in user forgot password.`,
      text: "Welcome to Ecommarse Shopping site.",
      html: `
        <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        background-color: #ffffff;
        border: 1px solid #e1e1e1;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.7);
      }
      h1, h2 {
        color: black;
        text-shadow: 0 0 11px rgba(0, 0, 0, 0.5);
      }
      p {
        color: grey;
        text-shadow: 0 0 7px rgba(0, 0, 0, 0.5);
      }
      .product {
        margin-bottom: 20px;
        border: 1px solid #e1e1e1;
        border-radius: 5px;
        overflow: hidden;
      }
      .product img {
        width: 100%;
        height: auto;
      }
      .product-content {
        padding: 15px;
      }
      .button {
        display: inline-block;
        padding: 10px 20px;
        background-color: #007bff;
        color: #ffffff;
        text-decoration: none;
        border-radius: 5px;
      }
    </style>
  </head>
  <body>
    <div class="container">
    <h1>Hi, ${isUserExist.name}</h1>
    <h2>Your New Password is: ${userPassword}</h2>
    <h1>Welcome to Our E-commerce Site!</h1>
    <p>Thank you for again visit our site.</p>
    <div class="product">
      <img src="product1.jpg" alt="Product 1">
      <div class="product-content">
        <h2>Product 1</h2>
        <p>Description of Product 1. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
    </div>
    <div class="product">
      <img src="product2.jpg" alt="Product 2">
      <div class="product-content">
        <h2>Product 2</h2>
        <p>Description of Product 2. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </div>
    </div>
    <p>To start shopping, click the button below:</p>
    <a href="https://www.example.com/shop" class="button">Start Shopping</a>
    <p>Best regards,</p>
    <p>Your E-commerce Team</p>
    </div>
  </body>
    `,
    };

    const password = await bcrypt.hash(userPassword, 10);
    const isUserUpdate = await User.updateOne(
      { email },
      { $set: { password } }
    );
    if (!isUserUpdate) {
      return res
        .status(500)
        .json({ success: false, msg: `Your password is not changed` });
    }

    if (!sendMail(message)) {
      return res
        .status(404)
        .json({ success: false, msg: `This ${email} is not exist` });
    }
    // res.status(200).json({
    //   success: true,
    //   msg: `Please check your mail ${email}.and login with this password.`,
    // });
    res.redirect("/index/login");
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: `Internal server error ${error}` });
  }
});

//=================================================================================
//=================================================================================

//=================================================================================
//=================================================================================
auth_route.get("/send_mail", (req, res) => {
  sendMail(message);
  res.send("hello world");
});

//=================================================================================
//       User Logout
//================================================================================
auth_route.get("/logout", authentication, async (req, res) => {
  try {
    res.clearCookie("Ecommarse_User");
    res.redirect("/index/login");
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, msg: `Internal server error ${error}` });
  }
});

module.exports = auth_route;
