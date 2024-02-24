const express = require("express");
const show_page = express();

show_page.get("/registration", (req, res) => {
  res.render("registration");
});

show_page.get("/login", (req, res) => {
  res.render("login");
});

show_page.get("/login_success", (req, res) => {
  res.render("login_success");
});

show_page.get("/forgot_password", (req, res) => {
  res.render("forgot_pass");
});

show_page.get("/logout", (req, res) => {
  res.render("logout");
});

show_page.get("/products", (req, res) => {
  res.render("products");
});

show_page.get("/add/cart/:productId", (req, res) => {
  res.render("addCart", { product_id: req.params.productId });
});

show_page.get("/add/order/:cartId", (req, res) => {
  res.render("addOrder", { cart_id: req.params.cartId });
});

show_page.get("/reset/password", (req, res) => {
  res.render("reset_password");
});

// ================================================================================
show_page.get("/get/all/products", (req, res) => {
  res.render("allProducts");
});
module.exports = show_page;
