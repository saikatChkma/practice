const fs = require("fs");
const { ImageAnnotatorClient } = require("@google-cloud/vision");

const client = new ImageAnnotatorClient();

async function extractTextFromImage(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error("Image file not found");
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return "Google credentials are not configured yet.";
  }

  const [result] = await client.textDetection(filePath);
  const detections = result.textAnnotations || [];
  return detections[0]?.description || "";
}

module.exports = { extractTextFromImage };