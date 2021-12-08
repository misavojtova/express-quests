const crypto = require("crypto");
require("dotenv").config();
const key = process.env.PRIVATE_KEY;

const calculateToken = (userEmail = "") => {
  return crypto
    .createHash("md5")
    .update(userEmail + key)
    .digest("hex");
};

module.exports = { calculateToken };
