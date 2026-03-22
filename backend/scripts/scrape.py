"""Scrape Thinkly Labs website using BeautifulSoup and structure data into Neon DB using Gemini."""

import asyncio
import os
import sys
import json
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

# Add backend directory to path for app imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"), override=True)

from app.db.connection import get_pool, close_pool
from app.config import GOOGLE_API_KEY

if not GOOGLE_API_KEY:
    print("❌ Error: GOOGLE_API_KEY is missing.")
    sys.exit(1)

# URLs to scrape based on PRD
URLS = [
    "https://www.thinklylabs.com/",
    "https://www.thinklylabs.com/custom-agents",
    "https://www.thinklylabs.com/knowledge-systems",
    "https://www.thinklylabs.com/ai-products",
    "https://www.thinklylabs.com/ai-sdr",
    "https://www.thinklylabs.com/ai-multiplatform-content",
    "https://www.thinklylabs.com/ai-chief-of-staff",
    "https://www.thinklylabs.com/ai-reporting",
    "https://www.thinklylabs.com/ai-support",
    "https://www.thinklylabs.com/ai-hr",
    "https://www.thinklylabs.com/ai-competitor-analyst",
]

def scrape_text(url: str) -> str:
    """Fetch URL and extract visible text."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        
        # Kill script and style elements
        for element in soup(["script", "style", "nav", "footer"]):
            element.extract()
            
        text = soup.get_text(separator="\n")
        
        # Clean up whitespace
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        return f"\n--- Content from {url} ---\n" + "\n".join(lines)
    except Exception as e:
        print(f"Failed to scrape {url}: {e}")
        return ""

EXTRACTION_PROMPT = """You are an expert data extractor. I have scraped the Thinkly Labs website.
Extract the relevant information and format it EXACTLY as the following JSON schema.
DO NOT wrap the response in markdown code blocks. Just output valid JSON.

JSON Schema required:
{
  "agents": [
    {
      "slug": "url-slug-e-g-ai-sdr",
      "name": "Full Agent Name",
      "tagline": "Short hero tagline",
      "description": "Detailed description of what it does",
      "page_url": "/url-path",
      "category": "pre-built",
      "roi_estimate": "Estimated time/money saved",
      "capabilities": [
        {"title": "Capability Title", "description": "What this capability does"}
      ],
      "faqs": [
        {"question": "FAQ Question", "answer": "FAQ Answer"}
      ]
    }
  ],
  "solutions": [
    {
      "slug": "url-slug", "name": "Solution Name", "description": "Details", "page_url": "/path"
    }
  ],
  "products": [
    {
       "slug": "url-slug", "name": "Product Name", "tagline": "...", "description": "...", "features": "...", "page_url": "/path", "external_url": "https://..."
    }
  ],
  "company_info": [
    {"key": "overview", "value": "..."},
    {"key": "approach", "value": "..."},
    {"key": "founders", "value": "..."}
  ]
}

Only extract information present in the raw scraped data below. If you cannot find something for a column, make it entirely empty string. Combine all pages into one coherent JSON. 
For `page_url` use the relative path (e.g., `/ai-sdr`). 
If multiple pages talk about the same agent, merge them.

Raw Scraped Data:
{scraped_text}
"""

async def process_and_seed():
    print("🕸️  Scraping Thinkly Labs website...")
    all_text = ""
    for url in URLS:
        print(f"Scraping: {url}")
        all_text += scrape_text(url) + "\n"

    print("\n🧠 Passing raw data to Gemini-3-flash-preview for structuring...")
    
    # Initialize LLM
    llm = ChatGoogleGenerativeAI(
        model="gemini-3-flash-preview",
        google_api_key=GOOGLE_API_KEY,
        temperature=0.1,
    )
    
    prompt = EXTRACTION_PROMPT.replace("{scraped_text}", all_text)
    
    response = await llm.ainvoke([HumanMessage(content=prompt)])
    content = response.content
    if isinstance(content, list):
        content = " ".join([c.get("text", "") if isinstance(c, dict) else str(c) for c in content])
        
    try:
        # Clean markdown codeblocks if LLM returned them despite instruction
        clean_json = content.strip()
        if clean_json.startswith("```json"):
            clean_json = clean_json[7:]
        if clean_json.startswith("```"):
            clean_json = clean_json[3:]
        if clean_json.endswith("```"):
            clean_json = clean_json[:-3]
            
        data = json.loads(clean_json.strip())
    except json.JSONDecodeError as e:
        print(f"❌ Failed to parse JSON from LLM: {e}")
        print("Raw output:", content[:500])
        return
        
    print("✅ Data structured successfully. Inserting into database...")
    
    pool = await get_pool()
    async with pool.acquire() as conn:
        # Truncate tables first
        await conn.execute("TRUNCATE agents, agent_capabilities, agent_faqs, solutions, products, company_info CASCADE;")
        
        # Insert Agents
        for agent in data.get("agents", []):
            agent_id = await conn.fetchval("""
                INSERT INTO agents (slug, name, tagline, description, page_url, category, roi_estimate)
                VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
            """, agent["slug"], agent["name"], agent.get("tagline"), agent.get("description"), 
               agent.get("page_url"), agent.get("category", "pre-built"), agent.get("roi_estimate"))
            
            # Insert Capabilities
            for cap in agent.get("capabilities", []):
                await conn.execute("""
                    INSERT INTO agent_capabilities (agent_id, title, description)
                    VALUES ($1, $2, $3)
                """, agent_id, cap.get("title"), cap.get("description"))
                
            # Insert FAQs
            for faq in agent.get("faqs", []):
                await conn.execute("""
                    INSERT INTO agent_faqs (agent_id, question, answer)
                    VALUES ($1, $2, $3)
                """, agent_id, faq.get("question"), faq.get("answer"))
                
        # Insert Solutions
        for sol in data.get("solutions", []):
            await conn.execute("""
                INSERT INTO solutions (slug, name, description, page_url)
                VALUES ($1, $2, $3, $4)
            """, sol["slug"], sol["name"], sol.get("description"), sol.get("page_url"))
            
        # Insert Products
        for prod in data.get("products", []):
            await conn.execute("""
                INSERT INTO products (slug, name, tagline, description, features, page_url, external_url)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            """, prod["slug"], prod["name"], prod.get("tagline"), prod.get("description"), 
               prod.get("features"), prod.get("page_url"), prod.get("external_url"))
            
        # Insert Company Info
        for info in data.get("company_info", []):
            await conn.execute("""
                INSERT INTO company_info (key, value)
                VALUES ($1, $2)
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
            """, info["key"], info["value"])
            
    await close_pool()
    print("🎉 Knowledge base seeded directly from live Thinkly Labs website!")

if __name__ == "__main__":
    asyncio.run(process_and_seed())
