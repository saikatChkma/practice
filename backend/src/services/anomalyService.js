function classifyBloodPressureSys(value) {
  if (value >= 90 && value <= 120) return "Normal";
  if ((value >= 121 && value <= 139) || (value >= 80 && value <= 89)) return "Mild";
  return "Severe";
}

function classifyBloodPressureDia(value) {
  if (value >= 60 && value <= 80) return "Normal";
  if ((value >= 81 && value <= 89) || (value >= 50 && value <= 59)) return "Mild";
  return "Severe";
}

function classifyHeartRate(value) {
  if (value >= 60 && value <= 100) return "Normal";
  if ((value >= 101 && value <= 120) || (value >= 50 && value <= 59)) return "Mild";
  return "Severe";
}

function classifyTemperature(value) {
  if (value >= 36.1 && value <= 37.2) return "Normal";
  if ((value >= 37.3 && value <= 38.5) || (value >= 35.5 && value <= 36.0)) return "Mild";
  return "Severe";
}

function classifyOxygenSaturation(value) {
  if (value >= 95) return "Normal";
  if (value >= 90 && value <= 94) return "Mild";
  return "Severe";
}

function classifyBloodGlucose(value) {
  if (value >= 70 && value <= 140) return "Normal";
  if ((value >= 141 && value <= 199) || (value >= 60 && value <= 69)) return "Mild";
  return "Severe";
}

function checkVitalsAnomaly(vitals) {
  const assessedVitals = {
    bloodPressureSys: { value: vitals.bloodPressureSys, status: classifyBloodPressureSys(vitals.bloodPressureSys) },
    bloodPressureDia: { value: vitals.bloodPressureDia, status: classifyBloodPressureDia(vitals.bloodPressureDia) },
    heartRate: { value: vitals.heartRate, status: classifyHeartRate(vitals.heartRate) },
    temperature: { value: vitals.temperature, status: classifyTemperature(vitals.temperature) },
    oxygenSaturation: { value: vitals.oxygenSaturation, status: classifyOxygenSaturation(vitals.oxygenSaturation) },
    bloodGlucose: { value: vitals.bloodGlucose, status: classifyBloodGlucose(vitals.bloodGlucose) }
  };

  const statuses = Object.values(assessedVitals).map((item) => item.status);
  const overallAnomalyLevel = statuses.includes("Severe") ? "Severe" : statuses.includes("Mild") ? "Mild" : "None";

  return {
    vitals: assessedVitals,
    overallAnomalyLevel
  };
}

module.exports = { checkVitalsAnomaly };