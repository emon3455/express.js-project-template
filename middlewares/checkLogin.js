const jwt = require("jsonwebtoken");

const checkLogin = (req, res, next) => {
  const { authorization } = req.headers;
  try {
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, userId, name } = decoded;
    req.email = email;
    req.userId = userId;
    req.name = name
    next();
  } catch {
    res.status(401).json({
      error: "Forbidden Access..!!",
    });
    next("Authentication Failed..!");
  }
};

module.exports = checkLogin;
