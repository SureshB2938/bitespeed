require("dotenv").config();
const express = require("express");
const cors = require("cors");

const identifyRoute = require("./routes/identify");

const pool = require("./config/db");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/identify", identifyRoute);

// Basic health check route (optional but good practice)
app.get("/", (req, res) => {
  res.send("Bitespeed Identity Reconciliation API Running 🚀");
});

// Start Server
const PORT = process.env.PORT || 3000;


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

});

pool.getConnection()
  .then(() => console.log("MySQL Connected ✅"))
  .catch(err => console.error("DB Connection Failed ❌", err));