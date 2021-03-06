const connection = require("../db-config");
const db = connection.promise();
const argon2 = require("argon2");

connection.connect((err) => {
  if (err) {
    console.error("error connecting: " + err.stack);
  } else {
    console.log("connected as id " + connection.threadId);
  }
});

function getAllUsers({ filters: { language } }) {
  let sql = "SELECT * FROM users";
  const sqlValues = [];

  if (language) {
    sql += " WHERE language = ?";
    sqlValues.push(language);
  }

  return db
    .query(sql, sqlValues)
    .then(([result]) => result)
    .catch((err) => {
      console.log(err);
      return err;
    });
}

function getOneUser(userId) {
  return db
    .query("SELECT * FROM users WHERE id = ?", [userId])
    .then(([result]) => result)
    .catch((err) => {
      console.log(err);
      return err;
    });
}

function validEmail(email) {
  return db
    .query("SELECT * FROM users WHERE email = ?", [email])
    .then(([result]) => {
      return result[0];
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
}

function getMoviesAccToUser(user_id) {
  return db
    .query("select * from movies where user_id = ?", [user_id])
    .then(([result]) => result)
    .catch((err) => console.log(err));
}

const validEmailDifferId = (email, id) => {
  return db
    .query("SELECT * FROM users WHERE email = ? AND id <> ?", [email, id])
    .then(([results]) => results[0]);
};

const insertUser = ({
  firstname,
  lastname,
  email,
  city,
  language,
  hashedPassword,
}) => {
  return db
    .query(
      "INSERT INTO users (firstname, lastname, email, city, language, hashedPassword) VALUES (?, ?, ?, ?, ?, ?)",
      [firstname, lastname, email, city, language, hashedPassword]
    )
    .then(([result]) => {
      const id = result.insertId;
      return {
        id,
        firstname,
        lastname,
        email,
        city,
        language,
        hashedPassword,
      };
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
};

const updateUser = (id, propertiesToUpdate) => {
  return db
    .query("UPDATE users SET ? WHERE id = ?", [propertiesToUpdate, id])
    .catch((err) => console.log(err));
};

function deleteOneUser({ filters: { deleteId } }) {
  return db
    .query("DELETE FROM users WHERE id = ?", [deleteId])
    .then(([result]) => result)
    .catch((err) => {
      console.log(err);
      return err;
    });
}
const hashingOptions = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 5,
  parallelism: 1,
};

const hashPassword = (plainPassword) => {
  return argon2.hash(plainPassword, hashingOptions);
};

const verifyPassword = (plainPassword, hashedPassword) => {
  return argon2.verify(hashedPassword, plainPassword, hashingOptions);
};

module.exports = {
  getMoviesAccToUser,
  hashPassword,
  verifyPassword,
  getAllUsers,
  getOneUser,
  deleteOneUser,
  validEmail,
  validEmailDifferId,
  insertUser,
  updateUser,
};
