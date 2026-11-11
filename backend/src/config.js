/**
 * Centralized Configuration Management
 */
const num = (value, fallback) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

module.exports = {
  // Server Port
  port: process.env.PORT || 8080,

  // Google Cloud Platform Configurations
  gcpProject: process.env.GOOGLE_CLOUD_PROJECT || "project-f3658b98-4d0a-4964-a7f",
  gcpLocation: process.env.GOOGLE_CLOUD_LOCATION || "us-central1",
  model: process.env.GEMINI_MODEL || "gemini-2.5-flash",

  // The live site the chatbot reads for up-to-date context
  siteUrl: process.env.SITE_URL || "https://www.punjaya.com/",

  // Allowed CORS Origins
  allowedOrigins: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : [
      "https://punjaya.com",
      "https://www.punjaya.com",
      "http://localhost:8137",
      "http://localhost:5500",
      "http://127.0.0.1:5500",
    ],

  // Spend controls. The counters live in memory, so deploy with --max-instances 1
  // (see README) or each instance gets its own allowance.
  limits: {
    perIpPer10Min: num(process.env.LIMIT_PER_IP_10MIN, 20),
    perIpPerDay: num(process.env.LIMIT_PER_IP_DAY, 60),
    globalPerDay: num(process.env.LIMIT_GLOBAL_DAY, 200), // all visitors together
    messageChars: 1000,
    historyTurns: 12, // last 6 questions and answers
    turnChars: 4000,
    historyChars: 16000,
    siteChars: 20000,
    outputTokens: 700,
  },
};
