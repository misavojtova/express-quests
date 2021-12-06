const express = require("express");
const { moviesController } = require("../controllers");

const moviesRoutes = express.Router();

moviesRoutes.get("/", moviesController.allMoviesController);

moviesRoutes.get("/:id", moviesController.movieByIdController);

moviesRoutes.post("/", moviesController.newMovieController);

moviesRoutes.put("/:id", moviesController.updateMovieController);

moviesRoutes.delete("/:id", moviesController.deleteMovieByIdController);

module.exports = moviesRoutes;
