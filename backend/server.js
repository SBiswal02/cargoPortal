require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/db");
const PORT = process.env.PORT || 3001;

async function start() {
  await sequelize.authenticate();
  await sequelize.sync();
  app.listen(PORT, () => {
    console.log(`Intergalactic Cargo API listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

module.exports = { start };
