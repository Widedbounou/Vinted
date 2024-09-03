
const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = req.headers.authorization.replace("Bearer ", "");
    const user = await User.findOne({ token: token });

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  
    req.user = user;
    return next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = isAuthenticated;
