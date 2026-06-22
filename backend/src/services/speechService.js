const fs = require("fs");
const { SpeechClient } = require("@google-cloud/speech");

const client = new SpeechClient();

async function transcribeAudioFile(filePath, languageCode = "bn-BD") {
  if (!fs.existsSync(filePath)) {
    throw new Error("Audio file not found");
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return {
      transcript: "Google credentials are not configured yet.",
      languageCode,
      provider: "mock"
    };
  }

  const audioBytes = fs.readFileSync(filePath).toString("base64");
  const [response] = await client.recognize({
    audio: { content: audioBytes },
    config: {
      encoding: "LINEAR16",
      languageCode,
      enableAutomaticPunctuation: true
    }
  });

  const transcript = response.results.map((result) => result.alternatives[0].transcript).join(" ");

  return {
    transcript,
    languageCode,
    provider: "google-speech"
  };
}

module.exports = { transcribeAudioFile };