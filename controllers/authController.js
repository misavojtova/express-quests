const { authModel, userModel } = require("../models");
const { calculateToken } = require("../helpers/usersHelper");

function correctCredentCon(req, res) {
  const { email, password } = req.body;
  authModel.authCredent(email).then((user) => {
    userModel
      .verifyPassword(password, user[0].hashedPassword)
      .then((correctPassword) => {
        if (correctPassword) {
          const token = calculateToken(email);
          userModel.updateUser(user[0].id, { token: token });
          res.cookie("user_token", token);
          res.status(200).send(correctPassword);
        } else res.status(401);
      })
      .catch((err) => console.log(err));
  });
}

module.exports = { correctCredentCon };
