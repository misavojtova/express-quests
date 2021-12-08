const express = require("express");
const { authController } = require("../controllers");

const authRoutes = express.Router();

authRoutes.post("/", authController.correctCredentCon);

module.exports = authRoutes;
