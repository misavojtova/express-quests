const connection = require("../db-config");
const db = connection.promise();

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
      console.log("model", result[0]);
      result[0];
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
}

const validEmailDifferId = (email, id) => {
  return db
    .query("SELECT * FROM users WHERE email = ? AND id <> ?", [email, id])
    .then(([results]) => results[0]);
};

const insertUser = (data) => {
  return db
    .query("INSERT INTO users set ?", data)
    .then(([result]) => {
      const id = result.insertId;
      return { ...data, id };
    })
    .catch((err) => {
      console.log(err);
      return err;
    });
};

const updateUser = (id, newAttributes) => {
  return db.query("UPDATE users SET ? WHERE id = ?", [newAttributes, id]);
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

module.exports = {
  getAllUsers,
  getOneUser,
  deleteOneUser,
  validEmail,
  validEmailDifferId,
  insertUser,
  updateUser,
};
