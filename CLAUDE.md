# punjaya.com

Static site (`index.html`, `style.css`, `script.js`, `blog/`) plus the "Ask an AI" chatbot backend in `backend/` (Cloud Run + Gemini, see `backend/README.md`).

## Releasing CSS and JS changes

The host tells browsers to cache `style.css` and `script.js` for 4 hours. When you change either, bump the `?v=` on its tag in `index.html`, so returning visitors don't get new HTML with old styles.

## Chatbot coverage check (mandatory)

Run a **coverage check** whenever a change adds or edits a project, role, claim, essay or link on the site. The task isn't done until it passes.

The chatbot knows only three things:

- `backend/src/data/cv.txt`, its main knowledge base.
- The live text of punjaya.com, which the server fetches hourly (`backend/src/services/siteContext.js`). It reads `<main>` and keeps link URLs. It drops SVGs, forms and anything `aria-hidden`, so text inside decorative mockups is invisible to it.
- `backend/src/prompt.md`, its instructions. They're published on the site under Punji's name, so treat edits as public copy.

For each added or changed item, confirm that cv.txt plus the visible site text answer:

1. What is it, in a sentence?
2. What was his role, and who else was involved?
3. When?
4. What came of it (numbers, outcomes, recognition)?
5. Where can a visitor read more? Essays need a one or two sentence summary and their URL.

Fill gaps in cv.txt. Facts come from Punji or existing material (the site, blog pages, linked docs). When a fact is missing, ask him. Also fix anything in cv.txt the change made stale, such as dates, URLs or "since" wording.

Done means every changed item answers all five questions, and you've told Punji which items you checked, what you added, and which facts you still need from him.

Changes to cv.txt and prompt.md reach the live chatbot only after a backend deploy: `npm --prefix backend run deploy`. Site text updates by itself within an hour of the site going live.
