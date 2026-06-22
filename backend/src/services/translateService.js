const Groq = require("groq-sdk");

async function translateToEnglish(text) {
  if (!text) return text;

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content: "You are a medical translator. Translate the given text to English. If it is already in English, return it unchanged. Return ONLY the translated text, nothing else, no explanation."
      },
      {
        role: "user",
        content: text
      }
    ]
  });

  return completion.choices?.[0]?.message?.content?.trim() || text;
}

module.exports = { translateToEnglish };