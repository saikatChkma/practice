const express = require("express");
const { analyzeCase } = require("../controllers/analyzeController");

const router = express.Router();

router.post("/", analyzeCase);

module.exports = router;