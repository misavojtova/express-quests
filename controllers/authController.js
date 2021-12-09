const { userModel } = require("../models");
const { calculateToken } = require("../helpers/usersHelper");

function correctCredentCon(req, res) {
  const { email, password } = req.body;
  userModel.validEmail(email).then((user) => {
    if (!user) res.status(401).send("Invalid Credentials");
    else {
      userModel
        .verifyPassword(password, user.hashedPassword)
        .then((correctPassword) => {
          if (correctPassword) {
            const token = calculateToken(email, user.id);
            res.cookie("user_token", token);
            res.send("Welcome! You are logged in");
          } else res.status(401).send("Invalid Credentialsss");
        })
        .catch((err) => console.log(err));
    }
  });
}

module.exports = { correctCredentCon };
