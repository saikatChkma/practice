const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { transcribeController } = require("../controllers/transcribeController");

const router = express.Router();
const uploadsDir = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

router.post("/", upload.single("audio"), transcribeController);

module.exports = router;