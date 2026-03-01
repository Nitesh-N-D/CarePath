require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");
const diseaseRoutes = require("./routes/diseaseRoutes");

const app = express();

// -------------------------------------
// CORS Configuration
// -------------------------------------
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://care-path-two.vercel.app"
    ],
    credentials: true,
  })
);

// -------------------------------------
// Middlewares
// -------------------------------------
app.use(express.json());

// -------------------------------------
// Routes
// -------------------------------------
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/diseases", diseaseRoutes);

// -------------------------------------
// Health Check Route
// -------------------------------------
app.get("/", (req, res) => {
  res.status(200).send("CarePath API running...");
});

// -------------------------------------
// Global Error Handler (Production Safe)
// -------------------------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
  });
});

// -------------------------------------
// Start Server
// -------------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});