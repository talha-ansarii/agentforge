# 🔮 AgentForge

**AI Agent Discovery Platform for Thinkly Labs**

AgentForge helps teams find, match, and configure purpose-built AI agents for sales, marketing, HR, support, and more. Describe your operational bottleneck, get matched with the right agent in seconds.

---

## ✨ Features

- **Conversational Discovery** — Chat with an AI-powered assistant that understands your team's challenges and recommends the right Thinkly Labs agent
- **Intelligent Routing** — LangGraph pipeline classifies intent, queries a product database, and generates contextual responses with citations
- **Real-time Streaming** — Server-Sent Events for instant, token-by-token response streaming
- **Persistent Chat Threads** — Conversations are saved and resumable across sessions
- **Dark Mode** — Polished deep-teal dark theme that complements the light emerald aesthetic
- **Responsive Design** — Mobile-first with adaptive layouts

## 🏗️ Architecture

```
┌─────────────────────┐     SSE Stream      ┌──────────────────────┐
│                     │ ◄──────────────────► │                      │
│   Next.js Frontend  │                      │   FastAPI Backend     │
│   (agent-forge/)    │     POST /api/chat   │   (backend/)          │
│                     │ ────────────────────►│                      │
│  • React + Tailwind │                      │  • LangGraph Pipeline │
│  • NextAuth (Google)│                      │  • Gemini Flash LLM   │
│  • Prisma ORM       │                      │  • PostgreSQL (pgvec) │
│  • Zustand Store    │                      │  • Intent Classifier  │
└─────────────────────┘                      └──────────────────────┘
```

## 📁 Project Structure

```
agentforge/
├── agent-forge/          # Next.js frontend
│   ├── src/
│   │   ├── app/          # Pages (landing, chat)
│   │   ├── components/   # UI components (sidebar, chat-area, chat-input)
│   │   ├── hooks/        # Custom hooks (SSE streaming)
│   │   ├── stores/       # Zustand state management
│   │   ├── server/       # Auth config, DB client
│   │   └── styles/       # Global CSS, design tokens
│   └── prisma/           # Database schema
│
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── agent/        # LangGraph pipeline (graph, nodes, state, prompts)
│   │   ├── api/          # API endpoints (chat SSE)
│   │   └── db/           # PostgreSQL connection, schema, seed data
│   └── scripts/          # Scraping & testing utilities
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **Python** 3.11+
- **PostgreSQL** 15+
- **pnpm** (for frontend)

### 1. Clone the repo

```bash
git clone https://github.com/talha-ansarii/agentforge.git
cd agentforge
```

### 2. Frontend Setup

```bash
cd agent-forge
pnpm install

# Create .env from example
cp .env.example .env
```

Configure `.env` with your credentials:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/agent-forge"
AUTH_SECRET="your-auth-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

Push the database schema and start the dev server:

```bash
pnpm db:push
pnpm dev
```

### 3. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env
echo 'GEMINI_API_KEY="your-gemini-api-key"' > .env
echo 'DATABASE_URL="postgresql://postgres:password@localhost:5432/agent-forge"' >> .env
```

Seed the database and start the server:

```bash
python app/db/seed.py
uvicorn app.main:app --reload
```

### 4. Open the app

Visit [http://localhost:3000](http://localhost:3000) — sign in with Google and start chatting!

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS v4, TypeScript |
| **Auth** | NextAuth.js (Google OAuth) |
| **Database** | PostgreSQL + Prisma ORM |
| **State** | Zustand |
| **Backend** | FastAPI, Python 3.11+ |
| **AI Pipeline** | LangGraph, Gemini Flash |
| **Streaming** | Server-Sent Events (SSE) |


