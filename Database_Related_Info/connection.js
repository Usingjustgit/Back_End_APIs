const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const connection = mongoose
  .connect(process.env.MONGODB_CONNECTION_URI)
  .then(() => console.log("Database Connected"))
  .catch((error) => console.log("Something went wrong", error));

module.exports = connection;
