const express = require("express");
const { evaluateVitals } = require("../controllers/vitalsController");

const router = express.Router();

router.post("/", evaluateVitals);

module.exports = router;