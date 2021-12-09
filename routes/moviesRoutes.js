const express = require("express");
// import the movie controller functions
const { moviesController } = require("../controllers");

const moviesRoutes = express.Router();

// create moviesRoutes using express router
// moviesRoutes.get("/", moviesController.getMoviesAccToUserCon);
moviesRoutes.get("/", moviesController.getAllMoviesCon);
moviesRoutes.get("/:id", moviesController.getOneMovieCon);
moviesRoutes.post("/", moviesController.insertMovieCon);
moviesRoutes.put("/:id", moviesController.updateMovieCon);
moviesRoutes.delete("/:id", moviesController.deleteMovieCon);

module.exports = moviesRoutes;
