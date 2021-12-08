const { moviesModel } = require("../models");

function getAllMoviesCon(req, res) {
  const { max_duration, color } = req.query;
  moviesModel
    .findMany({ filters: { max_duration, color } })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error retrieving movies from database");
    });
}

function getOneMovieCon(req, res) {
  moviesModel
    .findOne(req.params.id)
    .then((movie) => {
      if (movie) {
        res.json(movie);
      } else {
        res.status(404).send("Movie not found");
      }
    })
    .catch((err) => {
      res.status(500).send("Error retrieving movie from database");
    });
}

function insertMovieCon(req, res) {
  const error = moviesModel.validate(req.body);
  if (error) {
    res.status(422).json({ validationErrors: error.details });
  } else {
    moviesModel
      .create(req.body)
      .then((createdMovie) => {
        res.status(201).json(createdMovie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error saving the movie");
      });
  }
}

function updateMovieCon(req, res) {
  let existingMovie = null;
  let validationErrors = null;
  moviesModel
    .findOne(req.params.id)
    .then((movie) => {
      existingMovie = movie;
      if (!existingMovie) return Promise.reject("RECORD_NOT_FOUND");
      validationErrors = moviesModel.validate(req.body, false);
      if (validationErrors) return Promise.reject("INVALID_DATA");
      return moviesModel.update(req.params.id, req.body);
    })
    .then(() => {
      res.status(200).json({ ...existingMovie, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err === "RECORD_NOT_FOUND")
        res.status(404).send(`Movie with id ${req.params.id} not found.`);
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors: validationErrors.details });
      else res.status(500).send("Error updating a movie.");
    });
}

function deleteMovieCon(req, res) {
  moviesModel
    .destroy(req.params.id)
    .then((deleted) => {
      if (deleted) res.status(200).send("🎉 Movie deleted!");
      else res.status(404).send("Movie not found");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error deleting a movie");
    });
}

module.exports = {
  getAllMoviesCon,
  getOneMovieCon,
  deleteMovieCon,
  updateMovieCon,
  insertMovieCon,
};
