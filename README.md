# MailPilot — AI-Powered Email Management Platform for Personal Assistants

MailPilot is an enterprise-grade AI-powered email management SaaS platform designed specifically for **Personal Assistants (PAs)** who manage email communication on behalf of their executive clients.

---

## 🌟 Core Product Principles

1. **AI Recommends**: Ingests incoming conversations, classifies responsibility (`ASSISTANT_TO_REPLY`, `CLIENT_TO_REPLY`, `NO_REPLY_NEEDED`, `NEEDS_REVIEW`), generates executive summaries, extracts key dates/deadlines, and drafts replies.
2. **PA Manages**: Reviews AI triage, handles routine scheduling/logistics, overrides classifications when needed, and drafts replies with human-in-the-loop validation.
3. **Client Decides**: Minimalist attention portal showing only decisions requiring direct authority (financial approvals, contract signatures, sensitive opinions). One-click delegation or completion.
4. **Safety First**: AI _never_ auto-sends emails. PAs review and approve all outbound drafts.

---

## 🚀 Live Services

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Database**: MongoDB (`mongodb://localhost:27017/mailpilot`)

---

## 🔑 Demo Credentials

Both accounts belong to the pre-seeded workspace **Aditya's Workspace** (Team Code: `MAIL-8X92K`).

| Role                   | Email                | Password      | Experience                                                                                 |
| :--------------------- | :------------------- | :------------ | :----------------------------------------------------------------------------------------- |
| **Personal Assistant** | `assistant@demo.com` | `password123` | Full dashboard, multi-segment inbox, Gemini reanalysis, manual overrides, AI Copilot chat  |
| **Executive Client**   | `client@demo.com`    | `password123` | Clean attention portal, AI summaries, "Ask My Assistant to Handle This", "Mark as Handled" |

---

## 🛠️ Architecture & Technology Stack

- **Frontend**: Vite + React, Tailwind CSS, Lucide React, Framer Motion, React Hot Toast, React Router DOM v6.
  _(Structure uses `client/app/` directly without `src`)._
- **Backend**: Node.js, Express.js (ES Modules), MongoDB with Mongoose, JWT Authentication, bcryptjs.
- **AI Integration**: Google Gemini API (`gemini-1.5-flash`) with structured JSON schema enforcement and heuristic fallback.
- **Security**: Workspace isolation via `teamId`, client-specific conversation boundaries, verified membership statuses, and authorization middleware.

---

## 📂 Key Endpoints

- `POST /api/auth/register` — Workspace creation / code joining
- `POST /api/auth/login` — Authentication & JWT generation
- `GET /api/dashboard/assistant` — Aggregated metrics, priorities & calendar items
- `GET /api/dashboard/client` — Client attention queue & handled counts
- `GET /api/conversations` — Filtered, searchable multi-segment inbox
- `POST /api/ai/classify/:id` — Reanalyze thread with Google Gemini API
- `POST /api/ai/draft-reply/:id` — Generate custom reply draft via Gemini
- `POST /api/ai/chat` — Conversational Copilot querying team emails
- `POST /api/client/handover/:id` — Client handover to PA with audit trail
- `POST /api/client/handle/:id` — Client mark as resolved

---

## 💻 Running Locally

### Backend

```bash
cd server
npm install
npm run seed     # Seeds 18 realistic conversations & demo accounts
npm start        # Runs on port 5000
```

### Frontend

```bash
cd client
npm install
npm run dev      # Runs on port 3000
```
