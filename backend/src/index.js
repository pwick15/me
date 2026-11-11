const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const config = require("./config");
const { generateChatResponse, PROMPT } = require("./services/aiService");
const { getSiteText } = require("./services/siteContext");

const app = express();
const L = config.limits;
const EMAIL = "punjayawick@gmail.com";

// Cloud Run puts exactly one proxy in front, so req.ip is the real visitor
app.set("trust proxy", 1);
app.disable("x-powered-by");

// CORS only stops other websites' pages from calling us in a browser. Scripts
// ignore it, which is why /api/chat also checks the origin and rate limits below.
app.use(cors({
  origin: (origin, callback) => callback(null, !origin || config.allowedOrigins.includes(origin)),
  exposedHeaders: ["RateLimit-Limit", "RateLimit-Remaining", "RateLimit-Reset"],
}));

app.use(express.json({ limit: "32kb" }));

// ---------- rate limits ----------
const limiter = (options) => rateLimit({ standardHeaders: false, legacyHeaders: false, ...options });

// Per visitor, short window. Its headers drive the "questions left" note on the site.
const perVisitorBurst = limiter({
  windowMs: 10 * 60 * 1000,
  limit: L.perIpPer10Min,
  standardHeaders: true,
  message: { error: `That's the question limit for now. Try again in 10 minutes, or email Punji at ${EMAIL}.` },
});

// Per visitor, per day
const perVisitorDaily = limiter({
  windowMs: 24 * 60 * 60 * 1000,
  limit: L.perIpPerDay,
  message: { error: `That's today's question limit. Email Punji at ${EMAIL} and he'll answer directly.` },
});

// Everyone together: a hard daily ceiling on model calls, so the bill can't run away
// even if someone rotates through many IP addresses.
const allVisitorsDaily = limiter({
  windowMs: 24 * 60 * 60 * 1000,
  limit: L.globalPerDay,
  keyGenerator: () => "everyone",
  statusCode: 503,
  message: { error: `The chatbot has answered all it can for today. Email Punji at ${EMAIL} instead.` },
});

const promptReads = limiter({ windowMs: 10 * 60 * 1000, limit: 30, message: { error: "Too many requests." } });

// ---------- request checks ----------
function requireSiteOrigin(req, res, next) {
  if (config.allowedOrigins.includes(req.get("origin"))) return next();
  res.status(403).json({ error: "Forbidden" });
}

// Accept only the shape the site sends, and trim it to size before it reaches the model
function validateChat(req, res, next) {
  const body = req.body || {};
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return res.status(400).json({ error: "Message is required." });
  if (message.length > L.messageChars) {
    return res.status(400).json({ error: `Keep questions under ${L.messageChars} characters.` });
  }

  const raw = Array.isArray(body.history) ? body.history.slice(-L.historyTurns) : [];
  const history = [];
  for (const turn of raw) {
    const text = turn?.parts?.[0]?.text;
    if ((turn?.role !== "user" && turn?.role !== "model") || typeof text !== "string") {
      return res.status(400).json({ error: "Bad history." });
    }
    history.push({ role: turn.role, text: text.slice(0, L.turnChars) });
  }
  let total = history.reduce((n, t) => n + t.text.length, 0);
  while (total > L.historyChars) total -= history.shift().text.length;
  while (history.length && history[0].role !== "user") history.shift(); // must open with a question

  req.chat = { message, history };
  next();
}

// ---------- routes ----------
app.get("/api/prompt", promptReads, (req, res) => {
  res.type("text/plain").send(PROMPT);
});

app.post(
  "/api/chat",
  requireSiteOrigin,
  validateChat,
  perVisitorBurst,
  perVisitorDaily,
  allVisitorsDaily,
  async (req, res) => {
    try {
      const reply = await generateChatResponse(req.chat.message, req.chat.history);
      res.json({ reply });
    } catch (error) {
      console.error(`Chat failed: ${error.message}`);
      res.status(502).json({ error: `The chatbot couldn't answer just now. Try again in a moment, or email Punji at ${EMAIL}.` });
    }
  },
);

// Everything else, including malformed or oversized JSON: a short JSON error, never a stack trace
app.use((req, res) => res.status(404).json({ error: "Not found." }));
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status === 413 ? "Message too long." : status < 500 ? "Bad request." : "Something went wrong." });
});

app.listen(config.port, () => {
  console.log(`Portfolio chatbot listening on port ${config.port}`);
  getSiteText(); // warm the website text so the first visitor doesn't wait for it
});
