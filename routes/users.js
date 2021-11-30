const usersRouter = require("express").Router();
const User = require("../models/user");

usersRouter.get("/", (req, res) => {
  const language = req.params.language;
  User.findAllUsers(language)
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error retrieving movies from database");
    });
});

module.exports = usersRouter;
