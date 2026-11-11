/* punjaya.com
   1. Nav: highlight the section in view
   2. Timeline visuals: animate in when they scroll into view
   3. Tools: expand an app's details under its row
   4. Ask AI: rotating example questions + chat with the portfolio chatbot
*/

const CONFIG = {
  API_ENDPOINT:
    "https://portfolio-chatbot-963557792569.us-central1.run.app/api/chat",
};

// The chatbot's published instructions (backend/src/prompt.md)
const PROMPT_URL = CONFIG.API_ENDPOINT.replace(/\/chat$/, "/prompt");

const EXAMPLE_QUESTIONS = [
  "What is Punji working on right now?",
  "Is he a fit for a junior ML engineer role?",
  "What has he built with drones?",
  "What would he be weakest at?",
  "Could he build a website for my business?",
];

// ==========================================
// 1. NAV
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Only in-page links; the Blog link points off-site
  const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const targets = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  function spy() {
    let current = null;
    for (const section of targets) {
      if (section.getBoundingClientRect().top < window.innerHeight * 0.3) {
        current = section.id;
      }
    }
    links.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === `#${current}`),
    );
  }

  window.addEventListener("scroll", spy, { passive: true });
  window.addEventListener("resize", spy);
  spy();
});

// ==========================================
// 2. VISUALS IN VIEW
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const media = document.querySelectorAll(".media");
  if (!("IntersectionObserver" in window)) {
    media.forEach((m) => m.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -15% 0px" },
  );
  media.forEach((m) => io.observe(m));
});

// ==========================================
// 3. TOOLS: open one app's details under its row
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const grid = document.querySelector(".tools");
  if (!grid) return;
  const tools = [...grid.querySelectorAll(".tool")];
  const picks = tools.map((t) => t.querySelector(".tool-pick"));
  // Grid order: tools on even slots, so an open panel can sit on the odd slot after its row
  tools.forEach((t, i) => (t.style.order = i * 2));

  const panelOf = (pick) => document.getElementById(pick.getAttribute("aria-controls"));

  // Rows are measured with the panel hidden, so it can't push tiles around
  function place() {
    const open = picks.find((p) => p.getAttribute("aria-expanded") === "true");
    if (!open) return;
    const panel = panelOf(open);
    panel.hidden = true;
    const top = open.parentElement.offsetTop;
    const rowEnd = tools.filter((t) => t.offsetTop === top).pop();
    panel.style.order = tools.indexOf(rowEnd) * 2 + 1;
    panel.hidden = false;
  }

  picks.forEach((pick) =>
    pick.addEventListener("click", () => {
      const opening = pick.getAttribute("aria-expanded") !== "true";
      picks.forEach((p) => {
        p.setAttribute("aria-expanded", "false");
        panelOf(p).hidden = true;
      });
      if (!opening) return;
      pick.setAttribute("aria-expanded", "true");
      place();
    }),
  );
  window.addEventListener("resize", place);
});

// ==========================================
// 4. ASK AI
// ==========================================
let chatHistory = [];
let busy = false;

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ask-form");
  const input = document.getElementById("chat-input");
  const clear = document.getElementById("chat-clear");
  if (!form || !input) return;

  // Example questions rotate through the placeholder
  let qi = 0;
  const prefix = () => (window.innerWidth < 560 ? "" : "Ask an AI: ");
  input.placeholder = prefix() + EXAMPLE_QUESTIONS[0];
  setInterval(() => {
    if (document.activeElement === input || input.value) return;
    input.classList.add("fade");
    setTimeout(() => {
      qi = (qi + 1) % EXAMPLE_QUESTIONS.length;
      input.placeholder = prefix() + EXAMPLE_QUESTIONS[qi];
      input.classList.remove("fade");
    }, 300);
  }, 3500);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    // An empty submit asks the question currently shown
    const query = input.value.trim() || EXAMPLE_QUESTIONS[qi];
    sendMessage(query);
  });

  clear.addEventListener("click", () => {
    chatHistory = [];
    document.getElementById("chat-history").innerHTML = "";
    document.getElementById("rate-limit-warning").textContent = "";
    document.getElementById("chat").hidden = true;
    input.focus();
  });
});

function escapeHTML(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Inline markdown: code, links, bold, italics (input is escaped first)
function renderInline(text) {
  return escapeHTML(text)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(
      /\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>',
    )
    .replace(/\*\*(?=\S)(.+?)\*\*/g, "<b>$1</b>")
    .replace(/__(?=\S)(.+?)__/g, "<b>$1</b>")
    .replace(/(^|[^*\w])\*(?=\S)([^*]+?)\*(?!\w)/g, "$1<i>$2</i>")
    .replace(/(^|[^_\w])_(?=\S)([^_]+?)_(?!\w)/g, "$1<i>$2</i>");
}

// Block markdown: paragraphs, headings, bullet and numbered lists
function renderMarkdown(text) {
  const out = [];
  let para = [];
  let list = null; // { tag: "ul" | "ol", items: [] }

  const flushPara = () => {
    if (para.length) out.push(`<p>${para.map(renderInline).join("<br>")}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) {
      out.push(
        `<${list.tag}>${list.items
          .map((it) => `<li${it.sub ? ' class="sub"' : ""}>${renderInline(it.text)}</li>`)
          .join("")}</${list.tag}>`,
      );
    }
    list = null;
  };

  for (const raw of text.replace(/\r/g, "").split("\n")) {
    const line = raw.replace(/\s+$/, "");
    const heading = line.match(/^\s*#{1,6}\s+(.*)$/);
    const bullet = line.match(/^(\s*)[-*•]\s+(.*)$/);
    const numbered = line.match(/^(\s*)\d+[.)]\s+(.*)$/);

    if (!line.trim()) {
      flushPara();
      flushList();
    } else if (heading) {
      flushPara();
      flushList();
      out.push(`<p class="h">${renderInline(heading[1])}</p>`);
    } else if (bullet || numbered) {
      const m = bullet || numbered;
      const tag = bullet ? "ul" : "ol";
      const sub = m[1].length >= 2;
      flushPara();
      // A nested item keeps the parent list; a top-level item of a new type starts one
      if (list && list.tag !== tag && !sub) flushList();
      if (!list) list = { tag, items: [] };
      list.items.push({ text: m[2], sub });
    } else if (list && /^\s{2,}\S/.test(raw)) {
      // Continuation line of the previous list item
      list.items[list.items.length - 1].text += " " + line.trim();
    } else {
      flushList();
      para.push(line.trim());
    }
  }
  flushPara();
  flushList();
  return out.join("");
}

// "Read its instructions": fetch the live prompt the first time it's opened
document.addEventListener("DOMContentLoaded", () => {
  const rules = document.getElementById("rules");
  const body = document.getElementById("rules-body");
  if (!rules || !body) return;
  let loaded = false;
  rules.addEventListener("toggle", async () => {
    if (!rules.open || loaded) return;
    loaded = true;
    body.innerHTML = '<span class="dots"><i></i><i></i><i></i></span>';
    try {
      const response = await fetch(PROMPT_URL);
      if (!response.ok) throw new Error(response.status);
      body.innerHTML = renderMarkdown(await response.text());
    } catch (error) {
      loaded = false; // try again next time it's opened
      body.innerHTML = "<p>Couldn't load them just now. They're on GitHub, linked below.</p>";
    }
  });
});

async function sendMessage(query) {
  if (busy || !query) return;
  busy = true;

  const input = document.getElementById("chat-input");
  const button = document.querySelector("#ask-form button");
  const chat = document.getElementById("chat");
  const history = document.getElementById("chat-history");

  input.value = "";
  button.disabled = true;
  chat.hidden = false;

  const qa = document.createElement("div");
  qa.className = "qa";
  qa.innerHTML = `<p class="qa-q">${escapeHTML(query)}</p><div class="qa-a"><span class="dots"><i></i><i></i><i></i></span></div>`;
  history.appendChild(qa);
  history.scrollTop = history.scrollHeight;
  const answer = qa.querySelector(".qa-a");

  try {
    const response = await fetch(CONFIG.API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // The server reads the site itself, so only the conversation goes up
      body: JSON.stringify({ message: query, history: chatHistory }),
    });
    if (!response.ok) {
      const error = new Error(response.status === 429 ? "RATE_LIMIT" : "API_ERROR");
      // Limit messages (429, or 503 when the daily ceiling is hit) come from the server
      if (response.status === 429 || response.status === 503) {
        error.userMessage = await response.json().then((d) => d.error, () => "");
      }
      throw error;
    }
    const data = await response.json();
    const reply = data.reply || "No response received.";

    chatHistory.push({ role: "user", parts: [{ text: query }] });
    chatHistory.push({ role: "model", parts: [{ text: reply }] });

    const remaining = parseInt(response.headers.get("RateLimit-Remaining"), 10);
    document.getElementById("rate-limit-warning").textContent =
      remaining <= 10 ? `${remaining} questions left this session` : "";

    await streamInto(answer, reply, history);
  } catch (error) {
    console.error("Chat error:", error);
    answer.classList.add("err");
    answer.textContent =
      error.userMessage ||
      (error.message === "RATE_LIMIT"
        ? "That's the question limit for now (it keeps the bots out). Try again in 10 minutes, or just email me."
        : "Sorry, I couldn't reach the chatbot. Try again in a moment, or email me directly.");
  } finally {
    busy = false;
    button.disabled = false;
  }
}

async function streamInto(el, text, scroller) {
  const words = text.split(" ");
  let shown = "";
  for (let i = 0; i < words.length; i++) {
    shown += (i ? " " : "") + words[i];
    el.innerHTML = renderMarkdown(shown);
    scroller.scrollTop = scroller.scrollHeight;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}
