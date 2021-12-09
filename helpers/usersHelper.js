const jwt = require("jsonwebtoken");
require("dotenv").config();
const key = process.env.PRIVATE_KEY;

const calculateToken = (userEmail, id) => {
  return jwt.sign({ email: userEmail, user_id: id }, key);
};

function decodeToken(token) {
  return jwt.decode(token);
}

// header, payload, signaature
module.exports = { calculateToken, decodeToken };
