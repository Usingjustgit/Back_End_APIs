const restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.currentUser);
    if (!req.currentUser) {
      return res.redirect("/auth/login");
    }
    if (!roles.includes(req.currentUser.role)) {
      res.status(403).json({ success: false, msg: "Unauthorized" });
      return res.redirect("/home");
    }
    next();
  };
};

module.exports = restrictTo;
