const { asyncHandler } = require("../utils/asyncHandler");
const { checkVitalsAnomaly } = require("../services/anomalyService");

function isValidPositiveNumber(value, min, max) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value >= min && value <= max;
}

function validateVitals(vitals) {
  const rules = [
    ["bloodPressureSys", 30, 300],
    ["bloodPressureDia", 20, 200],
    ["heartRate", 20, 250],
    ["temperature", 30, 45],
    ["oxygenSaturation", 1, 100],
    ["bloodGlucose", 20, 600]
  ];

  for (const [field, min, max] of rules) {
    if (typeof vitals[field] !== "number" || Number.isNaN(vitals[field]) || !isValidPositiveNumber(vitals[field], min, max)) {
      return `${field} must be a positive number within a sane range (${min}-${max})`;
    }
  }

  return null;
}

const evaluateVitals = asyncHandler(async (req, res) => {
  const vitals = req.body || {};
  const validationError = validateVitals(vitals);

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const result = checkVitalsAnomaly(vitals);

  return res.json(result);
});

module.exports = { evaluateVitals };