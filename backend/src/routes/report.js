const express = require("express");
const { generateReport } = require("../controllers/reportController");

const router = express.Router();

router.post("/", generateReport);

module.exports = router;