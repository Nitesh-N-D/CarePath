require("dotenv").config();

const app = require("./src/app");
const { pool } = require("./src/config/db");
const { initializeDatabase } = require("./src/services/databaseInitService");
const { startReminderScheduler } = require("./src/services/reminderScheduler");

const PORT = Number(process.env.PORT || 5000);

async function startServer() {
  try {
    await pool.query("SELECT 1");
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`CarePath API listening on port ${PORT}`);
    });
    startReminderScheduler();
  } catch (error) {
    console.error("Failed to start CarePath API", error);
    process.exit(1);
  }
}

startServer();
