const moviesRouter = require("./movies");

const setupRoutes = (app) => {
  app.use("/api/movies", moviesRouter);
  // TODO later : app.use('/api/users', usersRouter);
};

module.exports = {
  setupRoutes,
};
