const moviesRouter = require("express").Router();
// Import the movie model that we'll need in controller functions
const Movie = require("../models/movie");

// GET /api/movies/
moviesRouter.get("/", (req, res) => {
  const { max_duration, color } = req.query;
  Movie.findMany({ filters: { max_duration, color } })
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Error retrieving movies from database");
    });
});

// TODO : GET /api/movies/:id
// moviesRouter.get('/:id', (req, res) => { ... })

// Don't forget to export the router in order to link it to the app in routes/index.js
module.exports = moviesRouter;
