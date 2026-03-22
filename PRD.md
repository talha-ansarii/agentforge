# AgentForge — Product Requirements Document

**An AI Agent Discovery & Configuration Chatbot for Thinkly Labs**

---

## 1. Overview

AgentForge is a conversational AI assistant trained exclusively on Thinkly Labs' publicly available product suite, solutions, and documentation. Users describe their operational pain points in natural language, and AgentForge recommends the best-fit Thinkly Labs agent — complete with source citations, capability breakdowns, ROI indicators, and direct links to the relevant documentation pages.

### Why This Exists

Thinkly Labs builds production-ready AI agents for enterprise teams. But enterprise buyers often don't know which agent solves their problem. AgentForge bridges that gap — acting as a 24/7 intelligent sales engineer that understands every product deeply.

> **Scope Constraint:** AgentForge will **only** answer queries related to Thinkly Labs. Any off-topic question will be politely declined with a redirect back to the Thinkly Labs domain.

---

## 2. Target Users

| Persona | Description | Key Need |
|---|---|---|
| Operations Manager | Runs back-office teams, buried in manual work | "Which agent saves my team the most time?" |
| Startup Founder | Needs AI for content, outreach, or investor comms | "What products can I use today?" |
| CTO / Tech Lead | Evaluating AI vendors, cares about integration | "How does this fit our stack?" |
| Curious Visitor | Landed on the site, exploring | "What does Thinkly Labs actually do?" |

---

## 3. Knowledge Base — Structured SQL Database

All Thinkly Labs product data is stored in a **PostgreSQL relational database**. The LLM generates SQL queries to retrieve relevant data. This approach makes it trivial to add, update, or remove products in the future — just insert/update a row.

### 3.1 Data Sources (Scraped & Structured)

Content is scraped from the following pages and normalized into SQL tables:

| Source URL | Maps To Table |
|---|---|
| `/` (Homepage) | `company_info` — overview, approach, founders, FAQ, testimonials |
| `/custom-agents` | `solutions` — Reasoning & Operational agent types, categories |
| `/knowledge-systems` | `solutions` — Knowledge Bases, Knowledge Graphs, capabilities |
| `/ai-products` | `products` — Authr-AI, Mailen |
| `/ai-sdr` | `agents` + `agent_capabilities` + `agent_faqs` |
| `/ai-multiplatform-content` | `agents` + `agent_capabilities` + `agent_faqs` |
| `/ai-chief-of-staff` | `agents` + `agent_capabilities` + `agent_faqs` |
| `/ai-reporting` | `agents` + `agent_capabilities` + `agent_faqs` |
| `/ai-support` | `agents` + `agent_capabilities` + `agent_faqs` |
| `/ai-hr` | `agents` + `agent_capabilities` + `agent_faqs` |
| `/ai-competitor-analyst` | `agents` + `agent_capabilities` + `agent_faqs` |

### 3.2 SQL Table Design

```sql
-- Core agent information
CREATE TABLE agents (
  id            SERIAL PRIMARY KEY,
  slug          VARCHAR(100) UNIQUE NOT NULL,  -- e.g. 'ai-sdr'
  name          VARCHAR(200) NOT NULL,          -- e.g. 'AI SDR'
  tagline       TEXT,                            -- e.g. 'Your AI SDR that researches...'
  description   TEXT,                            -- Full description
  page_url      VARCHAR(500),                    -- e.g. '/ai-sdr'
  category      VARCHAR(100),                    -- 'pre-built' | 'custom'
  roi_estimate  VARCHAR(200),                    -- e.g. 'Saves 15-20 hrs/week'
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Agent capabilities (one-to-many)
CREATE TABLE agent_capabilities (
  id        SERIAL PRIMARY KEY,
  agent_id  INTEGER REFERENCES agents(id),
  title     VARCHAR(200) NOT NULL,
  description TEXT
);

-- Agent FAQs (one-to-many)
CREATE TABLE agent_faqs (
  id        SERIAL PRIMARY KEY,
  agent_id  INTEGER REFERENCES agents(id),
  question  TEXT NOT NULL,
  answer    TEXT NOT NULL
);

-- Solutions (Custom Agents, Knowledge Systems)
CREATE TABLE solutions (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  name        VARCHAR(200) NOT NULL,
  description TEXT,
  page_url    VARCHAR(500),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Products (Authr-AI, Mailen)
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(100) UNIQUE NOT NULL,
  name        VARCHAR(200) NOT NULL,
  tagline     TEXT,
  description TEXT,
  features    TEXT,
  page_url    VARCHAR(500),
  external_url VARCHAR(500),
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Company information
CREATE TABLE company_info (
  id       SERIAL PRIMARY KEY,
  key      VARCHAR(100) UNIQUE NOT NULL,  -- 'overview', 'approach', 'founders', etc.
  value    TEXT NOT NULL
);
```

---

## 4. Core Features

### 4.1 SQL-Powered Conversational AI (Text-to-SQL)

- **Knowledge Base:** All Thinkly Labs data stored in structured PostgreSQL tables.
- **Text-to-SQL:** On each user message, the LLM generates a SQL query to fetch relevant data from the database.
- **Grounded Responses:** Every recommendation is backed by real database records with source page URLs.
- **LLM:** Google Gemini 2.0 Flash via LangChain.
- **Scope Guard:** The agent will **only** respond to Thinkly Labs-related queries. Off-topic queries receive a polite decline.
- **Easy Updates:** New agents/products can be added by simply inserting rows into the database — no re-embedding needed.

### 4.2 Persona-Driven Qualification Flow

The bot doesn't just answer — it asks smart follow-up questions to narrow down recommendations based on the user's persona:

```
User: "I need help with sales"
Bot:  "I can help! A few quick questions:
       1. Are you looking to automate outbound prospecting, or improve reply rates?
       2. What's your current team size?
       3. Are you using any CRM tools today?"
```

### 4.3 Structured Response Components

Responses are not plain text. The bot renders rich UI components:

| Component | When It Appears |
|---|---|
| Agent Card | When recommending a specific agent (icon, name, tagline, key capabilities, CTA) |
| Comparison Table | When user asks to compare two or more agents |
| Capability List | When explaining what an agent can do |
| Source Citation | Inline expandable quote from the knowledge base with a link to the documentation page |
| Follow-up Chips | Suggested next questions (e.g., "How long to deploy?", "What's the pricing?") |
| ROI Indicator | Quick estimate like "Typically saves 15-20 hrs/week" based on knowledge base data |
| Documentation Link | Direct link to the relevant Thinkly Labs page (e.g., `thinklylabs.com/ai-sdr`) |

### 4.4 Next Steps Suggestions

After recommending an agent, the bot always suggests concrete next steps:
1. Link to the relevant documentation page.
2. A "Book a Demo" CTA linking to `cal.com/sachi-gupta-12svmo/30min`.
3. Follow-up questions to explore related agents.

### 4.5 Streaming Responses

All responses are streamed token-by-token to the frontend for a real-time, conversational feel.

### 4.6 State Management & UX Polish

| State | Experience |
|---|---|
| Empty / Landing | Hero section with Thinkly Labs branding, tagline ("Find the right AI agent for your team"), and 4-5 conversation starter chips |
| Loading | Token-by-token streaming with a subtle typing indicator |
| Error | Graceful fallback: "I'm having trouble connecting. Try again, or book a demo directly" |
| Conversation | Messages with smooth scroll, auto-resize input, markdown rendering |

### 4.7 Sidebar — Chat Threads

A collapsible sidebar displaying the user's conversation history:

- **New Chat** button at the top to start a fresh conversation
- List of previous chat threads, ordered by most recent
- Each thread shows a truncated title (auto-generated from the first user message)
- Clicking a thread loads its full conversation history
- Delete button on hover to remove a thread
- Sidebar collapses to a hamburger menu on mobile

---

## 5. Technical Architecture

### 5.1 System Overview

```
┌─────────────────┐     ┌──────────────────────────┐
│   Next.js App   │────▶│  Python FastAPI Backend   │
│   (Frontend)    │◀────│  (LangChain + LangGraph)  │
└────────┬────────┘     └────────────┬─────────────┘
         │                           │
         ▼                           ▼
  ┌──────────────────────────────────────────┐
  │           PostgreSQL (Neon)              │
  │  ┌────────────┐    ┌─────────────────┐   │
  │  │ App Tables │    │ Knowledge Tables│   │
  │  │ User, Chat │    │ agents, products│   │
  │  │ Message    │    │ capabilities    │   │
  │  └────────────┘    └─────────────────┘   │
  └──────────────────────────────────────────┘
```

### 5.2 Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| Frontend | Next.js 15 (App Router) | SSR, API routes, seamless Vercel deploy |
| UI Components | shadcn/ui + TailwindCSS | Premium components, consistent design system |
| Authentication | Auth.js (NextAuth v5) | Google/GitHub OAuth, session management |
| Database | PostgreSQL (Neon) + Prisma ORM | Unified DB for app data + knowledge base. Neon = serverless, free tier. |
| Backend API | Python FastAPI | High-performance async API for the agent pipeline |
| Agent Framework | LangChain + LangGraph (Python) | StateGraph workflow, Text-to-SQL, tool calling |
| LLM | Google Gemini 2.0 Flash | Fast, capable, cost-effective |
| Deployment | Vercel (Frontend) + Railway/Render (Backend) | As required by assignment |

### 5.3 Text-to-SQL Pipeline (LangGraph StateGraph)

```
User Message → LangGraph StateGraph:
  1. classifyIntent      → Is this a Thinkly Labs query? If not, decline.
  2. generateSQL         → Gemini generates a SQL query from the user's question
  3. executeQuery        → Run the SQL query against PostgreSQL
  4. validateResults     → Check if results are relevant and non-empty
  5. generate            → Gemini + query results → structured response
→ Stream tokens to Frontend via SSE
```

- **Orchestration:** LangGraph StateGraph with conditional edges
- **SQL Generation:** LLM receives the DB schema + user question → produces a safe SELECT query
- **Safety:** Only SELECT queries are allowed; parameterized queries to prevent injection
- **Fallback:** If no results found, the bot asks clarifying questions or suggests related topics
- **Easy extensibility:** Add a new agent by inserting rows — no re-deployment needed

### 5.4 Project Structure

```
agentforge/
├── frontend/                        # Next.js App
│   ├── app/
│   │   ├── layout.tsx               # Root layout, fonts, metadata
│   │   ├── page.tsx                 # Landing / Chat page
│   │   ├── globals.css              # TailwindCSS base + shadcn theme
│   │   ├── api/
│   │   │   └── auth/[...nextauth]/
│   │   │       └── route.ts         # Auth.js route handler
│   │   └── chat/
│   │       └── page.tsx             # Protected chat page
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── chat-window.tsx          # Main chat container
│   │   ├── message-bubble.tsx       # Individual message rendering
│   │   ├── agent-card.tsx           # Rich agent recommendation card
│   │   ├── comparison-table.tsx     # Agent comparison component
│   │   ├── source-citation.tsx      # Expandable source quote
│   │   ├── follow-up-chips.tsx      # Suggested follow-up questions
│   │   ├── app-sidebar.tsx          # Sidebar with chat threads
│   │   ├── empty-state.tsx          # Landing / empty chat state
│   │   ├── loading-indicator.tsx    # Streaming typing indicator
│   │   └── theme-toggle.tsx         # Dark / Light mode toggle
│   ├── lib/
│   │   ├── auth.ts                  # Auth.js configuration
│   │   ├── prisma.ts                # Prisma client singleton
│   │   └── utils.ts                 # shadcn cn() utility
│   ├── prisma/
│   │   └── schema.prisma            # PostgreSQL schema (User, Chat, Message)
│   ├── components.json              # shadcn/ui configuration
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                         # Python FastAPI
│   ├── app/
│   │   ├── main.py                  # FastAPI app entry point
│   │   ├── api/
│   │   │   └── chat.py              # SSE streaming chat endpoint
│   │   ├── agent/
│   │   │   ├── graph.py             # LangGraph StateGraph definition
│   │   │   ├── nodes.py             # Graph nodes (classify, generateSQL, execute, validate, generate)
│   │   │   ├── state.py             # Graph state definition
│   │   │   └── prompts.py           # System prompts & SQL generation prompts
│   │   ├── db/
│   │   │   ├── connection.py        # PostgreSQL connection (asyncpg / SQLAlchemy)
│   │   │   ├── schema.sql           # Knowledge base table definitions
│   │   │   └── seed.py              # Seed script to populate knowledge base
│   │   └── config.py                # Environment variables
│   ├── requirements.txt
│   └── Dockerfile
│
└── README.md
```

---

## 6. Database Schema (Prisma + PostgreSQL)

A single PostgreSQL database (Neon serverless) holds both **app data** (users, chats) and **knowledge base** tables (agents, products).

### 6.1 App Tables (Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  image         String?
  accounts      Account[]
  sessions      Session[]
  chats         Chat[]
  createdAt     DateTime  @default(now())
}

model Chat {
  id        String    @id @default(cuid())
  title     String?
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  messages  Message[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Message {
  id        String   @id @default(cuid())
  role      String   // "user" | "assistant"
  content   String
  sources   Json?    // Array of source citations
  chatId    String
  chat      Chat     @relation(fields: [chatId], references: [id])
  createdAt DateTime @default(now())
}
```

### 6.2 Knowledge Base Tables (Raw SQL — managed by backend seed script)

See Section 3.2 for the full SQL schema (`agents`, `agent_capabilities`, `agent_faqs`, `solutions`, `products`, `company_info`).

---

## 7. UI / UX Design

### 7.1 Design Language

| Element | Spec |
|---|---|
| Theme | Dark & Light mode with toggle (Teal accent in both) |
| Primary Color | Thinkly Labs Teal `#1DAFC6` |
| Dark Background | Deep Slate `#0D1717` with subtle radial gradients |
| Light Background | Crisp White `#FAFAFA` with soft shadows |
| Cards | Liquid Glassmorphism — translucent backgrounds, blur, subtle borders |
| Buttons | Tactile Maximalism — "squishy" hover/press effects, glossy 3D textures |
| Typography | Plus Jakarta Sans (headings) + Inter (body) from Google Fonts |
| Animations | Smooth message appearance (fade + slide up), hover glow effects, typing pulse |
| Responsive | Mobile-first, sidebar collapses to hamburger on small screens |

### 7.2 Screen Flow

```
Landing Page (Empty State)
  ├── User types or clicks starter chip
  │     └── Chat Active (messages stream in)
  │           ├── Rich Response with Agent Cards
  │           ├── User clicks follow-up chip → new message
  │           └── User clicks agent in sidebar → pre-filled question
  └── Error State with Fallback (retry + book demo link)
```

### 7.3 Landing Page (Empty State)

```
┌─────────────────────────────────────────────────┐
│  [Sidebar]  │                                   │
│             │     🤖 AgentForge                  │
│  + New Chat │                                   │
│  ─────────  │     Find the right AI agent        │
│  Chat: How  │     for your team                  │
│  to auto... │                                   │
│  Chat: Tell │     ┌─────────────────────────┐    │
│  me about.. │     │ "I spend too much time  │    │
│             │     │  on manual reporting"   │    │
│             │     └─────────────────────────┘    │
│             │     ┌─────────────────────────┐    │
│             │     │ "Help me automate       │    │
│             │     │  sales outreach"        │    │
│             │     └─────────────────────────┘    │
│             │     ┌─────────────────────────┐    │
│             │     │ "What agents do you     │    │
│             │     │  offer?"                │    │
│             │     └─────────────────────────┘    │
│             │                                   │
│             │  ┌──────────────────────────────┐  │
│             │  │ Ask me anything...   🎤  ↑  │  │
│             │  └──────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## 8. Conversation Examples

### Example 1: Pain-Point Based Discovery

```
User: "My sales team is spending hours writing cold emails and barely getting replies"

AgentForge: Based on what you've described, I'd recommend the **AI SDR** agent.

[Agent Card: AI SDR]
  → Automate outbound prospecting and improve reply rates
  → Key capabilities: Personalized email generation, Follow-up sequencing, CRM integration
  → ROI: "Saves 15-20 hrs/week"

📎 Learn more: thinklylabs.com/ai-sdr

Would you like to:
  [How long does deployment take?]  [Compare with other agents]  [Book a demo]
```

### Example 2: Off-Topic Query

```
User: "What's the weather like today?"

AgentForge: I'm specifically trained to help you discover and evaluate
Thinkly Labs' AI agents and solutions. I can't help with weather,
but I'd love to help you find the right AI agent for your team!

Try asking me:
  [What agents do you offer?]  [I need help with sales outreach]
```

### Example 3: Comparison Request

```
User: "What's the difference between Custom Agents and the pre-built ones?"

AgentForge:
| | Custom Agents | Pre-Built Agents |
|---|---|---|
| Timeline | Weeks | Days |
| Customization | Fully tailored | Customizable templates |
| Best for | Unique workflows | Common back-office tasks |
| Examples | Research, monitoring | SDR, HR, Support |

📎 Source: thinklylabs.com/custom-agents
```

---

## 9. API Endpoints

### 9.1 Backend (FastAPI)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/chat` | Send a message and receive SSE streaming response |
| `GET` | `/api/health` | Health check |

### 9.2 Frontend (Next.js API Routes)

| Method | Endpoint | Description |
|---|---|---|
| `GET/POST` | `/api/auth/[...nextauth]` | Auth.js authentication routes |
| `GET` | `/api/chats` | List user's chat sessions |
| `POST` | `/api/chats` | Create a new chat session |
| `GET` | `/api/chats/[id]/messages` | Get messages for a chat |
| `POST` | `/api/chats/[id]/messages` | Save a message to a chat |

---

## 10. What Makes This Stand Out

| Aspect | How It Differentiates |
|---|---|
| Not a GPT wrapper | Text-to-SQL pipeline with real structured knowledge base, citation grounding |
| Domain-aligned | Built specifically for Thinkly Labs' product suite — shows research & product thinking |
| Scope-guarded | Only answers Thinkly Labs queries — no hallucinated off-topic responses |
| Rich UI components | Agent cards, comparison tables, follow-up chips — not just text bubbles |
| Conversational UX | Persona-driven qualification flow, smart follow-ups, context-aware responses |
| Production polish | Streaming, error handling, dark/light themes, responsive design, authentication |
| Easily extensible | Add new agents/products by inserting database rows — no re-embedding or re-deployment |
| Technical depth | Text-to-SQL, LangGraph orchestration, streaming SSE, PostgreSQL, Prisma |

---

## 11. Success Metrics

- Bot correctly recommends the right agent for a given pain point >90% of the time
- Responses always cite relevant source material with documentation links
- Off-topic queries are gracefully declined 100% of the time
- Streaming latency < 500ms to first token
- Fully responsive on mobile and desktop
- Lighthouse performance score > 85

---

## 12. Timeline (March 21-22)

| Phase | Duration | Deliverable |
|---|---|---|
| PRD & Design | ✅ Done | This document + Stitch designs |
| Knowledge Base + SQL | 2-3 hrs | Scraped content, SQL schema, seed script, Text-to-SQL pipeline |
| FastAPI Backend | 1-2 hrs | Streaming SSE endpoint with LangGraph |
| Auth + Database | 1 hr | Auth.js + Prisma + PostgreSQL (Neon) setup |
| Core Chat UI | 2-3 hrs | Chat interface, structured components, sidebar, themes |
| States & Polish | 1-2 hrs | Empty/loading/error states, animations, responsive |
| Deploy & Test | 1 hr | Vercel + Backend deployment, cross-device testing |
| README + Loom | 1 hr | Documentation and video walkthrough |

---

## 13. Deployment

| Component | Platform | Config |
|---|---|---|
| Frontend | Vercel | `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL`, `BACKEND_URL` |
| Backend | Railway / Render | `GOOGLE_API_KEY`, `DATABASE_URL`, `PORT` |
| Database | Neon (PostgreSQL) | Serverless free tier |
| Domain | Vercel auto-assigned | e.g., `agentforge.vercel.app` |

---

## 14. Environment Variables

### Frontend (.env.local)
```
NEXTAUTH_SECRET=<random-secret>
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://<user>:<pass>@<host>/agentforge?sslmode=require
GOOGLE_CLIENT_ID=<google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<google-oauth-client-secret>
BACKEND_URL=http://localhost:8000
```

### Backend (.env)
```
GOOGLE_API_KEY=<gemini-api-key>
DATABASE_URL=postgresql://<user>:<pass>@<host>/agentforge?sslmode=require
ALLOWED_ORIGINS=http://localhost:3000
```