const OpenAI = require("openai");
const { assessVitals } = require("../utils/vitals");
const { buildTriagePrompt } = require("../utils/prompts");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function analyzePatient(payload) {
  const structuredVitals = assessVitals(payload.vitals || {});
  const prompt = buildTriagePrompt({
    symptoms: payload.symptoms || "",
    history: payload.history || "",
    vitals: payload.vitals || {},
    vitalsAssessment: structuredVitals
  });

  if (!process.env.OPENAI_API_KEY) {
    return {
      triage: structuredVitals.overallSeverity,
      reasoning: "OpenAI API key is not configured, so this is a rules-based fallback.",
      differentialDiagnoses: [],
      firstAid: [],
      referral: structuredVitals.overallSeverity === "Red" ? "Immediate referral" : "Monitor and reassess",
      promptPreview: prompt,
      source: "fallback"
    };
  }

  const completion = await openai.responses.create({
    model: "gpt-4o-mini",
    input: prompt
  });

  return {
    triage: structuredVitals.overallSeverity,
    reasoning: completion.output_text || "No text output returned by the model.",
    differentialDiagnoses: [],
    firstAid: [],
    referral: structuredVitals.overallSeverity === "Red" ? "Immediate referral" : "Monitor and reassess",
    source: "openai",
    raw: completion
  };
}

module.exports = { analyzePatient };