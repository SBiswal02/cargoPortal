const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: process.env.DB_STORAGE || "./cargo.db",
  logging: false,
});

module.exports = sequelize;
