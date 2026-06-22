const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

const transcribeRoutes = require("./src/routes/transcribe");
const translateRoutes = require("./src/routes/translate");
const ocrRoutes = require("./src/routes/ocr");
const analyzeRoutes = require("./src/routes/analyze");
const vitalsRoutes = require("./src/routes/vitals");
const ttsRoutes = require("./src/routes/tts");
const reportRoutes = require("./src/routes/report");
const { notFound, errorHandler } = require("./src/utils/error");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(uploadsDir));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/transcribe", transcribeRoutes);
app.use("/api/translate", translateRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/analyze", analyzeRoutes);
app.use("/api/vitals-check", vitalsRoutes);
app.use("/api/tts", ttsRoutes);
app.use("/api/report", reportRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Rural Healthcare Triage Assistant backend running on port ${port}`);
});