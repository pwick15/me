# Portfolio Chatbot Backend

The Node.js backend for the "Ask an AI" box on punjaya.com. It runs on **Google Cloud Run** and calls Gemini through **Vertex AI**.

The chatbot's instructions live in [`src/prompt.md`](src/prompt.md) and are published on the site (`GET /api/prompt`), so visitors can read exactly what it's told. Its knowledge is [`src/data/cv.txt`](src/data/cv.txt) plus the live text of punjaya.com, which the server fetches itself and refreshes hourly.

---

## Deploy

From the repo root:

```bash
npm --prefix backend run deploy
```

That runs this from inside `backend/`, wherever you call it from:

```bash
gcloud run deploy portfolio-chatbot --source . --region us-central1 --allow-unauthenticated --max-instances 1
```

Running the raw `gcloud` command from the repo root fails: Cloud Build finds no Dockerfile there, spots the Python scripts in `utils/`, and tries to build a Python app.

* `--source .` uploads this directory, minus what `.gcloudignore` lists (`.env`, `node_modules`), and builds it with the `Dockerfile`. Check the upload with `gcloud meta list-files-for-upload`.
* `--allow-unauthenticated` lets the website call it. Anyone else can call it too, which is why the limits below exist.
* `--max-instances 1` matters for cost: the rate-limit counters live in memory, so a second instance would get its own allowance. One instance handles far more traffic than a portfolio chatbot gets.

The service URL must match `API_ENDPOINT` in the site's `script.js`.

---

## Local development

```bash
npm install
gcloud auth application-default login   # Vertex AI credentials
node --env-file=.env src/index.js        # or: npm start
```

The server runs on port `8080`. To test against your local copy of the site instead of the live one, set `SITE_URL=http://localhost:8137/`.

---

## Spend and abuse controls

What's in place, in the order a request meets it:

| Control | Default | What it stops |
| --- | --- | --- |
| Origin check on `/api/chat` | punjaya.com and local dev ports | Casual scripts and other sites. Easy to fake, so it's a speed bump, not a wall. |
| Body size | 32 KB | Huge payloads |
| Input checks | question ≤ 1,000 chars; last 12 turns of history, ≤ 16,000 chars | Using the chatbot as a cheap general-purpose LLM with long inputs |
| Per visitor | 20 questions / 10 min, 60 / day (by IP) | One person hammering it |
| Everyone together | 200 questions / day | Many IPs at once. This is the hard ceiling on the bill. |
| Output cap | 700 tokens, thinking off | Long, expensive answers |
| Fixed instructions | `src/prompt.md`, server-side | Visitors rewriting the system prompt. It also tells the model to stay on topic. |

Override the limits with environment variables: `LIMIT_PER_IP_10MIN`, `LIMIT_PER_IP_DAY`, `LIMIT_GLOBAL_DAY`.

Each answer logs its token counts (never the question) to Cloud Run logs, so you can see what it's costing:

```bash
gcloud logging read 'resource.type="cloud_run_revision" AND jsonPayload.event="chat"' --limit 50
```

### Belt and braces in the GCP console

These sit outside the code and still hold if the code has a bug:

1. **Billing budget**: Billing → Budgets & alerts. Alerts only, it won't stop spending, but you'll hear about a spike.
2. **Vertex AI quota**: IAM & Admin → Quotas, filter for Gemini 2.5 Flash generate-content requests per minute, and lower it to something like 10. This is a hard cap Google enforces.

---

## Credential hygiene

Only stay logged in while you're testing or deploying.

```bash
# Before
gcloud auth login
gcloud auth application-default login

# After
gcloud auth revoke
gcloud auth application-default revoke
```
