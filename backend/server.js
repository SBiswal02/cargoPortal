require("dotenv").config();
const app = require("./app");
const sequelize = require("./config/db");
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "127.0.0.1";

async function start() {
  await sequelize.authenticate();
  await sequelize.sync();
  app.listen(PORT, HOST, () => {
    console.log(`Intergalactic Cargo API listening on http://${HOST}:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

module.exports = { start };
