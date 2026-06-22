const { TextToSpeechClient } = require("@google-cloud/text-to-speech");

const client = new TextToSpeechClient();

function getVoiceConfig(language) {
  if (language === "bn") {
    return {
      languageCode: "bn-IN",
      name: "bn-IN-Standard-A"
    };
  }

  return {
    languageCode: "en-US",
    name: "en-US-Standard-C"
  };
}

async function synthesizeSpeech(text, language = "en") {
  if (!text) {
    throw new Error("Text is required");
  }

  const voice = getVoiceConfig(language);

  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice,
    audioConfig: {
      audioEncoding: "MP3"
    }
  });

  return {
    audioBase64: Buffer.from(response.audioContent).toString("base64"),
    mimeType: "audio/mpeg"
  };
}

module.exports = { synthesizeSpeech };