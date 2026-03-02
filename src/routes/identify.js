const express = require("express");
const router = express.Router();
const { identify } = require("../controllers/identifyController");

router.post("/", identify);
router.get("/", (req, res) => {
  res.send("Identify GET working ✅");
});

router.post("/", (req, res) => {
  res.json({ message: "Identify POST working ✅" });
});

module.exports = router;