const connection = require("./db-config");

// Setup the environement variables form a .env file
require("dotenv").config();

// Import expres
const express = require("express");

// We store all express methods in a variable called app
const app = express();

// If an environment variable named PORT exists, we take it in order to let the user change the port without chaning the source code. Otherwise we give a default value of 3000
const port = process.env.PORT || 3000;
app.use(express.json());

connection.connect((err) => {
  if (err) {
    console.error(`error connecting: ${err.stack}`);
  } else {
    console.log(` connected to database with threadID: ${connection.threadId}`);
  }
});

// quest 6 mu solution
app.get("/api/movies", (req, res) => {
  let sql = "SELECT * FROM movies";
  const sqlValues = [];

  if (req.query.max_duration && req.query.color) {
    sql += " where color = ? and duration <= ?";
    sqlValues.push(req.query.color, req.query.max_duration);
  } else if (req.query.max_duration) {
    sql += " where duration <= ?";
    sqlValues.push(req.query.max_duration);
  } else if (req.query.color) {
    sql += " WHERE color = ?";
    sqlValues.push(req.query.color);
  }

  connection.query(sql, sqlValues, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error retrieving movies from database");
    } else {
      res.json(results);
    }
  });
});

//Better way
app.get("/api/movies", (req, res) => {
  let sql = "SELECT * FROM movies";
  const sqlValues = [];

  if (req.query.color) {
    sql += " WHERE color = ?";
    sqlValues.push(req.query.color);
  }
  if (req.query.max_duration) {
    if (req.query.color) sql += " AND duration <= ? ;";
    else sql += " WHERE duration <= ?";

    sqlValues.push(req.query.max_duration);
  }

  connection.query(sql, sqlValues, (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Error retrieving movies from database");
    } else {
      res.json(results);
    }
  });
});

// quest 7
app.put("/api/movies/:id", (req, res) => {
  const userId = req.params.id;
  let existingUser = null;
  connection.promise().query('select * from movies where id = ?', [userId]).then(([result]) => {
    existingUser = result[0];
    if (!existingUser) return Promise.reject('RECORD_NOT_FOUND')
    return connection.promise().query('update movies set ? where id = ?', [req.body, userId])
  }).then(() => {
    res.status(200).json({...existingUser, ...req.body})
  }).catch((err) => {
    console.log(err);
    if (err === 'RECORD_NOT_FOUND')
      res.status(404).send(`User with id ${userId} not found`);
    else res.status(500).send('Error updating a user')
  })
});


// app.get("/api/movies", (req, res) => {
//   connection.query("SELECT * FROM movies", (err, result) => {
//     if (err) {
//       res.status(500).send(`Error retrieving data from database`);
//     } else {
//       res.status(200).json(result);
//     }
//   });
// });

// ALL USERS GET()
app.get("/api/users", (req, res) => {
  connection.query("SELECT * FROM users", (err, result) => {
    if (err) {
      res.status(500).send(`Error retrieving data from database`);
    } else {
      res.status(200).json(result);
    }
  });
});

// REQUEST PARAMS GET()
app.get("/api/users/:id", (req, res) => {
  const { id } = req.params;
  connection.query("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
    if (err) {
      res.status(500).send("Error retrieving a user from database");
    } else {
      if (result.length) res.json(result[0]);
      else res.status(404).send("user not found");
    }
  });
});

// quest 6
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

// REQUESTE QUERY GET()
app.get("/api/users", (req, res) => {
  let sql = "SELECT * FROM users";
  const sqlValues = [];
  if (req.query.language) {
    sql += " WHERE language = ?";
    sqlValues.push(req.query.language);
  }
  connection.query(sql, sqlValues, (err, result) => {
    if (err) {
      res.status(500).send("Error retrieving users from database");
    } else {
      res.json(result);
    }
  });
});

app.post("/api/movies", (req, res) => {
  const { title, director, year, color, duration } = req.body;
  connection.query(
    "INSERT INTO movies(title, director, year, color, duration) VALUES (?, ?, ?, ?, ?)",
    [title, director, year, color, duration],
    (err, result) => {
      console.log(result)
      if (err) {
        res.status(500).send("Error saving the movie");
      } else {
        const id = result.insertId;
        const createdUser = {id, title, director, year, color, duration}
        res.status(201).send(createdUser);
      }
    }
  );
});

app.post("/api/users", (req, res) => {
  const { firstname, lastname, email } = req.body;
  connection.query(
    "INSERT INTO users(firstname, lastname, email) VALUES (?, ?, ?)",
    [firstname, lastname, email],
    (err, result) => {
      if (err) {
        res.status(500).send("Error saving the user");
      } else {
        res.status(201).send("User successfully saved");
      }
    }
  );
});



// app.put("/api/users/:id", (req, res) => {
//   const userId = req.params.id;
//   const userPropsToUpdate = req.body;
//   connection.query(
//     "UPDATE users SET ? WHERE id = ?",
//     [userPropsToUpdate, userId],
//     (err) => {
//       if (err) {
//         console.log(err);
//         res.status(500).send("Error updating a user");
//       } else {
//         res.status(200).send("User updated successfully 🎉");
//       }
//     }
//   );
// });

app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  connection.query(
    'SELECT * FROM users WHERE id = ?',
    [userId],
    (err, selectResults) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error updating a user');
      } else {
        const userFromDb = selectResults[0];
        if (userFromDb) {
          const userPropsToUpdate = req.body;
          connection.query(
            'UPDATE users SET ? WHERE id = ?',
            [userPropsToUpdate, userId],
            (err) => {
              if (err) {
                console.log(err);
                res.status(500).send('Error updating a user');
              } else {
                const updated = { ...userFromDb, ...userPropsToUpdate };
                res.status(200).json(updated);
              }
            }
          );
        } else {
          res.status(404).send(`User with id ${userId} not found.`);
        }
      }
    }
  );
});

app.delete("/api/movies/:id", (req, res) => {
  const userId = req.params.id;
  connection.query("DELETE from movies WHERE id = ?", [userId], (err) => {
    if (err) {
      console.log(err);
      res.status(500).send("😱 Error deleting an user");
    } else {
      res.status(200).send("🎉 User deleted!");
    }
  });
});

// {
//     "title": "bla",
//     "director": "bleee",
//     "year": "2015",
//     "color": "1",
//     "duration": "150"
// }

app.delete("/api/users/:id", (req, res) => {
  const userId = req.params.id;
  connection.query("DELETE from users WHERE id = ?", [userId], (err) => {
    if (err) {
      console.log(err);
      res.status(500).send("😱 Error deleting an user");
    } else {
      res.status(200).send("🎉 User deleted!");
    }
  });
});

// We listen to incoming request on the port defined above
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
