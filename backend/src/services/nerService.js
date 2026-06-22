const Groq = require("groq-sdk");

const SYSTEM_PROMPT = "You are a medical document parser. Extract structured data from OCR text of a prescription or lab report. Return ONLY valid JSON in this exact format, no markdown, no explanation: \n{ \"medications\": [{\"name\": \"\", \"dosage\": \"\"}], \n  \"diagnoses\": [\"\"], \n  \"testResults\": [{\"testName\": \"\", \"value\": \"\", \"unit\": \"\"}] }\nIf a field is not found, return an empty array.";

function stripCodeFences(text) {
  return text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function parseMedicalJson(rawText) {
  const parsed = JSON.parse(stripCodeFences(rawText));

  return {
    medications: Array.isArray(parsed.medications) ? parsed.medications : [],
    diagnoses: Array.isArray(parsed.diagnoses) ? parsed.diagnoses : [],
    testResults: Array.isArray(parsed.testResults) ? parsed.testResults : []
  };
}

async function generateJsonFromModel(rawText, retryNotice = "") {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `${retryNotice}OCR text:\n${rawText}` }
    ]
  });

  return response.choices?.[0]?.message?.content || "";
}

async function extractMedicalEntities(rawText) {
  if (!rawText) {
    return { medications: [], diagnoses: [], testResults: [] };
  }

  if (!process.env.GROQ_API_KEY) {
    return { medications: [], diagnoses: [], testResults: [] };
  }

  let modelOutput = await generateJsonFromModel(rawText);

  try {
    return parseMedicalJson(modelOutput);
  } catch (firstError) {
    modelOutput = await generateJsonFromModel(rawText, "Previous output was invalid JSON. Return only valid JSON.\n");

    try {
      return parseMedicalJson(modelOutput);
    } catch (secondError) {
      throw new Error("Malformed JSON returned by medical NER model");
    }
  }
}

module.exports = { extractMedicalEntities };