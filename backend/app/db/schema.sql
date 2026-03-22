-- AgentForge Knowledge Base Schema
-- Run this to create the knowledge base tables in PostgreSQL

-- Core agent information
CREATE TABLE IF NOT EXISTS agents (
    id            SERIAL PRIMARY KEY,
    slug          VARCHAR(100) UNIQUE NOT NULL,
    name          VARCHAR(200) NOT NULL,
    tagline       TEXT,
    description   TEXT,
    page_url      VARCHAR(500),
    category      VARCHAR(100),
    roi_estimate  VARCHAR(200),
    created_at    TIMESTAMP DEFAULT NOW()
);

-- Agent capabilities (one-to-many)
CREATE TABLE IF NOT EXISTS agent_capabilities (
    id          SERIAL PRIMARY KEY,
    agent_id    INTEGER REFERENCES agents(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    description TEXT
);

-- Agent FAQs (one-to-many)
CREATE TABLE IF NOT EXISTS agent_faqs (
    id        SERIAL PRIMARY KEY,
    agent_id  INTEGER REFERENCES agents(id) ON DELETE CASCADE,
    question  TEXT NOT NULL,
    answer    TEXT NOT NULL
);

-- Solutions (Custom Agents, Knowledge Systems)
CREATE TABLE IF NOT EXISTS solutions (
    id          SERIAL PRIMARY KEY,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    page_url    VARCHAR(500),
    created_at  TIMESTAMP DEFAULT NOW()
);

-- Products (Authr-AI, Mailen)
CREATE TABLE IF NOT EXISTS products (
    id            SERIAL PRIMARY KEY,
    slug          VARCHAR(100) UNIQUE NOT NULL,
    name          VARCHAR(200) NOT NULL,
    tagline       TEXT,
    description   TEXT,
    features      TEXT,
    page_url      VARCHAR(500),
    external_url  VARCHAR(500),
    created_at    TIMESTAMP DEFAULT NOW()
);

-- Company information (key-value)
CREATE TABLE IF NOT EXISTS company_info (
    id     SERIAL PRIMARY KEY,
    key    VARCHAR(100) UNIQUE NOT NULL,
    value  TEXT NOT NULL
);
