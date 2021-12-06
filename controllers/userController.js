const { userModel } = require("../models");
const Joi = require("joi");

function getAllUsersCon(req, res) {
  const { language } = req.query;
  userModel
    .getAllUsers({ filters: { language } })
    .then((users) => {
      if (users.length > 0) res.status(200).json(users);
      else return Promise.reject("NO_USER");
    })
    .catch((err) => {
      console.log(err);
      if (err === "NO_USER") res.status(404).send("No User Found");
      else res.status(500).send("Error retrieving data");
    });
}

function getOneUserCon(req, res) {
  userModel
    .getOneUser(req.params.id)
    .then((user) => {
      if (user.length) res.json(user[0]);
      else res.status(404).send("User not found");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error retrieving User from database");
    });
}

function insertUserCon(req, res) {
  const { firstname, lastname, email, city, language, password } = req.body;

  console.log("password", password);
  let validationErrors = null;

  userModel
    .validEmail(email)
    .then((result) => {
      if (result) return Promise.reject("DUPLICATE_EMAIL");
      validationErrors = Joi.object({
        firstname: Joi.string().max(255).required(),
        lastname: Joi.string().max(255).required(),
        email: Joi.string().email().max(255).required(),
        city: Joi.string().allow(null, "").max(255),
        language: Joi.string().allow(null, "").max(255),
        password: Joi.string().min(8),
      }).validate(req.body, { abortEarly: false }).error;

      if (validationErrors) return Promise.reject("INVALID_DATA");

      userModel
        .hashPassword(password)
        .then((hashedPassword) => {
          console.log("hashed", hashedPassword);
          console.log(
            firstname,
            lastname,
            email,
            city,
            language,
            hashedPassword
          );
          return userModel.insertUser({
            firstname,
            lastname,
            email,
            city,
            language,
            hashedPassword,
          });
        })
        .then((createdUser) => {
          res.status(201).json(createdUser);
        });
    })
    .catch((err) => {
      console.error(err);
      if (err === "DUPLICATE_EMAIL")
        res.status(409).json({ message: "This email is already used" });
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors });
      else res.status(500).send("Error saving the user");
    });
}

function updateUserCon(req, res) {
  let existingUser = null;
  let validationErrors = null;

  Promise.all([
    userModel.getOneUser(req.params.id),
    userModel.validEmailDifferId(req.body.email, req.params.id),
  ])
    .then(([existingUser, otherUserWithEmail]) => {
      if (!existingUser) return Promise.reject("RECORD_NOT_FOUND");
      if (otherUserWithEmail) return Promise.reject("DUPLICATE_EMAIL");

      validationErrors = Joi.object({
        email: Joi.string().email().max(255),
        firstname: Joi.string().min(1).max(255),
        lastname: Joi.string().min(1).max(255),
        city: Joi.string().allow(null, "").max(255),
        language: Joi.string().allow(null, "").max(255),
      }).validate(req.body, { abortEarly: false }).error;

      if (validationErrors) return Promise.reject("INVALID_DATA");

      return userModel.updateUser(req.params.id, req.body);
    })
    .then(() => {
      res.status(200).json({ ...existingUser, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err === "RECORD_NOT_FOUND")
        res.status(404).send(`User with id ${userId} not found.`);
      if (err === "DUPLICATE_EMAIL")
        res.status(409).json({ message: "This email is already used" });
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors });
      else res.status(500).send("Error updating a user");
    });
}

function deleteOneUserCon(req, res) {
  const deleteId = req.params.id;
  userModel
    .deleteOneUser({ filters: { deleteId } })
    .then((user) => {
      if (user.affectedRows) res.status(200).send("User deleted!");
      else res.status(404).send("User not found");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error deleting user from database");
    });
}

module.exports = {
  getAllUsersCon,
  getOneUserCon,
  deleteOneUserCon,
  insertUserCon,
  updateUserCon,
};
