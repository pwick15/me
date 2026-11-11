const { GoogleGenAI } = require("@google/genai");
const fs = require("fs");
const path = require("path");
const config = require("../config");
const { getSiteText } = require("./siteContext");

// The instructions are published on the site as-is (GET /api/prompt), so visitors
// can see exactly what the chatbot is told.
const PROMPT = fs.readFileSync(path.join(__dirname, "../prompt.md"), "utf8").trim();
const CV = fs.readFileSync(path.join(__dirname, "../data/cv.txt"), "utf8").trim();

// Initialize the official Google Gen AI SDK configured for Vertex AI
const ai = new GoogleGenAI({
  vertexai: true,
  project: config.gcpProject,
  location: config.gcpLocation,
});

const FALLBACK =
  "Sorry, I couldn't put an answer together for that. Try rephrasing it, or email Punji at punjayawick@gmail.com.";

/**
 * @param {string} message  the visitor's question, already validated
 * @param {{role: "user"|"model", text: string}[]} history  earlier turns, already trimmed
 */
async function generateChatResponse(message, history) {
  const site = await getSiteText();
  const systemInstruction =
    `${PROMPT}\n\n# CV\n\n${CV}` + (site ? `\n\n# Website text (punjaya.com)\n\n${site}` : "");

  const contents = history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] }));
  contents.push({ role: "user", parts: [{ text: message }] });

  const response = await ai.models.generateContent({
    model: config.model,
    contents,
    config: {
      systemInstruction,
      temperature: 0.3,
      maxOutputTokens: config.limits.outputTokens,
      thinkingConfig: { thinkingBudget: 0 }, // thinking tokens bill as output; short answers don't need them
    },
  });

  // Token counts only (never the visitor's text), so spend shows up in Cloud Run logs
  const usage = response.usageMetadata || {};
  console.log(JSON.stringify({
    event: "chat",
    inTokens: usage.promptTokenCount,
    outTokens: usage.candidatesTokenCount,
    thinkTokens: usage.thoughtsTokenCount || 0,
  }));

  return response.text || FALLBACK;
}

module.exports = { generateChatResponse, PROMPT };
