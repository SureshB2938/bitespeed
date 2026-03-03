const express = require("express");
const router = express.Router();

const { identify } = require("../controllers/identifyController");

router.post("/", identify);

// GET route for browser
router.get("/", (req, res) => {
  res.send("This endpoint only supports POST requests. Use Postman to test.");
});

module.exports = router;