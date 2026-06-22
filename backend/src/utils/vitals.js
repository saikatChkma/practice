function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function classify(value, ranges) {
  if (value === null) {
    return { status: "unknown", severity: 0 };
  }

  if (value < ranges.criticalLow || value > ranges.criticalHigh) {
    return { status: "critical", severity: 3 };
  }

  if (value < ranges.warningLow || value > ranges.warningHigh) {
    return { status: "warning", severity: 2 };
  }

  return { status: "normal", severity: 0 };
}

function assessVitals(vitals = {}) {
  const metrics = {
    bloodPressureSystolic: classify(toNumber(vitals.bloodPressureSystolic), { warningLow: 90, warningHigh: 140, criticalLow: 70, criticalHigh: 180 }),
    bloodPressureDiastolic: classify(toNumber(vitals.bloodPressureDiastolic), { warningLow: 60, warningHigh: 90, criticalLow: 40, criticalHigh: 120 }),
    heartRate: classify(toNumber(vitals.heartRate), { warningLow: 60, warningHigh: 100, criticalLow: 40, criticalHigh: 140 }),
    temperature: classify(toNumber(vitals.temperature), { warningLow: 36.0, warningHigh: 37.8, criticalLow: 35.0, criticalHigh: 39.5 }),
    oxygenSaturation: classify(toNumber(vitals.oxygenSaturation), { warningLow: 94, warningHigh: 100, criticalLow: 85, criticalHigh: 100 }),
    bloodGlucose: classify(toNumber(vitals.bloodGlucose), { warningLow: 70, warningHigh: 180, criticalLow: 50, criticalHigh: 300 })
  };

  const severityScore = Object.values(metrics).reduce((sum, item) => sum + item.severity, 0);
  const overallSeverity = severityScore >= 6 ? "Red" : severityScore >= 2 ? "Yellow" : "Green";

  return {
    overallSeverity,
    severityScore,
    metrics
  };
}

module.exports = { assessVitals };