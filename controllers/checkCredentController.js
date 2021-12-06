const { checkCredentModel, userModel } = require("../models");

function correctCredentCon(req, res) {
  const { email, password } = req.body;
  checkCredentModel.checkCredent(email).then((results) => {
    console.log("email", email);

    userModel
      .verifyPassword(password, results[0].hashedPassword)
      .then((correctPassword) => {
        console.log(correctPassword);
        if (correctPassword) res.status(200).send("Password is correct");
        else res.status(401);
      });
  });
}

module.exports = { correctCredentCon };
