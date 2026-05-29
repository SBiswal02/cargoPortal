const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Cargo = sequelize.define(
  "Cargo",
  {
    cargo_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    manifest_date: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    weight_kg: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    destination: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "cargo",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = Cargo;
