const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const body_parser = require("body-parser");
require("./Data_Base_Related_Information/Mongodb_Connection");
dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 9995;

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan("tiny"));
app.use(express.urlencoded(true));
app.use(body_parser.json());

app.use("/users", require("./Controller_For_Call_APIs/User_Controller"));
app.use("/guests", require("./Controller_For_Call_APIs/Guest_Controller"));
app.use("/budgets", require("./Controller_For_Call_APIs/Budget_Controller"));
app.use("/vendors", require("./Controller_For_Call_APIs/Vendor_Controller"));
app.use("/registry", require("./Controller_For_Call_APIs/Registry_Controller"));
app.use("/tasks", require("./Controller_For_Call_APIs/Task_Controller"));
app.use("/venues", require("./Controller_For_Call_APIs/Venue_Controller"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
