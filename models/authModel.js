const connection = require("../db-config");
const db = connection.promise();

function authCredent(email) {
  return db
    .query("select id, email, hashedPassword from users where email = ?", [
      email,
    ])
    .then(([result]) => {
      return result;
    })
    .catch((err) => console.log(err));
}

module.exports = { authCredent };
