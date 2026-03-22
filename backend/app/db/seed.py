"""Seed the knowledge base with Thinkly Labs product data."""

import asyncio
import os
import sys

# Add parent to path so we can import app modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from app.db.connection import get_pool, close_pool


SEED_SQL = """
-- Clear existing data
TRUNCATE agents, agent_capabilities, agent_faqs, solutions, products, company_info CASCADE;

-- ============================================================
-- AGENTS
-- ============================================================

INSERT INTO agents (slug, name, tagline, description, page_url, category, roi_estimate) VALUES
('ai-sdr', 'AI SDR', 'Your AI SDR that researches, personalizes, and converts.',
 'An AI-powered Sales Development Representative that automates outbound prospecting. It researches leads by analyzing signals, social activity, and firmographics. It then crafts hyper-personalized emails using real intel like funding events, job changes, and content engagement. It handles replies, nurtures conversations, and books qualified meetings directly into your CRM and calendar.',
 '/ai-sdr', 'pre-built', 'Saves 15-20 hrs/week on outbound prospecting'),

('ai-multiplatform-content', 'AI Multiplatform Content', 'Your AI content engine for every platform.',
 'An AI content engine that creates platform-specific content, adapts tone to audience, and maintains brand voice consistency. It generates ideas from your voice memos and Slack conversations, creates content for multiple platforms simultaneously, and tracks performance with a feedback loop to continuously improve.',
 '/ai-multiplatform-content', 'pre-built', 'Saves 10-15 hrs/week on content creation'),

('ai-chief-of-staff', 'AI Chief of Staff', 'Your AI Chief of Staff that keeps operations running.',
 'An AI executive operations assistant that handles intelligent inbox management, generates daily executive briefings, manages tasks and follow-ups, and drafts stakeholder communications. It monitors email, Slack, Teams, and meeting notes, categorizes by urgency, and tracks action items across all channels.',
 '/ai-chief-of-staff', 'pre-built', 'Saves 10-15 hrs/week on operational overhead'),

('ai-reporting', 'AI Reporting + Insights', 'AI that turns raw data into actionable insights.',
 'An AI reporting agent that integrates multi-source data, performs intelligent analysis, generates automated reports, and provides conversational insights. It ingests data from various sources, builds models, runs inference, and delivers actionable reports to stakeholders.',
 '/ai-reporting', 'pre-built', 'Saves 8-12 hrs/week on reporting'),

('ai-support', 'AI Support Agent', 'AI support that resolves, not just responds.',
 'An AI customer support agent with intelligent query routing, knowledge-powered responses, multi-channel support, and human handoff. It understands customer intent, retrieves accurate answers from your knowledge base, supports email, chat, and ticketing systems, and escalates when needed.',
 '/ai-support', 'pre-built', 'Reduces support ticket volume by 40-60%'),

('ai-hr', 'AI HR Agent', 'AI that handles recruiting and hiring end to end.',
 'An AI HR agent that automates candidate sourcing, pre-screening, interview coordination, and onboarding. It processes resumes, scores candidates against job requirements, handles email communications with applicants, and sets up new hire workflows.',
 '/ai-hr', 'pre-built', 'Saves 15-20 hrs/week on HR operations'),

('ai-competitor-analyst', 'AI Competitor Analyst', 'AI that tracks competitors so you don''t have to.',
 'An AI competitive intelligence agent that provides continuous monitoring, strategic analysis, automated reporting, and conversational intelligence. It tracks competitor moves across news, filings, product updates, and social media, then delivers executive-ready reports with strategic recommendations.',
 '/ai-competitor-analyst', 'pre-built', 'Saves 5-10 hrs/week on competitive research');

-- ============================================================
-- AGENT CAPABILITIES
-- ============================================================

-- AI SDR capabilities
INSERT INTO agent_capabilities (agent_id, title, description) VALUES
((SELECT id FROM agents WHERE slug = 'ai-sdr'), 'Lead Qualification', 'Detect buying signals, scan social activity, funding events, and job changes to score and prioritize leads by ICP fit.'),
((SELECT id FROM agents WHERE slug = 'ai-sdr'), 'Deep Account Research', 'Pull firmographics, tech stack, recent news, and engagement data to build comprehensive prospect profiles.'),
((SELECT id FROM agents WHERE slug = 'ai-sdr'), 'Multi-Channel Personalization', 'Craft hyper-personalized outreach using real intel, woven into emails and LinkedIn messages that cut through noise.'),
((SELECT id FROM agents WHERE slug = 'ai-sdr'), 'Smart Follow-Up', 'Handle replies, nurture conversations, detect intent, and route to meeting booking when leads are ready.'),
((SELECT id FROM agents WHERE slug = 'ai-sdr'), 'Meeting Scheduling', 'Integrate with calendar and CRM to book qualified meetings, send prep notes to AEs, and update CRM automatically.');

-- AI Multiplatform Content capabilities
INSERT INTO agent_capabilities (agent_id, title, description) VALUES
((SELECT id FROM agents WHERE slug = 'ai-multiplatform-content'), 'Idea Generation', 'Generate content ideas from voice memos, Slack conversations, and topic trends relevant to your audience.'),
((SELECT id FROM agents WHERE slug = 'ai-multiplatform-content'), 'Multi-Platform Adaptation', 'Create platform-specific content for LinkedIn, Twitter, blog, email, and more — all from a single brief.'),
((SELECT id FROM agents WHERE slug = 'ai-multiplatform-content'), 'Voice Consistency', 'Maintain your authentic voice and brand guidelines across all generated content.'),
((SELECT id FROM agents WHERE slug = 'ai-multiplatform-content'), 'Feedback Loop', 'Track content performance and use engagement data to continuously improve output quality.');

-- AI Chief of Staff capabilities
INSERT INTO agent_capabilities (agent_id, title, description) VALUES
((SELECT id FROM agents WHERE slug = 'ai-chief-of-staff'), 'Intelligent Inbox Management', 'Monitor email, Slack, Teams, and meetings to categorize by urgency and surface only what needs your attention.'),
((SELECT id FROM agents WHERE slug = 'ai-chief-of-staff'), 'Daily Executive Briefings', 'Generate personalized morning briefs with priority tasks, calendar highlights, team updates, and pending decisions.'),
((SELECT id FROM agents WHERE slug = 'ai-chief-of-staff'), 'Task & Follow-Up Management', 'Track action items from meetings, send follow-ups, and escalate when deadlines approach.'),
((SELECT id FROM agents WHERE slug = 'ai-chief-of-staff'), 'Stakeholder Communication', 'Draft status updates, send routine messages, and maintain communication cadence with stakeholders.');

-- AI Reporting capabilities
INSERT INTO agent_capabilities (agent_id, title, description) VALUES
((SELECT id FROM agents WHERE slug = 'ai-reporting'), 'Multi-Source Data Integration', 'Ingest data from CRM, analytics, spreadsheets, and databases into a unified view.'),
((SELECT id FROM agents WHERE slug = 'ai-reporting'), 'Intelligent Analysis', 'Run statistical analysis, identify trends, and surface anomalies automatically.'),
((SELECT id FROM agents WHERE slug = 'ai-reporting'), 'Automated Report Generation', 'Generate polished reports with visualizations, annotations, and actionable recommendations.'),
((SELECT id FROM agents WHERE slug = 'ai-reporting'), 'Conversational Insights', 'Ask questions about your data in natural language and get instant, accurate answers.');

-- AI Support capabilities
INSERT INTO agent_capabilities (agent_id, title, description) VALUES
((SELECT id FROM agents WHERE slug = 'ai-support'), 'Intelligent Query Routing', 'Understand customer intent and route queries to the right resolution path.'),
((SELECT id FROM agents WHERE slug = 'ai-support'), 'Knowledge-Powered Responses', 'Retrieve accurate answers from your knowledge base with source citations.'),
((SELECT id FROM agents WHERE slug = 'ai-support'), 'Multi-Channel Support', 'Handle support across email, live chat, and ticketing systems seamlessly.'),
((SELECT id FROM agents WHERE slug = 'ai-support'), 'Human Handoff', 'Detect when a query needs human attention and escalate with full context.');

-- AI HR capabilities
INSERT INTO agent_capabilities (agent_id, title, description) VALUES
((SELECT id FROM agents WHERE slug = 'ai-hr'), 'Candidate Sourcing', 'Find and attract qualified candidates from multiple job boards and platforms.'),
((SELECT id FROM agents WHERE slug = 'ai-hr'), 'Automated Pre-Screening', 'Score resumes against job requirements and surface top candidates automatically.'),
((SELECT id FROM agents WHERE slug = 'ai-hr'), 'Interview Coordination', 'Schedule interviews, send reminders, and handle candidate communications.'),
((SELECT id FROM agents WHERE slug = 'ai-hr'), 'Onboarding Automation', 'Set up new hire workflows, provision accounts, and manage onboarding tasks.');

-- AI Competitor Analyst capabilities
INSERT INTO agent_capabilities (agent_id, title, description) VALUES
((SELECT id FROM agents WHERE slug = 'ai-competitor-analyst'), 'Continuous Monitoring', 'Track competitor moves across news, product updates, filings, and social media 24/7.'),
((SELECT id FROM agents WHERE slug = 'ai-competitor-analyst'), 'Strategic Analysis', 'Analyze positioning, pricing changes, feature launches, and market moves.'),
((SELECT id FROM agents WHERE slug = 'ai-competitor-analyst'), 'Automated Reporting', 'Deliver executive-ready competitive intelligence briefs on schedule.'),
((SELECT id FROM agents WHERE slug = 'ai-competitor-analyst'), 'Conversational Intelligence', 'Ask questions about competitors in natural language and get instant answers.');

-- ============================================================
-- AGENT FAQS
-- ============================================================

INSERT INTO agent_faqs (agent_id, question, answer) VALUES
((SELECT id FROM agents WHERE slug = 'ai-sdr'), 'Is this suitable for our industry/business model?', 'The AI SDR is designed to work across B2B industries. It adapts its research and personalization to your specific ICP, whether you sell to startups, mid-market, or enterprise.'),
((SELECT id FROM agents WHERE slug = 'ai-chief-of-staff'), 'What happens when it encounters something it can''t handle?', 'The AI Chief of Staff knows its boundaries. It flags ambiguous situations for your review and always keeps a human in the loop for critical decisions.'),
((SELECT id FROM agents WHERE slug = 'ai-support'), 'Does it integrate with our existing helpdesk?', 'Yes, the AI Support Agent integrates with popular helpdesk tools like Zendesk, Intercom, Freshdesk, and custom ticketing systems.'),
((SELECT id FROM agents WHERE slug = 'ai-hr'), 'How accurate is the candidate scoring?', 'The scoring is based on configurable criteria aligned with your job requirements. You can fine-tune weights for skills, experience, education, and other factors.'),
((SELECT id FROM agents WHERE slug = 'ai-competitor-analyst'), 'Does it integrate with our existing tools?', 'Yes, it integrates with Slack, email, Notion, Confluence, and can export to common formats like PDF and PPT.'),
((SELECT id FROM agents WHERE slug = 'ai-reporting'), 'Does it replace our existing BI tools?', 'No, it complements your existing BI stack. It adds an AI analysis layer on top of your data sources and can integrate with tools like Tableau, Looker, and Power BI.'),
((SELECT id FROM agents WHERE slug = 'ai-multiplatform-content'), 'How does it track performance?', 'It monitors engagement metrics across platforms and uses performance data to refine future content suggestions and adapt your content strategy.');

-- ============================================================
-- SOLUTIONS
-- ============================================================

INSERT INTO solutions (slug, name, description, page_url) VALUES
('custom-agents', 'Custom AI Agents', 'Two types of custom agents for enterprise workflows: (1) Reasoning Agents that use advanced models to analyze, plan, and make decisions with multi-step thinking, and (2) Operational Agents that execute predefined workflows reliably on schedules or triggers. Agent types include: Deep Research, Knowledge Search, Conversational, Data Analysis, Content Generation, and Evaluation agents.', '/custom-agents'),
('knowledge-systems', 'Knowledge Systems', 'Turn documents into searchable knowledge with two approaches: (1) Knowledge Bases that transform documents, wikis, and internal data into searchable knowledge with semantic search and relevance ranking, and (2) Knowledge Graphs that map relationships between entities and uncover hidden connections. Capabilities include Document Processing, Semantic Search, Q&A Systems, and Multi-source Integration.', '/knowledge-systems');

-- ============================================================
-- PRODUCTS
-- ============================================================

INSERT INTO products (slug, name, tagline, description, features, page_url, external_url) VALUES
('authr-ai', 'Authr-AI', 'Turn your LinkedIn into the #1 inbound source.',
 'The LinkedIn Content System That Actually Books Meetings. Authr turns everything you think, read, and say into content — then tracks which ones drive real conversations.',
 'Voice Memos & Slack integration, Your Voice Not AI''s tone preservation, Conversation tracking, LinkedIn content optimization',
 '/ai-products', 'https://authr-ai.com'),

('mailen', 'Mailen', '90 seconds to investor-ready emails.',
 'No more blank screens, no overthinking. Just fast, effective emails crafted for your funding stage. Built for founders who want to move fast.',
 '90-Second Email Generation, Stage-Smart Messaging, Multiple Email Options, Investor-ready formatting',
 '/ai-products', 'https://mailen.ai');

-- ============================================================
-- COMPANY INFO
-- ============================================================

INSERT INTO company_info (key, value) VALUES
('overview', 'ThinklyLabs is a technical partner for enterprise teams. We build production-grade AI orchestration that removes repetitive manual work with reliable, scalable systems. We build reasoning and operational agents that integrate seamlessly into your operations — combining intelligence for complex decisions with reliability for repetitive work.'),
('approach', 'Our approach follows four phases: (1) Audit — understand your workflows and identify automation opportunities, (2) Architect — design the agent system tailored to your needs, (3) Build — develop and deploy production-grade agents, (4) Monitor — continuous improvement with performance tracking.'),
('founders', 'Founded by Vedant Kunte (CTO) and Sachi Gupta (CEO). The team brings deep expertise in AI systems, enterprise software, and operational efficiency.'),
('book_demo', 'Book a demo with Sachi Gupta at https://cal.com/sachi-gupta-12svmo/30min'),
('website', 'https://www.thinklylabs.com');
"""


async def seed_database():
    """Create tables and seed data."""
    # Read and execute schema
    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
    with open(schema_path, "r") as f:
        schema_sql = f.read()

    pool = await get_pool()
    async with pool.acquire() as conn:
        # Create tables
        await conn.execute(schema_sql)
        print("✅ Tables created successfully")

        # Seed data
        await conn.execute(SEED_SQL)
        print("✅ Knowledge base seeded successfully")

        # Verify
        agent_count = await conn.fetchval("SELECT COUNT(*) FROM agents")
        cap_count = await conn.fetchval("SELECT COUNT(*) FROM agent_capabilities")
        faq_count = await conn.fetchval("SELECT COUNT(*) FROM agent_faqs")
        sol_count = await conn.fetchval("SELECT COUNT(*) FROM solutions")
        prod_count = await conn.fetchval("SELECT COUNT(*) FROM products")
        info_count = await conn.fetchval("SELECT COUNT(*) FROM company_info")

        print(f"\n📊 Seeded data:")
        print(f"   Agents: {agent_count}")
        print(f"   Capabilities: {cap_count}")
        print(f"   FAQs: {faq_count}")
        print(f"   Solutions: {sol_count}")
        print(f"   Products: {prod_count}")
        print(f"   Company Info: {info_count}")

    await close_pool()


if __name__ == "__main__":
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
    asyncio.run(seed_database())
