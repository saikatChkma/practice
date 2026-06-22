const { Translate } = require("@google-cloud/translate").v2;
async function translateTextContent(text, targetLanguage = "en") {
  if (!text) {
    throw new Error("Text is required");
  }
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return {
      translatedText: text,
      detectedLanguage: targetLanguage,
      provider: "mock"
    };
  }
  const translate = new Translate();
  const [translation] = await translate.translate(text, targetLanguage);
  return {
    translatedText: Array.isArray(translation) ? translation[0] : translation,
    detectedLanguage: targetLanguage,
    provider: "google-translate"
  };
}
module.exports = { translateTextContent };
