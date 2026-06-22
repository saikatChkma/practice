const fs = require("fs");
const Groq = require("groq-sdk");

async function transcribeAudio(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error("Audio file not found");
  }

  if (!process.env.GROQ_API_KEY) {
    return {
      text: "Groq API key is not configured yet.",
      language: "en"
    };
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await groq.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-large-v3",
    response_format: "json"
  });

  const detectedLanguage = response.language || "en";

  return {
    text: response.text || "",
    language: detectedLanguage === "bengali" || detectedLanguage === "bn" ? "bn" : "en"
  };
}

module.exports = { transcribeAudio };