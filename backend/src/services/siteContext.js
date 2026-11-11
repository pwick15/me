/**
 * The live website's text, fetched by the server and cached for an hour.
 * The browser used to send this with every question, which let anyone put
 * their own instructions into the system prompt.
 */
const config = require("../config");

const TTL_MS = 60 * 60 * 1000;
const cache = { text: "", at: 0 };

// Remove every element whose opening tag matches `opening` (tag name in group 1),
// along with everything nested inside it.
function dropElements(html, opening) {
  let out = html;
  let m;
  while ((m = opening.exec(out))) {
    const tag = m[1].toLowerCase();
    const scan = new RegExp(`<(/?)${tag}\\b[^>]*?(/?)>`, "gi");
    scan.lastIndex = m.index;
    let depth = 0;
    let end = out.length;
    let t;
    while ((t = scan.exec(out))) {
      if (t[2]) {
        if (depth === 0) { end = scan.lastIndex; break; } // self-closing
        continue;
      }
      depth += t[1] ? -1 : 1;
      if (depth === 0) { end = scan.lastIndex; break; }
    }
    out = out.slice(0, m.index) + out.slice(end);
  }
  return out;
}

function htmlToText(html) {
  const main = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? html;
  let s = dropElements(main, /<(script|style|svg|form|template)\b[^>]*>/i);
  s = dropElements(s, /<(\w+)\b[^>]*\baria-hidden="true"[^>]*>/i); // decorative mockups
  // Keep where links go, so the chatbot can point visitors to essays, apps and papers
  s = s.replace(/<a\b[^>]*?\bhref="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (m, href, text) => {
    if (href.startsWith("#")) return text;
    try {
      return `${text} (${new URL(href.replace(/&amp;/g, "&"), config.siteUrl).href.replace(/^mailto:/, "")})`;
    } catch {
      return text;
    }
  });
  return s
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(br|\/p|\/h[1-6]|\/li|\/div|\/section|\/article|\/summary)\b[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

async function getSiteText() {
  if (Date.now() - cache.at < TTL_MS) return cache.text;
  cache.at = Date.now(); // on failure, keep the last good copy and retry in an hour
  try {
    const res = await fetch(config.siteUrl, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cache.text = htmlToText(await res.text()).slice(0, config.limits.siteChars);
  } catch (err) {
    console.warn(`Couldn't refresh website text: ${err.message}`);
  }
  return cache.text;
}

module.exports = { getSiteText, htmlToText };
