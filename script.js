/* punjaya.com
   1. Nav: highlight the section in view
   2. Timeline visuals: animate in when they scroll into view
   3. Ask AI: rotating example questions + chat with the portfolio chatbot
*/

const CONFIG = {
  API_ENDPOINT:
    "https://portfolio-chatbot-963557792569.us-central1.run.app/api/chat",
};

const EXAMPLE_QUESTIONS = [
  "What is Punji working on right now?",
  "What has he built with drones?",
  "Why does he care about AI safety?",
  "Could he build a website for my business?",
];

// ==========================================
// 1. NAV
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const links = [...document.querySelectorAll(".nav-links a")];
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
// 3. ASK AI
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

// Light markdown: bold, italics, links, line breaks
function renderMarkdown(text) {
  return escapeHTML(text)
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.*?)\*/g, "<i>$1</i>")
    .replace(
      /\[(.*?)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1</a>',
    )
    .replace(/\n/g, "<br>");
}

// The page's own text, sent to the chatbot as context
function scrapeWebsiteContent() {
  let contentText =
    "Note: this website is more up to date than the CV. Where they disagree (current roles, dates, projects), trust the website. " +
    "Punjaya goes by Punji. 'Since <date>' means it is ongoing now.\n\n";
  document.querySelectorAll("main section").forEach((section) => {
    const clone = section.cloneNode(true);
    clone
      .querySelectorAll("button, script, style, input, svg, form, .chat, [aria-hidden='true']")
      .forEach((el) => el.remove());
    const text = clone.innerText.replace(/\s+/g, " ").trim();
    if (text) contentText += `Section: ${section.id.toUpperCase()}\n${text}\n\n`;
  });
  return contentText.trim();
}

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
      body: JSON.stringify({
        message: query,
        history: chatHistory,
        webContext: scrapeWebsiteContent(),
      }),
    });
    if (!response.ok) {
      throw new Error(response.status === 429 ? "RATE_LIMIT" : "API_ERROR");
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
      error.message === "RATE_LIMIT"
        ? "That's the question limit for now (it keeps the bots out). Try again in 10 minutes, or just email me."
        : "Sorry, I couldn't reach the chatbot. Try again in a moment, or email me directly.";
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
