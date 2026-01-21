
# 📡 n8n Orchestrator Technical Specification

**Project:** Flowgent2 Neural Sync
**Signal Source:** `https://flowgent2.vercel.app/`
**Payload Version:** v1.2 (MCP Compliant)

---

## 🏁 Workflow 1: Lead Provisioning (High Priority)

**Trigger:** Webhook (POST)
**Path:** `/flowgent-orchestrator`

### 1. Data Reception
The orchestrator receives a `Lead` object from Flowgent2.
```json
{
  "event": "lead_captured",
  "payload": {
    "id": "uuid",
    "business_name": "Example Corp",
    "readiness_score": 92,
    "phone": "+91...",
    "category": "Real Estate"
  }
}
```

### 2. Logic Gate (Filter)
- **Condition:** `{{ $json.payload.readiness_score }} > 80`
- **Goal:** Ensure only high-intent, high-impact leads consume outbound API credits.

### 3. Agentic Outreach (Gemini Node)
- **Prompt:** "Generate a professional outreach message for {{ $json.payload.business_name }}. Highlight that we've detected infrastructure gaps in their {{ $json.payload.category }} operations in {{ $json.payload.city }}."

### 4. Dispatch (WhatsApp/Email)
- **Node:** WhatsApp Business or Twilio.
- **Target:** `{{ $json.payload.phone }}`

### 5. State Persistence (Supabase Node)
- **Action:** Update `leads` table.
- **Set:** `lead_status = 'Contacted'`, `sync_timestamp = NOW()`

---

## 🛠️ Security & Maintenance

- **CORS:** Ensure n8n allows requests from `flowgent2.vercel.app`.
- **Retries:** Enable "On Fail: Retry" with exponential backoff for the Supabase node.
- **Logs:** Pipe all workflow errors back to Flowgent2 via a POST to `/api/logs` (to be implemented).
