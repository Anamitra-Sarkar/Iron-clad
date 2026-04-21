<div align="center">
<img width="1200" height="475" alt="Ironclad Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Ironclad
### The AI that argues against your ideas — not with you.

*A behavioral epistemics platform for stress-testing arguments using multi-agent LLM reasoning*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-ironclad--gray.vercel.app-4a7c59?style=flat-square)](https://ironclad-gray.vercel.app/)
[![Built with Groq](https://img.shields.io/badge/Inference-Groq-f55036?style=flat-square)](https://groq.com)
[![React](https://img.shields.io/badge/React-TypeScript-61dafb?style=flat-square)](https://react.dev)
[![MIT License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](./LICENSE)

</div>

---

## What It Does

Ironclad stress-tests your ideas by running them through three adversarial AI agents simultaneously — a Devil's Advocate, a Critical Judge, and an Idea Strengthener. Unlike general-purpose AI assistants (Gemini, ChatGPT), Ironclad is designed to push back, not agree. It teaches you to think harder about what you're actually claiming — not just validate what you already believe.

---

## Research-Grade Features

### 🔍 Argument Linter
Detects logical fallacies in the *structure* of your own argument before the agents even fire. After 1200ms of typing inactivity, a silent Groq call analyzes your input for survivorship bias, loaded language, false universalization, sunk cost framing, appeal to anecdote, and more. Results render as inline annotation chips directly below the textarea with staggered animations. Fails silently — never blocks the main flow.

### ⚠️ Adversarial Framing Inversion
Automatically generates optimistic and pessimistic reframes of your idea, runs each through the Judge independently, and surfaces verdict divergence in a 3-column comparison grid. Exposes when a verdict is an artifact of *how you worded* an idea — not what it actually contains. Directly addresses LLM framing bias documented in [ACL 2025](https://aclanthology.org/2025.nlp4dh-1.50/) and [ACM 2026](https://dl.acm.org/doi/10.1145/3786304.3787879).

### 🧠 Epistemic Friction Score
Silently tracks behavioral engagement signals across the session — card expansion rate, rebuttal submissions, idea refinement patterns (computed via LCS similarity ratio), and post-result read time — to compute a live weighted engagement score displayed as a subtle pill badge. Implements the "scaffolded friction" concept from [*Defending Epistemic Sovereignty via Scaffolded AI Friction* (arXiv, April 2026)](https://arxiv.org/html/2603.21735v2).

### 📊 Blind Spot Report
Unlocks after 3+ stress tests. Packages your full session history — every idea, verdict, and TO FIX statement — into a single batch call to `llama-3.3-70b-versatile` under a Cognitive Pattern Analyst persona. Returns a structured breakdown of your recurring reasoning weaknesses rendered in an immersive full-viewport modal.

### 🧬 Cognitive DNA Tags
Every verdict is asynchronously classified into one of 9 cognitive archetypes — Overconfidence Trap, Fear-Based Decision, Sunk Cost Fallacy, Timing Problem, Resource Gap, Execution Risk, Strong Foundation, Emotional Reasoning, Analysis Paralysis — and persisted in session history alongside each entry.

### ↩ Devil's Advocate Rebuttal
After agents return results, a "Rebut This Attack" toggle expands below the Devil's Advocate card. Your rebuttal is sent with the original idea and devil's attack to a debate judge LLM that returns a verdict: `DEFENDED`, `PARTIALLY DEFENDED`, or `ATTACK STANDS` — rendered as an inline animated badge.

### 🛡️ Prompt-Guard Safety Layer
Intercepts crisis-language inputs *before* agent execution using `llama-guard-3-8b`. If triggered, execution halts and a full-screen card renders helpline resources (India — iCall: 9152987821 · Vandrevala Foundation: 1860-2662-345, available 24/7) with a graceful "Continue anyway →" bypass.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Inference | Groq API — `llama-3.1-8b-instant`, `llama-3.3-70b-versatile`, `llama-4-scout-17b-16e-instruct`, `llama-guard-3-8b` |
| Styling | CSS custom properties, Cabinet Grotesk, Satoshi |
| Deployment | Vercel |

---

## Running Locally

**Prerequisites:** Node.js 18+, pnpm

```bash
git clone https://github.com/Anamitra-Sarkar/Ironclad
cd Ironclad
pnpm install
cp .env.example .env.local
# Add your VITE_GROQ_API_KEY to .env.local
pnpm dev
```

---

## Architecture

```
src/
├── useGroq.ts                # Core 3-agent parallel inference engine
├── useArgumentLinter.ts      # Debounced reasoning flaw detector
├── useFramingSensitivity.ts  # Adversarial reframe + verdict comparison
├── useEpistemicFriction.ts   # Behavioral engagement tracker
├── prompts.ts                # All system prompts
└── components/               # UI layer
```

---

## Research Context

Ironclad is a practical implementation of several open problems in applied NLP and cognitive epistemics research:

- **Framing-induced verdict shift** in LLM evaluators — [ACM 2026](https://dl.acm.org/doi/10.1145/3786304.3787879)
- **Cognitive bias detection in LLM-assisted reasoning** — [ICSE 2026](https://conf.researchr.org/details/icse-2026/icse-2026-research-track/63/Cognitive-Biases-in-LLM-Assisted-Software-Development)
- **Scaffolded AI friction for epistemic sovereignty** — [arXiv April 2026](https://arxiv.org/html/2603.21735v2)
- **Behavioral epistemics measurement** via real-time engagement signals

---

*Built in one session. Anamitra Sarkar — 3rd year AIML, RCCIIT, MAKAUT.*
