const express = require("express");
const { checkCredentController } = require("../controllers");

const checkCredentRoutes = express.Router();

checkCredentRoutes.post(
  "/checkCredentials",
  checkCredentController.correctCredentCon
);

module.exports = checkCredentRoutes;
