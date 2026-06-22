const fs = require("fs/promises");
const { extractTextFromImage } = require("../services/visionService");
const { extractMedicalEntities } = require("../services/nerService");

async function extractText(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "document image file is required" });
  }

  const filePath = req.file.path;

  try {
    const rawText = await extractTextFromImage(filePath);
    const structured = await extractMedicalEntities(rawText);

    return res.json({
      rawText,
      medications: structured.medications || [],
      diagnoses: structured.diagnoses || [],
      testResults: structured.testResults || []
    });
  } catch (error) {
    const message = error.message || "Failed to process document";
    const statusCode = message.toLowerCase().includes("only image") ? 400 : 500;
    return res.status(statusCode).json({ message });
  } finally {
    await fs.unlink(filePath).catch(() => {});
  }
}

module.exports = { extractText };