const { moviesModel } = require("../models");

const allMoviesController = async (req, res) => {
  const { max_duration, color } = req.query;
  let movies = await moviesModel.findMovies({
    filters: { max_duration, color },
  });
  if (movies.length > 0) res.status(200).json(movies);
  else if (movies.length === 0)
    res.status(404).send("No movies found with those specifications");
  else res.status(500).send("No movies found");
};

const movieByIdController = async (req, res) => {
  const movieId = req.params.id;
  let movie = await moviesModel.findMovieById(movieId);
  if (movie.length > 0) res.status(200).json(movie[0]);
  else if (movie.length === 0)
    res.status(404).send("No movies found with that id");
  else res.status(500).send("Error retrieving movies");
};

const newMovieController = async (req, res) => {
  const { title, director, year, color, duration } = req.body;
  let numericYear = parseInt(year);
  let errors = [];

  if (!title)
    errors.push({ field: `title`, message: "This field is required" });
  else if (title.length >= 255)
    errors.push({
      field: `title`,
      message: "Should contain less than 255 alpha-numeric characters",
    });
  if (!director)
    errors.push({ field: `director`, message: "This field is required" });
  else if (director.length >= 255)
    errors.push({
      field: `director`,
      message: "Should contain less than 255 alpha-numeric characters",
    });
  if (!year) errors.push({ field: `year`, message: "This field is required" });
  else if (isNaN(year) || numericYear <= 1887)
    errors.push({
      field: `year`,
      message:
        "This field needs to be a string with numeric value bigger than 1887",
    });
  if (!duration)
    errors.push({ field: `duration`, message: "This field is required" });
  else if (duration <= 0)
    errors.push({
      field: `duration`,
      message: "This field needs to be bigger than 0",
    });
  if (!color || color > 1)
    errors.push({
      field: "color",
      message: `Required with value of true or false (1 or 0)`,
    });

  if (errors.length) res.status(422).json({ validationErrors: errors });
  else {
    let insertId = await moviesModel.insertNewMovie(
      title,
      director,
      year,
      color,
      duration
    );
    if (insertId)
      res
        .status(201)
        .json({ id: insertId, title, director, year, color, duration });
    else res.status(500).send("Error saving the movie");
  }
};

const updateMovieController = async (req, res) => {
  const { title, director, year, color, duration } = req.body;
  let numericYear = parseInt(year);
  const movieId = req.params.id;
  let errors = [];
  let existingMovie;

  let movie = await moviesModel.findMovieById(movieId);
  if (movie.length > 0) {
    existingMovie = movie[0];

    if (title && title.length >= 255)
      errors.push({
        field: `title`,
        message: "Should contain less than 255 alpha-numeric characters",
      });
    if (director && director.length >= 255)
      errors.push({
        field: `director`,
        message: "Should contain less than 255 alpha-numeric characters",
      });
    if (year && (isNaN(year) || numericYear <= 1887))
      errors.push({
        field: `year`,
        message: "This field needs to be a number bigger than 1887",
      });
    if (duration && duration <= 0)
      errors.push({
        field: `duration`,
        message: "This field needs to be a number bigger than 0",
      });
    if (color && color > 1)
      errors.push({
        field: "color",
        message: `Required with value of true or false (1 or 0)`,
      });

    if (errors.length) res.status(422).json({ validationErrors: errors });
    else {
      let movieToUpdate = await moviesModel.updateMovie(req.body, movieId);
      if (movieToUpdate === 1)
        res.status(200).json({ ...existingMovie, ...req.body });
      else res.status(500).send("Error updating movie");
    }
  } else if (movie.length === 0)
    res.status(404).send("No movies found with that id");
  else res.status(500).send("Error retrieving movies");
};

const deleteMovieByIdController = async (req, res) => {
  const movieId = req.params.id;

  let deletedMovie = await moviesModel.deleteMovieById(movieId);

  if (deletedMovie.affectedRows === 1)
    res.status(200).send("🎉 Movie deleted!");
  else if (deletedMovie.affectedRows === 0)
    res.status(404).send(`Movie with id ${movieId} not found.`);
  else res.status(500).send("😱 Error deleting movie");
};
module.exports = {
  allMoviesController,
  movieByIdController,
  newMovieController,
  updateMovieController,
  deleteMovieByIdController,
};
