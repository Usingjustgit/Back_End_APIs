const User = require("../Database_Related_Info/Schemas/user");
const jwt = require("jsonwebtoken");

//=================================================================================
//         This Function is for Authentication
//            and checking user is logged in or not
//================================================================================
const authentication = async (req, res, next) => {
  // const token = req.cookies["Ecommarse_User"];
  const currentToken =
    req.headers["authorization"] || req.cookies["Ecommarse_User"];
  if (!currentToken) {
    return res.status(400).json({ success: false, msg: `Token not exist` });
  }
  const token = currentToken.replace("Bearer ", "");

  if (!token) {
    return res.status(400).json({ success: false, msg: `Please Login` });
  }
  const currentUser = jwt.verify(token, process.env.SECRET_KEY);
  if (!currentUser) {
    return res.status(400).json({ success: false, msg: `User not found` });
  }
  const userAllInfo = await User.findOne({ _id: currentUser._id }).exec();

  req.token = token;
  req.user = userAllInfo;
  next();
};

module.exports = authentication;
