/* PORTFOLIO JAVASCRIPT
   Features:
   1. Mobile Navigation Hamburger Menu Toggle
   2. Scroll Reveal Observer (entrance animations)
   3. Hero Subtitle Typing Effect
   4. Interactive Constellation Physics Canvas (Gemini Style)
   5. Minimalist AI prompt search and typographic response panel
*/

// ==========================================
// 2. SCROLL REVEAL OBSERVER
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const revealElements = document.querySelectorAll(".reveal");

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // Dedicated scroll-driven observer for AI search segment
  const aiSegment = document.getElementById("ai-search-segment");
  if (aiSegment) {
    const aiObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            aiSegment.classList.add("visible");
            aiObserver.unobserve(aiSegment);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -80px 0px",
      },
    );
    aiObserver.observe(aiSegment);
  }

});

// ==========================================
// 3. HERO SUBTITLE TYPING EFFECT
// ==========================================
const words = [
  "Mechatronics Engineer",
  "AI & Computer Vision Developer",
  "Robotics and Embedded Systems",
  "First Class Honours Graduate @ ANU",
];
let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;
const typedTextSpan = document.getElementById("typed-text");
const typingSpeed = 60;
const erasingSpeed = 30;
const newWordDelay = 2000;

function typeEffect() {
  if (!typedTextSpan) return;

  const currentWord = words[wordIndex];

  if (isDeleting) {
    typedTextSpan.innerHTML =
      currentWord.substring(0, charIndex) +
      '<span class="typing-cursor"></span>';
    charIndex--;
  } else {
    typedTextSpan.innerHTML =
      currentWord.substring(0, charIndex + 1) +
      '<span class="typing-cursor"></span>';
    charIndex++;
  }

  let delay = isDeleting ? erasingSpeed : typingSpeed;

  if (!isDeleting && charIndex === currentWord.length) {
    isDeleting = true;
    delay = newWordDelay;
  } else if (isDeleting && charIndex < 0) {
    isDeleting = false;
    wordIndex = (wordIndex + 1) % words.length;
    charIndex = 0;
    delay = 300; // shorter pause when empty before typing next word
  }

  setTimeout(typeEffect, delay);
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(typeEffect, 800);
});

// ==========================================
// 5. CONFIGURATION & AI CHAT ENGINE
// ==========================================

const CONFIG = {
  USE_MOCK_RAG: false,
  API_ENDPOINT:
    "https://portfolio-chatbot-963557792569.us-central1.run.app/api/chat",
  RESUME_PATH: "./assets/documents/doc-resume.pdf",
};

let chatHistory = [];

document.addEventListener("DOMContentLoaded", () => {
  // Set up Download CV click handler dynamically
  const downloadCvBtn = document.getElementById("download-cv-btn");
  if (downloadCvBtn) {
    downloadCvBtn.addEventListener("click", () => {
      window.open(CONFIG.RESUME_PATH, "_blank");
    });
  }
});

const RAG_DATABASE = [
  {
    keywords: [
      "skills",
      "skill",
      "technologies",
      "programming",
      "languages",
      "c++",
      "python",
      "pytorch",
      "tensorflow",
      "opencv",
      "verilog",
      "altium",
      "ros",
      "ros2",
    ],
    response:
      "Punjaya's skillset spans across Mechatronics, CS, and AI. Highlights include:\n\n" +
      "• **Computer Vision & AI**: Python, OpenCV (Experienced), PyTorch, TensorFlow, C++ (Intermediate).\n" +
      "• **Embedded Systems**: ROS/ROS2, C, UART | I2C | CAN | UDP (Intermediate), Verilog, Altium Designer.\n" +
      "• **Control Systems**: GPS-Denied Navigation, State Estimation, SLAM, ArduPilot, State Machines.\n" +
      "• **Software Dev**: Git, Linux, Vim/Neovim, Docker, HTML/CSS/JS.\n" +
      "• **Data Analysis**: NumPy, Pandas, Plotly, Matplotlib, Seaborn.",
  },
  {
    keywords: [
      "paper",
      "publication",
      "publications",
      "research",
      "journal",
      "european journal",
      "ejoc",
      "observer",
      "navigation",
      "gnss",
    ],
    response:
      "Punjaya co-authored a peer-reviewed research paper in the **European Journal of Control (2024)** titled:\n\n" +
      '*"Constructive synchronous observer design for inertial navigation with delayed GNSS measurements"*.\n\n' +
      "This work presents the first observer for Inertial Navigation Systems (INS) with delayed GNSS measurements to feature almost global asymptotic and local exponential stability. You can view the paper in the **Honours** or **Projects** sections!",
  },
  {
    keywords: [
      "awards",
      "award",
      "finalist",
      "national security",
      "defence",
      "australian ai awards",
      "scholars",
      "scholarship",
      "cecs",
      "dickins",
    ],
    response:
      "Punjaya has received notable academic and professional awards:\n\n" +
      "• **Australian AI Awards Finalist 2024**: Named a national finalist for *AI Innovator in Defence and National Security*.\n" +
      "• **CECS R&D Excellence Scholarship**: Awarded to high-performing research-stream engineering students at ANU.\n" +
      "• **CECC Dickins Scholarship**: Awarded to high-achieving Honours students at ANU.",
  },
  {
    keywords: [
      "education",
      "gpa",
      "atar",
      "university",
      "anu",
      "academic",
      "hons",
      "honours",
      "first class",
    ],
    response:
      "Punjaya graduated with a **Bachelor of Engineering (R&D) with First Class Honours** from the **Australian National University (ANU)**, majoring in Mechatronics and Computer Science. He achieved a **6.72/7.0 GPA** and had a **99.20 ATAR** entry rank.",
  },
  {
    keywords: [
      "projects",
      "project",
      "portfolio",
      "change detection",
      "lidar",
      "bms",
      "battery",
      "estimator",
      "airsim",
      "emotion",
      "acoustic",
      "mof",
      "combined xi",
      "games",
      "workaway",
      "connections",
      "checkers",
      "agentic",
      "voice assistant",
    ],
    response:
      "Punjaya's portfolio is divided into two primary categories:\n\n" +
      "**Academic & Professional Projects**:\n" +
      "• **Agentic AI Solution**: Air-gapped multi-agent system for report generation, Q&A, and analytics.\n" +
      "• **AI Voice Assistant**: Edge-optimized local assistant developed for underserved textile communities in India.\n" +
      "• **AI Change Detection**: Unsupervised deep learning system detecting structural changes on the edge using LiDAR/camera fusion.\n" +
      "• **Battery Management System (BMS)**: Embedded C firmware for safe charging/discharging using state machines.\n" +
      "• **GPS-Denied Navigation**: Simulated visual-inertial state estimation in AirSim.\n" +
      "• **Robust Inertial Navigation**: Developed a synchronous observer for INS with delayed GNSS (peer-reviewed in European Journal of Control).\n" +
      "• **Acoustic Emotion Recognition**: Traditional and deep ML models classifying human emotion from audio.\n" +
      "• **Acetone Sensing with MOFs**: Filtration membranes literature study for breath-based diabetic screening.\n\n" +
      "**Personal Projects**:\n" +
      "• **Trip Planner**: Visual travel route mapping tool.\n" +
      "• **workaway.ai**: Web scraper utilizing an LLM to find ideal travel/volunteer hosts.\n" +
      "• **travelbuddy.**: Discord bot and LLM parsing database system to map travel contacts.\n" +
      "• **Checkers Simulator**: Educational game engine visualizing Minimax and alpha-beta pruning.\n" +
      "• **Combined XI Builder**: Flask/Python web app generating combined starting lineups.\n" +
      "• **Games in Python**: Pong, Connect 4, and Snake implemented in OOP Python.\n\n" +
      "You can browse details and view documents/links in the **Projects** section of the website!",
  },
  {
    keywords: [
      "contact",
      "email",
      "mail",
      "linkedin",
      "github",
      "hire",
      "phone",
      "reach out",
    ],
    response:
      "You can easily connect with Punjaya:\n\n" +
      "• **Email**: [punjayawick@gmail.com](mailto:punjayawick@gmail.com)\n" +
      "• **LinkedIn**: [linkedin.com/in/punjaya](https://www.linkedin.com/in/punjaya/)\n" +
      "• **GitHub**: [github.com/pwick15](https://github.com/pwick15)\n\n" +
      "Feel free to send an email or connect on LinkedIn to discuss collaborations!",
  },
  {
    keywords: [
      "about",
      "who is",
      "introduction",
      "background",
      "mission",
      "personal",
      "football",
      "barcelona",
      "sri lanka",
      "sports",
      "philosophy",
      "learning",
      "sustainability",
      "goals",
      "sdg",
    ],
    response:
      "Punjaya is a Mechatronics and CS graduate from ANU fascinated by the intersection of software, electronics, and mechanical systems, with a core passion for robotics.\n\n" +
      "**Mission**: Create impactful robotic solutions to improve lives, with a focus on UN Sustainable Development Goals (e.g., medical robotics, agricultural tech, education access) through meaningful long-term partnerships. Long-term, he dreams of supporting humanitarian engineering in Sri Lanka.\n\n" +
      "**Interests**: Passionate sports and football fan (Visca el Barça!), travel, music, and exploring new ideas, philosophies, and random areas of knowledge.",
  },
];

const FALLBACK_RESPONSE =
  "I couldn't find a direct match for that query. I can tell you about Punjaya's:\n\n" +
  "• **Research Papers** (EJoC inertial navigation observer paper)\n" +
  "• **AI Awards Finalist 2024** nomination\n" +
  "• **Core Skills** (Python, C++, PyTorch, ROS, Control systems)\n" +
  "• **Engineering Projects** (Change detection, BMS, AirSim simulator)\n" +
  "• **Education** (First Class Honours, GPA 6.72/7 at ANU)\n" +
  "• **Contact info**\n\n" +
  "Try asking another question, or click one of the suggestion chips!";

function sendPrompt(promptText) {
  const chatInput = document.getElementById("chat-input");
  if (chatInput) {
    chatInput.value = promptText;
    sendMessage();
  }
}

function handleKeyPress(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
}

let exchangeCount = 0;

function clearResponse() {
  const panel = document.getElementById("ai-response-panel");
  const content = document.getElementById("chat-history");
  const input = document.getElementById("chat-input");
  const chatBarContainer = document.querySelector(".ai-chat-bar-container");

  if (panel) panel.style.display = "none";
  if (content) content.innerHTML = "";
  if (input) input.value = "";

  // Move chat bar back above the buttons container
  const btnContainer = document.querySelector(".btn-container");
  if (chatBarContainer) {
    if (btnContainer) {
      btnContainer.parentNode.insertBefore(chatBarContainer, btnContainer);
    } else if (panel) {
      panel.parentNode.insertBefore(chatBarContainer, panel);
    }
    chatBarContainer.classList.remove("shifted");
  }
  exchangeCount = 0;
  chatHistory = [];
}

// Scrapes the website's text content dynamically for the AI assistant context
function scrapeWebsiteContent() {
  const sections = document.querySelectorAll("section");
  let contentText = "";

  sections.forEach((section) => {
    // Skip chatbot profile element text to avoid indexing chat history
    if (section.id === "profile") {
      const title = section.querySelector(".title");
      if (title) contentText += `Profile Title: ${title.innerText}\n`;
      return;
    }

    // Clone section to remove interactive elements
    const clone = section.cloneNode(true);
    clone
      .querySelectorAll("button, script, style, nav, input, svg")
      .forEach((el) => el.remove());

    // Format text
    const sectionName = section.id.toUpperCase();
    const text = clone.innerText.replace(/\s+/g, " ").trim();
    if (text) {
      contentText += `Section: ${sectionName}\n${text}\n\n`;
    }
  });

  return contentText.trim();
}

async function sendMessage() {
  const chatInput = document.getElementById("chat-input");
  if (!chatInput) return;

  const query = chatInput.value.trim();
  if (query === "") return;

  // Hide floating prompts after first search
  const floatingPrompts = document.querySelector(".floating-prompts-container");
  if (floatingPrompts) {
    floatingPrompts.style.display = "none";
  }

  // Show response panel
  const panel = document.getElementById("ai-response-panel");
  if (panel) panel.style.display = "block";

  // Shift chat bar below response panel dynamically
  const chatBarContainer = document.querySelector(".ai-chat-bar-container");
  if (chatBarContainer && panel) {
    panel.parentNode.insertBefore(chatBarContainer, panel.nextSibling);
    chatBarContainer.classList.add("shifted");
  }

  // Minimize previous exchanges
  document.querySelectorAll(".chat-exchange").forEach((exch) => {
    exch.classList.add("minimized");
  });

  // Create new chat exchange
  exchangeCount++;
  const currentId = exchangeCount;

  const newExchange = document.createElement("div");
  newExchange.className = "chat-exchange";
  newExchange.id = `exchange-${currentId}`;
  newExchange.innerHTML = `
    <div class="chat-header-row" onclick="toggleExchange(${currentId})">
      <div class="chat-header-q-wrapper">
        <span class="chat-header-q">${query}</span>
      </div>
      <button class="chat-toggle-btn">
        <svg class="chevron-icon" viewBox="0 0 24 24">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"></path>
        </svg>
      </button>
    </div>
    <div class="chat-body" id="body-${currentId}">
      <div class="chat-text-container" id="text-${currentId}">
        <div class="chat-body-status">
          <span class="status-dot thinking" id="dot-${currentId}"></span>
          <span class="status-text" id="status-${currentId}">Thinking...</span>
        </div>
        <div class="chat-text-content" id="content-${currentId}">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  `;

  const content = document.getElementById("chat-history");
  content.appendChild(newExchange);

  // Clear input field immediately
  chatInput.value = "";

  try {
    let answerText = "";

    if (CONFIG.USE_MOCK_RAG) {
      answerText = queryMockRAG(query);
      await new Promise((resolve) => setTimeout(resolve, 800));
    } else {
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
        if (response.status === 429) throw new Error("RATE_LIMIT_EXCEEDED");
        throw new Error("API request failed");
      }
      const data = await response.json();
      answerText = data.reply || "No response received.";

      // Update chat history with this turn
      chatHistory.push({ role: "user", parts: [{ text: query }] });
      chatHistory.push({ role: "model", parts: [{ text: answerText }] });

      // Handle Rate Limit UI Update
      const remainingStr = response.headers.get("RateLimit-Remaining");
      if (remainingStr) {
        const remaining = parseInt(remainingStr, 10);
        const warningEl = document.getElementById("rate-limit-warning");
        if (warningEl) {
          if (remaining <= 10) {
            warningEl.style.display = "block";
            warningEl.innerHTML = `You have ${remaining} queries left for this session (limited to prevent bot abuse).`;
          } else {
            warningEl.style.display = "none";
          }
        }
      }
    }

    // Clear typing and stream the response
    const statusDot = document.getElementById(`dot-${currentId}`);
    const statusText = document.getElementById(`status-${currentId}`);
    const contentDiv = document.getElementById(`content-${currentId}`);

    if (statusDot) {
      statusDot.classList.remove("thinking");
      statusDot.classList.add("active");
    }
    if (statusText) {
      statusText.innerText = "AI Assistant";
    }
    if (contentDiv) {
      contentDiv.innerHTML = "";
      await streamResponse(answerText, currentId);
    }
  } catch (error) {
    console.error("RAG error:", error);
    const statusDot = document.getElementById(`dot-${currentId}`);
    const statusText = document.getElementById(`status-${currentId}`);
    const contentDiv = document.getElementById(`content-${currentId}`);

    if (statusDot) {
      statusDot.classList.remove("thinking");
      statusDot.classList.add("error");
    }
    if (statusText) {
      statusText.innerText = "System Error";
    }
    if (contentDiv) {
      if (error.message === "RATE_LIMIT_EXCEEDED") {
        contentDiv.innerHTML =
          "You have reached the maximum number of queries for this session (limited to prevent bot abuse). Please try again in 10 minutes!";
      } else {
        contentDiv.innerHTML =
          "Sorry, I had trouble connecting to the RAG database. Please check my contact details or try again later!";
      }
    }
  }
}

async function streamResponse(fullText, exchangeId) {
  const contentDiv = document.getElementById(`content-${exchangeId}`);
  if (!contentDiv) return;

  const wordsArray = fullText.split(" ");
  let currentHTML = "";

  for (let i = 0; i < wordsArray.length; i++) {
    currentHTML += wordsArray[i] + " ";

    // Parse markdown tags
    let tempText = currentHTML
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
      .replace(/\*(.*?)\*/g, "<i>$1</i>")
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n/g, "<br>")
      .replace(/• /g, "• ");

    contentDiv.innerHTML = tempText;

    // Typing delay
    await new Promise((resolve) => setTimeout(resolve, 35));
  }
}

function toggleExchange(id) {
  const exch = document.getElementById(`exchange-${id}`);
  if (!exch) return;

  const isMinimized = exch.classList.contains("minimized");

  if (isMinimized) {
    // Minimize all other exchanges to keep UI clean
    document.querySelectorAll(".chat-exchange").forEach((e) => {
      e.classList.add("minimized");
    });

    // Expand this one
    exch.classList.remove("minimized");
  } else {
    // Collapse this one
    exch.classList.add("minimized");
  }
}

function queryMockRAG(query) {
  const lowercaseQuery = query.toLowerCase();
  for (const doc of RAG_DATABASE) {
    for (const keyword of doc.keywords) {
      if (lowercaseQuery.includes(keyword)) {
        return doc.response;
      }
    }
  }
  return FALLBACK_RESPONSE;
}

// ==========================================
// 7. SCROLL-DRIVEN BACKGROUND GRADIENT
// ==========================================
window.addEventListener("scroll", () => {
  const documentHeight =
    document.documentElement.scrollHeight - window.innerHeight;
  if (documentHeight <= 0) return;
  const scrollPercent = window.scrollY / documentHeight;

  // Shift background position based on scroll percentage
  const xPos = scrollPercent * 100;
  const yPos = scrollPercent * 100;
  document.body.style.backgroundPosition = `${xPos}% ${yPos}%`;
});

// ==========================================
// 8. SCROLL SPY ACTIVE NAV LINK
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-links a");
  const navContainer = document.querySelector(".nav-links");

  function scrollSpy() {
    // Determine active section (looking at the top 1/3 of the viewport)
    const scrollPosition = window.scrollY + window.innerHeight / 3;
    let currentSectionId = "";

    sections.forEach((sec) => {
      const sectionTop = sec.offsetTop;
      const sectionHeight = sec.offsetHeight;

      if (
        scrollPosition >= sectionTop &&
        scrollPosition < sectionTop + sectionHeight
      ) {
        currentSectionId = sec.getAttribute("id");
      }
    });

    if (currentSectionId) {
      navLinks.forEach((link) => {
        const isHrefMatch =
          link.getAttribute("href") === `#${currentSectionId}`;

        if (isHrefMatch) {
          if (!link.classList.contains("active")) {
            link.classList.add("active");

            // Auto-center the active link on mobile
            if (navContainer && window.innerWidth <= 600) {
              const linkRect = link.getBoundingClientRect();
              const containerRect = navContainer.getBoundingClientRect();

              // Mathematically bulletproof offset calculation relative to scroll container
              const linkOffsetLeft =
                linkRect.left - containerRect.left + navContainer.scrollLeft;
              const linkWidth = linkRect.width;
              const containerWidth = containerRect.width;

              navContainer.scrollTo({
                left: linkOffsetLeft - containerWidth / 2 + linkWidth / 2,
                behavior: "smooth",
              });
            }
          }
        } else {
          link.classList.remove("active");
        }
      });
    }
  }

  // Bind spy to scroll and resize
  window.addEventListener("scroll", scrollSpy);
  window.addEventListener("resize", scrollSpy);

  // Initial run
  scrollSpy();
});

// Function to scroll to hero and focus AI chat input
function focusChat(event) {
  event.preventDefault();
  const profileSection = document.getElementById("profile");
  if (profileSection) {
    profileSection.scrollIntoView({ behavior: "smooth" });
  }
  const chatInput = document.getElementById("chat-input");
  if (chatInput) {
    setTimeout(() => {
      chatInput.focus();
      const chatBar = document.querySelector(".ai-chat-bar");
      if (chatBar) {
        chatBar.classList.add("pulse-highlight");
        setTimeout(() => {
          chatBar.classList.remove("pulse-highlight");
        }, 1500);
      }
    }, 600);
  }
}
