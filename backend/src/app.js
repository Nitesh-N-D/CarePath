const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const healthRoutes = require("./routes/healthRoutes");
const adminRoutes = require("./routes/adminRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const diseaseRoutes = require("./routes/diseaseRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/api/healthcheck", (_req, res) => {
  res.status(200).json({ status: "ok", service: "carepath-api" });
});

app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/diseases", diseaseRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
