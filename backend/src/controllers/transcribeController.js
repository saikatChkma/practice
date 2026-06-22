const fs = require("fs/promises");
const { transcribeAudio } = require("../services/whisperService");
const { translateToEnglish } = require("../services/translateService");

async function transcribeController(req, res) {
  if (!req.file) {
    return res.status(400).json({ message: "audio file is required" });
  }

  const filePath = req.file.path;

  try {
    const { text: originalText, language } = await transcribeAudio(filePath);

    const translatedText = await translateToEnglish(originalText);

    return res.json({
      originalText,
      language,
      translatedText
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to process audio" });
  } finally {
    await fs.unlink(filePath).catch(() => {});
  }
}

module.exports = { transcribeController };