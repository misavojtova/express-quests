const express = require("express");
const cookieParser = require("cookie-parser");

const { userRoutes } = require("./routes");
const { moviesRoutes } = require("./routes");
const { authRoutes } = require("./routes");

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use("/api/users", userRoutes);
app.use("/api/movies", moviesRoutes);
app.use("/api/login", authRoutes);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
