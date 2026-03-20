require("dotenv").config();

const app = require("./src/app");
const { pool } = require("./src/config/db");

const PORT = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await pool.query("SELECT 1");
    app.listen(PORT, () => {
      console.log(`CarePath API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start CarePath API", error);
    process.exit(1);
  }
}

startServer();
