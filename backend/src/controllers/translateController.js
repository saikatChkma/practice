const { asyncHandler } = require("../utils/asyncHandler");
const { translateTextContent } = require("../services/translationService");

const translateText = asyncHandler(async (req, res) => {
  const { text, targetLanguage = "en" } = req.body;

  if (!text) {
    return res.status(400).json({ message: "text is required" });
  }

  const result = await translateTextContent(text, targetLanguage);

  res.json({
    success: true,
    data: result
  });
});

module.exports = { translateText };