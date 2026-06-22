function buildTriagePrompt({ symptoms, history, vitals, vitalsAssessment }) {
  return [
    "You are assisting a rural healthcare triage system for trained community health workers.",
    "Return concise, clinically cautious guidance.",
    `Symptoms: ${symptoms || "N/A"}`,
    `Medical history: ${history || "N/A"}`,
    `Vitals: ${JSON.stringify(vitals || {})}`,
    `Vitals assessment: ${JSON.stringify(vitalsAssessment || {})}`,
    "Output: triage severity, reasoning, likely differential diagnoses, first-aid steps, referral urgency."
  ].join("\n");
}

module.exports = { buildTriagePrompt };