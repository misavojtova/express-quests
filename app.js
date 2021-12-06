const express = require("express");
const { userRoutes } = require("./routes");
const { moviesRoutes } = require("./routes");

const app = express();

// const Joi = require("joi");
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/users", userRoutes);
app.use("/api/movies", moviesRoutes);

// userRoutes(app);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
