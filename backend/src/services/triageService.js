const Groq = require("groq-sdk");

const SYSTEM_PROMPT = "You are a clinical decision-support assistant helping a Community Health Worker (CHW) who is NOT a trained doctor, in a rural Bangladeshi clinic with no specialist on-site. Given the patient's symptoms, medical history, and any vitals anomalies, you must:\n1. Assign a triage severity score: Green (routine), Yellow (urgent, monitor closely), Red (emergency, needs immediate specialist attention), Black (life-threatening, needs immediate transfer/critical intervention).\n2. Give a short, clear reasoning for the score (2-3 sentences, plain language a CHW understands).\n3. List up to 3 likely differential diagnoses, ordered by likelihood.\n4. List immediate first-aid steps the CHW can safely perform on-site, only within a CHW's scope of practice.\n5. State whether referral to a specialist is needed, and if so, how urgent.\nAlways err on the side of caution for ambiguous or severe symptoms.\nReturn ONLY valid JSON, no markdown, no explanation:\n{ \"triageScore\": \"Green|Yellow|Red|Black\", \"reasoning\": \"\", \"differentialDiagnoses\": [\"\",\"\",\"\"], \"firstAidSteps\": [\"\",\"\"], \"referralNeeded\": true/false, \"referralUrgency\": \"none|routine|urgent|immediate\" }";

function stripCodeFences(text) {
  return text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

function summarizeMedicalHistory(medicalHistory) {
  const medications = Array.isArray(medicalHistory.medications) ? medicalHistory.medications : [];
  const diagnoses = Array.isArray(medicalHistory.diagnoses) ? medicalHistory.diagnoses : [];
  const notes = [];

  if (medications.length > 0) {
    notes.push(`Medications: ${medications.map((item) => {
      if (item && typeof item === "object") {
        const name = item.name || "unknown medication";
        const dosage = item.dosage ? ` (${item.dosage})` : "";
        return `${name}${dosage}`;
      }
      return String(item);
    }).join(", ")}`);
  }

  if (diagnoses.length > 0) {
    notes.push(`Diagnoses: ${diagnoses.map((item) => String(item)).join(", ")}`);
  }

  const otherKeys = Object.keys(medicalHistory).filter((key) => key !== "medications" && key !== "diagnoses");
  otherKeys.forEach((key) => {
    const value = medicalHistory[key];
    notes.push(`${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`);
  });

  return notes.length > 0 ? notes.join("\n") : "No structured medical history provided.";
}

function summarizeVitalsAnomalies(vitalsAnomalyFlags) {
  const entries = Object.entries(vitalsAnomalyFlags || {}).filter(([, value]) => value !== null && value !== undefined && value !== false);
  if (entries.length === 0) return "No vitals anomalies reported.";
  return entries.map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`).join("\n");
}

function buildUserMessage(symptoms, medicalHistory, vitalsAnomalyFlags, strictReminder = "") {
  return [
    strictReminder ? `${strictReminder}` : "",
    `Symptoms:\n${symptoms}`,
    `Medical history summary:\n${summarizeMedicalHistory(medicalHistory)}`,
    `Vitals anomaly flags:\n${summarizeVitalsAnomalies(vitalsAnomalyFlags)}`
  ].filter(Boolean).join("\n\n");
}

function parseTriageJson(rawText) {
  const parsed = JSON.parse(stripCodeFences(rawText));
  const referralNeeded = typeof parsed.referralNeeded === "boolean"
    ? parsed.referralNeeded
    : String(parsed.referralNeeded).toLowerCase() === "true";

  return {
    triageScore: parsed.triageScore,
    reasoning: parsed.reasoning,
    differentialDiagnoses: Array.isArray(parsed.differentialDiagnoses) ? parsed.differentialDiagnoses : [],
    firstAidSteps: Array.isArray(parsed.firstAidSteps) ? parsed.firstAidSteps : [],
    referralNeeded,
    referralUrgency: parsed.referralUrgency || "none"
  };
}

async function getModelOutput(userMessage) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage }
    ]
  });
  return completion.choices?.[0]?.message?.content || "";
}

async function analyzeTriage(symptoms, medicalHistory, vitalsAnomalyFlags) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const userMessage = buildUserMessage(symptoms, medicalHistory, vitalsAnomalyFlags);
  let modelOutput = await getModelOutput(userMessage);

  try {
    return parseTriageJson(modelOutput);
  } catch (firstError) {
    modelOutput = await getModelOutput(`${userMessage}\n\nReturn only JSON. No markdown. No explanation.`);
    try {
      return parseTriageJson(modelOutput);
    } catch (secondError) {
      throw new Error("Malformed JSON returned by triage model");
    }
  }
}

module.exports = { analyzeTriage };