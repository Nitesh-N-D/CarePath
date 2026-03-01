const express = require("express");
const cors = require("cors");
require("dotenv").config();

const diseaseRoutes = require("./routes/diseaseRoutes");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://care-path-two.vercel.app/"
  ]
}));
app.use(express.json());

app.use("/api/diseases", diseaseRoutes);

app.get("/", (req, res) => {
  res.send("Mediguide API running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});