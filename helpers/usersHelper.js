const jwt = require("jsonwebtoken");
require("dotenv").config();
const key = process.env.PRIVATE_KEY;

const calculateToken = (userEmail = "", id = "") => {
  return jwt.sign({ email: userEmail, id: id }, key);
};
// header, payload, signaature
module.exports = { calculateToken };
