const express = require("express");
const app = express();
require("./Database_Related_Info/connection");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(helmet());
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// Routes
app.use("/auth", require("./Authentication/auth_controller"));
app.use("/user", require("./Controllers/user_controller"));
app.use("/category", require("./Controllers/category_controller"));
app.use("/product", require("./Controllers/product_controller"));
app.use("/order", require("./Controllers/order_controller"));
app.use("/order_items", require("./Controllers/order_items_controller"));
app.use(
  "/user_query",
  require("./Controllers/Most_Use_Controller/user_query_controller")
);

dotenv.config({ path: "./.env" });
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});

// =====================================================================================================================
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// =====================================================================================================================
//                                Documentation For Using This API
// =====================================================================================================================
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// =====================================================================================================================

// 1) User Registration  ===>  http://localhost:3000/auth/registration  => (POST) =>   file: auth_controller.js => line 31
// 2) User Login  ===>  http://localhost:3000/auth/login  => (POST) =>   file: auth_controller.js => line 47
// 3) User Forgot Password  ===>  http://localhost:3000/auth/forgot_password  => (POST) =>   file: auth_controller.js => line 63
// 4) User Reset Password  ===>  http://localhost:3000/auth/reset_password  => (POST) =>   file: auth_controller.js => line 79

// User Get Control
// 1) User Get  ===>  http://localhost:3000/user  => (GET) =>   file: user_controller.js => line 13
// 2) User Get By Id  ===>  http://localhost:3000/user/:id  => (GET) =>   file: user_controller.js => line 40

// Category Get Control
// 1) Category Get  ===>  http://localhost:3000/category  => (GET) =>   file: category_controller.js => line 13
// 2) Category Get By Id  ===>  http://localhost:3000/category/:id  => (GET) =>   file: category_controller.js => line 40

// Order Post Control
// 1) Order Post  ===>  http://localhost:3000/order  => (POST) =>   file: order_controller.js => line 13

// Order Put Control only for use by admin, super_admin and product_owner
// 1) Order Put  ===>  http://localhost:3000/order  => (PUT) =>   file: order_controller.js => line 13

// User Query Get Control
// 1) User Query Get  ===>  http://localhost:3000/user_query  => (GET) =>   file: user_query_controller.js => line 13
