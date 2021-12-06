const express = require("express");
const { userController } = require("../controllers");

const userRoutes = express.Router();

userRoutes.get("/", userController.getAllUsersCon);
userRoutes.get("/:id", userController.getOneUserCon);
userRoutes.post("/", userController.insertUserCon);
userRoutes.put("/:id", userController.updateUserCon);
userRoutes.delete("/:id", userController.deleteOneUserCon);

module.exports = userRoutes;
