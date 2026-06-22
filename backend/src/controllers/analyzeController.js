const { asyncHandler } = require("../utils/asyncHandler");
const { analyzeTriage } = require("../services/triageService");

const analyzeCase = asyncHandler(async (req, res) => {
  const { symptoms, medicalHistory, vitalsAnomalyFlags } = req.body || {};

  if (typeof symptoms !== "string" || !symptoms.trim()) {
    return res.status(400).json({ message: "symptoms is required and must be a non-empty string" });
  }

  if (medicalHistory === undefined || medicalHistory === null || typeof medicalHistory !== "object" || Array.isArray(medicalHistory)) {
    return res.status(400).json({ message: "medicalHistory is required and must be an object" });
  }

  if (vitalsAnomalyFlags === undefined || vitalsAnomalyFlags === null || typeof vitalsAnomalyFlags !== "object" || Array.isArray(vitalsAnomalyFlags)) {
    return res.status(400).json({ message: "vitalsAnomalyFlags is required and must be an object" });
  }

  const result = await analyzeTriage(symptoms.trim(), medicalHistory, vitalsAnomalyFlags);
  return res.json(result);
});

module.exports = { analyzeCase };