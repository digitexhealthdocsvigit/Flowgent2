# 🧠 Flowgent Agent Zero
Autonomous AI background agent for the Flowgent2 ecosystem.

## Primary Repository
`digitexhealthdocsvigit/flowgent-agentzero`

## Core Capabilities
• **Lead Discovery**: Automatically pulls new lead nodes from Supabase.  
• **Contact Enrichment**: Extracts digital footprints (emails/phones) via Scrapingdog.  
• **Neural Scoring**: Uses Gemini 3 Flash to determine sales readiness and infrastructure gaps.  
• **Signal Orchestration**: Triggers n8n workflows for automated outreach.

## Deployment
1. Connect this repository to your hosting provider (Railway, Render, etc.).
2. Set the environment variables as specified in `.env.example`.
3. The `Dockerfile` handles the containerized background runtime.

## Environment Variables
- `SUPABASE_URL`: Your project URL.
- `SUPABASE_SERVICE_KEY`: Service role key for database updates.
- `API_KEY`: Your Gemini API Key.
- `SCRAPINGDOG_API_KEY`: For contact extraction.
- `N8N_WEBHOOK_URL`: Your n8n orchestrator endpoint.

---
Built with ⚡ by Digitex Studio