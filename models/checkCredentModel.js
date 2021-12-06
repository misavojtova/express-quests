const connection = require("../db-config");
const db = connection.promise();

function checkCredent(email) {
  console.log("checkEmail", email);
  return db
    .query("select email, hashedPassword from users where email = ?", [email])
    .then(([result]) => {
      console.log("result", result);
      return result;
    })
    .catch((err) => console.log(err));
}

module.exports = { checkCredent };
