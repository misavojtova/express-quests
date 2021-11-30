const connection = require("../db-config");
const Joi = require("joi");
const db = connection.promise();

const findMany = ({ filters: { color, max_duration } }) => {
  let sql = "SELECT * FROM movies";
  const sqlValues = [];
  if (color) {
    sql += " WHERE color = ?";
    sqlValues.push(color);
  }
  if (max_duration) {
    if (color) sql += " AND duration <= ? ;";
    else sql += " WHERE duration <= ?";
    sqlValues.push(max_duration);
  }
  return db.query(sql, sqlValues).then(([results]) => results);
};

module.exports = {
  findMany,
};
