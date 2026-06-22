const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { v4: uuidv4 } = require("uuid");
const BENGALI_FONT_PATH = path.join(__dirname, "../../fonts/NotoSansBengali-Regular.ttf");
const hasBengaliFont = fs.existsSync(BENGALI_FONT_PATH);
function ensureDirectory(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}
function containsBengali(text) {
  return /[\u0980-\u09FF]/.test(String(text));
}
function writeKeyValueLine(doc, key, value) {
  const keyText = `- ${key}: `;
  const valueText = String(value);
  if (containsBengali(valueText) && hasBengaliFont) {
    doc.font("Helvetica").text(keyText, { continued: true });
    doc.font("Bengali").text(valueText);
  } else {
    doc.font("Helvetica").text(`${keyText}${valueText}`);
  }
}
function writeSection(doc, title, entries) {
  doc.moveDown(0.5);
  doc.font("Helvetica-Bold").fontSize(13).text(title);
  doc.moveDown(0.25);
  doc.fontSize(10);
  if (!entries.length) {
    doc.font("Helvetica").text("No data provided.");
    return;
  }
  entries.forEach(({ key, value }) => {
    writeKeyValueLine(doc, key, value);
  });
}
function formatObjectEntries(value) {
  if (!value || typeof value !== "object") {
    return [];
  }
  return Object.entries(value).map(([key, entryValue]) => {
    if (Array.isArray(entryValue)) {
      const formatted = entryValue.map((item) => {
        if (item && typeof item === "object") {
          return Object.entries(item).map(([innerKey, innerValue]) => `${innerKey}=${innerValue}`).join(", ");
        }
        return String(item);
      }).join("; ");
      return { key, value: formatted };
    }
    if (entryValue && typeof entryValue === "object") {
      const formatted = Object.entries(entryValue).map(([innerKey, innerValue]) => `${innerKey}=${innerValue}`).join(", ");
      return { key, value: formatted };
    }
    return { key, value: String(entryValue) };
  });
}
async function generatePdfReport(sessionData) {
  const reportsDir = path.join(__dirname, "../../uploads/reports");
  ensureDirectory(reportsDir);
  const fileName = `${uuidv4()}.pdf`;
  const filePath = path.join(reportsDir, fileName);
  const doc = new PDFDocument({ margin: 40 });
  if (hasBengaliFont) {
    doc.registerFont("Bengali", BENGALI_FONT_PATH);
  }
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);
  doc.font("Helvetica-Bold").fontSize(18).text("Rural Healthcare Triage Report", { align: "center" });
  doc.moveDown(0.5);
  doc.font("Helvetica").fontSize(10).text(`Generated at: ${new Date().toISOString()}`, { align: "center" });
  doc.moveDown();
  writeSection(doc, "Patient Intake Summary", [
    ...formatObjectEntries(sessionData.patientInfo),
    ...formatObjectEntries(sessionData.intake)
  ]);
  writeSection(doc, "Medical History (from OCR)", [
    ...formatObjectEntries(sessionData.ocrData)
  ]);
  const vitalsEntries = [
    ...formatObjectEntries(sessionData.vitals),
    ...(sessionData.vitals?.overallAnomalyLevel ? [{ key: "overallAnomalyLevel", value: sessionData.vitals.overallAnomalyLevel }] : [])
  ];
  writeSection(doc, "Vitals & Anomalies", vitalsEntries);
  const triageResult = sessionData.triageResult || {};
  const triageEntries = [
    triageResult.triageScore ? { key: "score", value: triageResult.triageScore } : null,
    triageResult.reasoning ? { key: "reasoning", value: triageResult.reasoning } : null,
    Array.isArray(triageResult.differentialDiagnoses) && triageResult.differentialDiagnoses.length > 0
      ? { key: "diagnoses", value: triageResult.differentialDiagnoses.join("; ") }
      : null,
    Array.isArray(triageResult.firstAidSteps) && triageResult.firstAidSteps.length > 0
      ? { key: "first-aid steps", value: triageResult.firstAidSteps.join("; ") }
      : null,
    triageResult.referralNeeded !== undefined ? { key: "referral needed", value: triageResult.referralNeeded } : null,
    triageResult.referralUrgency ? { key: "referral urgency", value: triageResult.referralUrgency } : null
  ].filter(Boolean);
  writeSection(doc, "AI Triage Assessment", triageEntries);
  doc.moveDown(1.5);
  doc.font("Helvetica-Oblique").fontSize(9).text(
    "AI-generated preliminary assessment - final diagnosis must be confirmed by a licensed physician",
    { align: "center" }
  );
  doc.end();
  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
  return {
    reportUrl: `/uploads/reports/${fileName}`
  };
}
module.exports = { generatePdfReport };
