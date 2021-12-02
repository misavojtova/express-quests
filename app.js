const connection = require("./db-config");
const express = require("express");
const app = express();
const Joi = require("joi");
const { json } = require("express");

const port = process.env.PORT || 3000;

connection.connect((err) => {
  if (err) {
    console.error("error connecting: " + err.stack);
  } else {
    console.log("connected as id " + connection.threadId);
  }
});

app.use(express.json());

app.get("/api/movies", (req, res) => {
  let sql = "select * from movies ";
  let sqlVal = [];

  if (req.query.color && req.query.max_duration) {
    sql += " where color = ? and duration <= ? ";
    sqlVal.push(req.query.color, req.query.max_duration);
  } else if (req.query.color) {
    sql = sql + " where color = ? ";
    sqlVal.push(req.query.color);
  } else if (req.query.max_duration) {
    sql += " where duration = ?";
    sqlVal.push(req.query.max_duration);
  }

  connection.query(sql, sqlVal, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("error retrieving user!");
    } else {
      if (result.length) res.json(result);
      else res.status(404).send("movie not found");
    }
  });
});

app.get("/api/movies/:id", (req, res) => {
  const { id } = req.params;
  connection.query("SELECT * FROM movies WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.status(500).send("Error retrieving a user from database");
    } else {
      if (result.length) res.json(result[0]);
      else res.status(404).send("movie not found");
    }
  });
});

// Insert whole new block of information
app.post("/api/users", (req, res) => {
  const { firstname, lastname, email, language, city } = req.body;
  let validationErrors = null;
  const db = connection.promise();

  //Check if email s duplicated
  db.query("select * from users where email = ? ", [email])
    .then(([result]) => {
      if (result[0]) return Promise.reject("DUPLICATE_EMAIL");

      // Check if all the data has the right format
      validationErrors = Joi.object({
        email: Joi.string().email().max(255).required(),
        firstname: Joi.string().max(255).required(),
        lastname: Joi.string().max(255).required(),
        city: Joi.string().allow(null, "").max(255),
        language: Joi.string().allow(null, "").max(255),
      }).validate(
        { firstname, lastname, email, city, language },
        { abortEarly: false }
      ).error;

      //reject if data format is incorrect
      if (validationErrors) return Promise.reject("INVALID_DATA");

      // All good insert data into database
      return db.query(
        "INSERT into users (firstname, lastname, email, city, language) values (?, ?, ?, ?, ?)",
        [firstname, lastname, email, city, language]
      );
    })
    .then(([{ insertId }]) => {
      res
        .status(201)
        .json({ id: insertId, firstname, lastname, email, city, language });
    })
    .catch((err) => {
      console.log(err);
      if (err === "DUPLICATE_EMAIL")
        res.status(409).json({ message: "This email is already used" });
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors });
      else res.status(500).send("Error saving the user");
    });
});

// Update specific user in the database and return the whole object updated..
app.put("/api/users/:id", (req, res) => {
  const id = req.params.id;
  const inputed = req.body;

  let existingUser = null;
  let validationErrors = null;
  const db = connection.promise();

  // 1. select the whole user by id
  db.query("select * from users where id = ?", [id])
    .then(([result]) => {
      existingUser = result[0];
      if (!existingUser) return Promise.reject("RECORD_NOT_FOUND");

      // Check if all the data has the right format
      validationErrors = Joi.object({
        email: Joi.string().email().max(255),
        firstname: Joi.string().max(255),
        lastname: Joi.string().max(255),
        city: Joi.string().allow(null, "").max(255),
        language: Joi.string().allow(null, "").max(255),
      }).validate(inputed, { abortEarly: false }).error;

      if (validationErrors) return Promise.reject("INVALID_DATA");

      //2. update this user
      return db.query("update users set ? where id = ?", [inputed, id]);
    })

    //3. Return the whole new object
    .then(() => {
      res.status(200).json({ ...existingUser, ...inputed });
    })
    .catch((err) => {
      console.log(err);
      if (err === "RECORD_NOT_FOUND")
        res.status(404).send(`User with id ${id} not found`);
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors });
      else res.status(500).send("Error updating a user");
    });
});

app.post("/api/movies", (req, res) => {
  const { title, director, year, color, duration } = req.body;

  const { error } = Joi.object({
    title: Joi.string().max(255).required(),
    director: Joi.string().max(255).required(),
    year: Joi.number().integer().min(1888).required(),
    color: Joi.boolean().required(),
    duration: Joi.number().integer().min(1).required(),
  }).validate(
    { title, director, year, color, duration },
    { abortEarly: false }
  );

  if (error) {
    res.status(422).json({ validationErrors: error.details });
  } else {
    connection.query(
      "INSERT INTO movies (title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)",
      [title, director, year, color, duration],
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send("Error saving the movie");
        } else {
          const id = result.insertId;
          const insertedMovie = {
            id,
            title,
            director,
            year,
            color,
            duration,
          };
          res.status(201).json(insertedMovie);
        }
      }
    );
  }
});

/* Old version : "manual validation" and callbacks 
app.post('/api/users', (req, res) => {
  const { firstname, lastname, email } = req.body;
  connection.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    (err, result) => {
      if (result[0]) {
        console.error(err);
        res.status(409).json({ message: 'This email is already used' });
      } else {
        const errors = [];
        const emailRegex = /[a-z0-9._]+@[a-z0-9-]+\.[a-z]{2,3}/;

        if (!firstname)
          errors.push({
            field: 'firstname',
            message: 'This field is required',
          });
        else if (firstname.length >= 255)
          errors.push({
            field: 'firstname',
            message: 'Should be less than 255 characters',
          });

        if (!lastname)
          errors.push({ field: 'lastname', message: 'This field is required' });
        else if (lastname.length >= 255)
          errors.push({
            field: 'lastname',
            message: 'Should be less than 255 characters',
          });

        if (!email)
          errors.push({ field: 'email', message: 'This field is required' });
        else if (email.length >= 255)
          errors.push({
            field: 'email',
            message: 'Should be less than 255 characters',
          });

        if (!emailRegex.test(email))
          errors.push({ field: 'email', message: 'Invalid email' });

        if (error) {
          res.status(422).json({ validationErrors: error.details });
        } else {
          connection.query(
            'INSERT INTO users (firstname, lastname, email) VALUES (?, ?, ?)',
            [firstname, lastname, email],
            (err, result) => {
              if (err) {
                console.error(err);
                res.status(500).send('Error saving the user');
              } else {
                const id = result.insertId;
                const createdUser = { id, firstname, lastname, email };
                res.status(201).json(createdUser);
              }
            }
          );
        }
      }
    }
  );
});
*/

app.post("/api/users", (req, res) => {
  const { firstname, lastname, email } = req.body;
  const db = connection.promise();
  let validationErrors = null;
  db.query("SELECT * FROM users WHERE email = ?", [email])
    .then(([result]) => {
      if (result[0]) return Promise.reject("DUPLICATE_EMAIL");
      validationErrors = Joi.object({
        email: Joi.string().email().max(255).required(),
        firstname: Joi.string().max(255).required(),
        lastname: Joi.string().max(255).required(),
      }).validate({ firstname, lastname, email }, { abortEarly: false }).error;
      if (validationErrors) return Promise.reject("INVALID_DATA");
      return db.query(
        "INSERT INTO users (firstname, lastname, email) VALUES (?, ?, ?)",
        [firstname, lastname, email]
      );
    })
    .then(([{ insertId }]) => {
      res.status(201).json({ id: insertId, firstname, lastname, email });
    })
    .catch((err) => {
      console.error(err);
      if (err === "DUPLICATE_EMAIL")
        res.status(409).json({ message: "This email is already used" });
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors });
      else res.status(500).send("Error saving the user");
    });
});

app.put("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  const db = connection.promise();
  let existingUser = null;
  db.query("SELECT * FROM users WHERE id = ?", [userId])
    .then(([results]) => {
      existingUser = results[0];
      if (!existingUser) return Promise.reject("RECORD_NOT_FOUND");
      return db.query("UPDATE users SET ? WHERE id = ?", [req.body, userId]);
    })
    .then(() => {
      res.status(200).json({ ...existingUser, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err === "RECORD_NOT_FOUND")
        res.status(404).send(`User with id ${userId} not found.`);
      else res.status(500).send("Error updating a user");
    });
});

app.put("/api/movies/:id", (req, res) => {
  const movieId = req.params.id;
  const db = connection.promise();
  let existingMovie = null;
  let validationErrors = null;

  db.query("SELECT * FROM movies WHERE id = ?", [movieId])
    .then(([results]) => {
      existingMovie = results[0];
      if (!existingMovie) return Promise.reject("RECORD_NOT_FOUND");

      validationErrors = Joi.object({
        title: Joi.string().max(255),
        director: Joi.string().max(255),
        year: Joi.number().integer().min(1888),
        color: Joi.boolean(),
        duration: Joi.number().integer().min(1),
      }).validate(req.body, { abortEarly: false }).error;

      if (validationErrors) return Promise.reject("INVALID_DATA");
      return db.query("UPDATE movies SET ? WHERE id = ?", [req.body, movieId]);
    })
    .then(() => {
      res.status(200).json({ ...existingMovie, ...req.body });
    })
    .catch((err) => {
      console.error(err);
      if (err === "RECORD_NOT_FOUND")
        res.status(404).send(`Movie with id ${movieId} not found.`);
      else if (err === "INVALID_DATA")
        res.status(422).json({ validationErrors });
      else res.status(500).send("Error updating a movie.");
    });
});

app.delete("/api/users/:id", (req, res) => {
  connection.query(
    "DELETE FROM users WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error deleting an user");
      } else {
        if (result.affectedRows) res.status(200).send("🎉 User deleted!");
        else res.status(404).send("User not found.");
      }
    }
  );
});

app.delete("/api/movies/:id", (req, res) => {
  const movieId = req.params.id;
  connection.query(
    "DELETE FROM movies WHERE id = ?",
    [movieId],
    (err, result) => {
      if (err) {
        console.log(err);
        res.status(500).send("Error deleting a movie");
      } else {
        if (result.affectedRows) res.status(200).send("🎉 Movie deleted!");
        else res.status(404).send("Movie not found");
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
