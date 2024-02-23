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

module.exports = show_page;
