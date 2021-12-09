const { userModel } = require("../models");
const { calculateToken } = require("../helpers/usersHelper");

function correctCredentCon(req, res) {
  const { email, password } = req.body;
  userModel.validEmail(email).then((user) => {
    console.log(user);
    if (!user) res.status(401).send("Invalid Credentials");
    else {
      userModel
        .verifyPassword(password, user.hashedPassword)
        .then((correctPassword) => {
          if (correctPassword) {
            const token = calculateToken(email, id);
            res.cookie("user_token", token);
            res.send("correct Credentials");
          } else res.status(401).send("Invalid Credentialsss");
        })
        .catch((err) => console.log(err));
    }
  });
}

module.exports = { correctCredentCon };
