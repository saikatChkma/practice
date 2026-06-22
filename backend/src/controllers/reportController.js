const { asyncHandler } = require("../utils/asyncHandler");
const { generatePdfReport } = require("../services/reportService");

const generateReport = asyncHandler(async (req, res) => {
  const sessionData = req.body || {};

  if (!sessionData || typeof sessionData !== "object" || Array.isArray(sessionData)) {
    return res.status(400).json({ message: "session data must be an object" });
  }

  const result = await generatePdfReport(sessionData);

  return res.json(result);
});

module.exports = { generateReport };