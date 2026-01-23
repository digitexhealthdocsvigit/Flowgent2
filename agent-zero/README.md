# 🧠 Flowgent Agent Zero

Autonomous AI background agent for the Flowgent2 ecosystem.

## Primary Repository
`digitexhealthdocsvigit/Flowgent2`

## Core Capabilities
- **Lead Discovery**: Automatically pulls new lead nodes from Supabase.  
- **Contact Enrichment**: Extracts digital footprints (emails/phones) via Scrapingdog.  
- **Neural Scoring**: Uses Gemini 3 Flash to determine sales readiness and infrastructure gaps.  
- **Signal Orchestration**: Triggers n8n workflows for automated outreach and Telegram alerts.

## Deployment to Railway

1. **Create New Project**: Select the `Flowgent2` GitHub repository.
2. **Set Root Directory**: Choose `/agent-zero`.
3. **Environment Variables**: Add all keys from `.env.example`.
4. **Deploy**: Railway will auto-detect the Dockerfile and start polling JSK8SNXZ.

---
Built with ⚡ by Digitex Studio