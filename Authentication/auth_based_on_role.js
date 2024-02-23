const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.redirect("/auth/login");
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ success: false, msg: "Unauthorized" });
      return res.redirect("/home");
    }
    next();
  };
};

module.exports = restrictTo;
