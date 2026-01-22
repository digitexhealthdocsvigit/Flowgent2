# 🧠 Flowgent Agent Zero
Autonomous AI background agent for the Flowgent2 ecosystem.

## Primary Functions
• **Lead Polling**: Continuously monitors Supabase `leads` table for unenriched entries.
• **Web Scraping**: Uses Scrapingdog to extract digital footprints and contact info.
• **Neural Scoring**: Leverages Gemini 3 Flash to calculate sales readiness scores.
• **Persistence**: Updates the central database with enriched data.
• **Orchestration**: Dispatches high-priority signals to n8n for automated outreach.

## Deployment Instructions
1. **Repository**: Push this codebase to `digitexhealthdocsvigit/flowgent-agentzero`.
2. **Platform**: Connect to Railway, Render, or any Docker-capable host.
3. **Environment**: Configure variables as seen in `.env.example`. 
   * Note: Use `API_KEY` for Gemini access.
4. **Build**: The included `Dockerfile` handles the environment setup.

## Technical Specs
- **Runtime**: Node.js 18 (Alpine)
- **Framework**: Supabase JS + Google GenAI SDK
- **Architecture**: Event-loop polling with deterministic enrichment logic.
