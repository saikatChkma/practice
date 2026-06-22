const { asyncHandler } = require("../utils/asyncHandler");
const { synthesizeSpeech: synthesizeSpeechService } = require("../services/ttsService");

const synthesizeSpeech = asyncHandler(async (req, res) => {
  const { text, language } = req.body || {};

  if (typeof text !== "string" || !text.trim()) {
    return res.status(400).json({ message: "text is required" });
  }

  if (language !== "bn" && language !== "en") {
    return res.status(400).json({ message: "language must be either bn or en" });
  }

  const result = await synthesizeSpeechService(text.trim(), language);

  return res.json(result);
});

module.exports = { synthesizeSpeech };