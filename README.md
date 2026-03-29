# NUST Admit

> A fully offline admissions assistant for NUST applicants. No AI. No API. No internet required.

![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blue)
![Offline](https://img.shields.io/badge/offline-100%25-brightgreen)
![No AI](https://img.shields.io/badge/AI-none-orange)

---

## What Is This?

NUST Admit is a desktop application that helps prospective students get instant, accurate answers to their admissions questions — without needing an internet connection, an AI model, or any external service.

It works by parsing the official [NUST FAQ page](https://nust.edu.pk/faqs/) at startup and answering student questions through a lightweight keyword search engine written in plain JavaScript. Every answer comes verbatim from the official FAQ. If a question has no match, the app says so directly and provides NUST's contact details instead of guessing.

Built for the **NUST AI Challenge**, directed by **Dr. Sohail Iqbal**, under the constraint of: Core i5 13th Gen, 8GB RAM, no dedicated GPU, no cloud fallback.

---

## Why No AI?

This was a deliberate engineering decision, not a limitation.

Running a local LLM on an i5 with 8GB RAM and no GPU produces slow, unpredictable responses with real hallucination risk — especially for factual admissions data where a wrong answer has real consequences for a student.

A well-engineered keyword search over a verified FAQ file is:
- **Faster** — sub-50ms responses on any hardware
- **More reliable** — answers are sourced verbatim, never generated
- **More honest** — the system knows what it doesn't know and says so
- **Lighter** — zero RAM overhead beyond the app itself

The brief rewards disciplined engineering. Removing the model *was* the engineering decision.

---

## Features

- **100% offline** — works with no internet after installation
- **Instant responses** — keyword search returns results in under 50ms
- **Verbatim answers** — no text is generated or interpolated; everything comes from the official FAQ
- **Transparent matching** — shows which FAQ question was matched above every answer
- **Honest fallback** — if no match is found, gives NUST's direct contact instead of guessing
- **NUST branding** — dark green `#006633` and gold `#FFD700` throughout
- **Light/dark theme** — toggle in the UI, defaults to light
- **No hallucination possible** — the search either finds an answer or it doesn't

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron |
| Frontend | Next.js 14 (App Router) |
| Language | JavaScript (no TypeScript) |
| Styling | Tailwind CSS |
| Search | Custom keyword engine (vanilla JS) |
| Data | Local `.txt` file, parsed at startup |
| IPC | Electron `ipcMain` / `ipcRenderer` |

---

## How It Works

```
Student types a question
        ↓
Query is tokenised (lowercased, stop words removed)
        ↓
Each FAQ entry is scored by keyword overlap
        ↓
Top-scoring entry is returned
        ↓
If score > 0 → show answer (verbatim from FAQ)
If score = 0 → show NUST contact details
```

### FAQ Parser (`lib/parser.js`)

Reads `NUST_FAQs_Complete.txt` at startup and extracts all Q&A pairs from four sections:
- General FAQs
- UG Admissions FAQs
- BSHND Admissions FAQs
- MBBS Admissions FAQs

Duplicate entries across sections are deduplicated. The result is an in-memory array of `{ question, answer }` objects.

### Search Engine (`lib/search.js`)

1. Tokenises the student's query
2. Removes stop words: `a, an, the, is, are, can, i, my, for, of, in, to, do, be, have, will, what, how, when, where, who, which, does, if`
3. Scores every FAQ entry by counting matching tokens in the question text
4. Returns the highest-scoring entry, or `null` if nothing matches

No external libraries. No ML. No embeddings. Just string matching that runs in microseconds.

---

## Project Structure

```
nust-admit/
├── electron/
│   ├── main.js          # Electron main process, IPC, file reading
│   └── preload.js       # Exposes window.nustFAQ.getData() to renderer
├── app/
│   ├── layout.jsx       # Root layout, theme provider
│   └── page.jsx         # Main chat interface
├── lib/
│   ├── parser.js        # FAQ file parser
│   └── search.js        # Keyword search engine
├── NUST_FAQs_Complete.txt   # Source of truth — official NUST FAQ data
├── next.config.js
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/your-username/nust-admit.git
cd nust-admit
npm install
```

### Running in Development

```bash
npm run dev
```

### Building for Production

```bash
npm run build
npm run electron:build
```

The output will be a platform-specific installer in the `dist/` folder.

### Note on the FAQ File

`NUST_FAQs_Complete.txt` must be present in the root directory. This file contains the parsed content of the official NUST FAQ page and ships with the application. It is the only data source the app uses.

---

## Constraints Met

| Requirement | Status |
|---|---|
| Memory ceiling: 8GB RAM | ✅ No model loaded — negligible RAM usage |
| CPU: Core i5 13th Gen or less | ✅ Sub-50ms search, no compute-heavy inference |
| No dedicated GPU | ✅ No GPU usage whatsoever |
| Fully offline | ✅ Zero network calls after `npm install` |
| No cloud fallback | ✅ No fetch(), no API keys, no external services |

---

## Judging Criteria

**Reliable** — Answers come verbatim from the official FAQ. There is no generation step where errors can be introduced. The system either finds a match or admits it doesn't know.

**Graceful** — Responses are instant on any hardware. There is no inference latency to excuse or design around. The interface is intentionally simple to reduce cognitive load.

**Explainable** — Every answer shows the matched FAQ question above it in muted text, so students always know what the system understood. The fallback message is explicit and actionable.

---

## Limitations

- Search is keyword-based, not semantic. A question phrased very differently from the FAQ wording may not match well.
- The FAQ data reflects the NUST website at time of scraping. For time-sensitive information (deadlines, fee amounts), students should verify at [nust.edu.pk](https://nust.edu.pk).
- The app does not have access to live merit lists, portal data, or individual application status.

---

## Contact

For admissions queries the app cannot answer:

- **Phone:** +92-51-90856878
- **Email:** admissions@nust.edu.pk
- **Website:** [nust.edu.pk/admissions](https://nust.edu.pk/admissions)

---

## License

MIT

---

*Built for the NUST AI Challenge — directed by Dr. Sohail Iqbal.*