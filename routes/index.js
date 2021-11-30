const moviesRouter = require("./movies");
const usersRouter = require("./users");

const setupRoutes = (app) => {
  // Movie routes
  app.use("/api/movies", moviesRouter);
  // User routes
  app.use("api/users", usersRouter);
  // TODO
};

module.exports = {
  setupRoutes,
};
