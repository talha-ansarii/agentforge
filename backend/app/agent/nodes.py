"""LangGraph node functions for the AgentForge pipeline."""

import json
import re
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage

from app.agent.state import AgentState
from app.agent.prompts import (
    CLASSIFY_INTENT_PROMPT,
    GENERATE_SQL_PROMPT,
    GENERATE_RESPONSE_PROMPT,
    DB_SCHEMA,
    GREETING_RESPONSE,
    OFF_TOPIC_RESPONSE,
    FOLLOW_UP_SUGGESTIONS,
)
from app.db.connection import execute_query
from app.config import GOOGLE_API_KEY

# Initialize the LLM
llm = ChatGoogleGenerativeAI(
    model="gemini-3-flash-preview",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.3,
)

llm_creative = ChatGoogleGenerativeAI(
    model="gemini-3-flash-preview",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.7,
)


async def classify_intent(state: AgentState) -> dict:
    """Classify the user's message as thinkly_query, greeting, or off_topic."""
    prompt = CLASSIFY_INTENT_PROMPT.format(user_message=state["user_message"])

    response = await llm.ainvoke([HumanMessage(content=prompt)])
    content = response.content
    if isinstance(content, list):
        content = " ".join([c.get("text", "") if isinstance(c, dict) else str(c) for c in content])
    intent = content.strip().lower().replace('"', "").replace("'", "")

    # Normalize
    if "thinkly" in intent or "query" in intent:
        intent = "thinkly_query"
    elif "greeting" in intent or "hello" in intent:
        intent = "greeting"
    else:
        intent = "off_topic"

    return {"intent": intent}


async def handle_greeting(state: AgentState) -> dict:
    """Handle greeting messages with a friendly intro."""
    suggestions = FOLLOW_UP_SUGGESTIONS[:4]
    return {
        "response": GREETING_RESPONSE,
        "sources": [],
        "has_results": True,
    }


async def handle_off_topic(state: AgentState) -> dict:
    """Handle off-topic messages with a polite redirect."""
    return {
        "response": OFF_TOPIC_RESPONSE,
        "sources": [],
        "has_results": True,
    }


async def generate_sql(state: AgentState) -> dict:
    """Generate a SQL query from the user's natural language question."""
    # Format chat history for context
    history_str = ""
    for msg in state.get("chat_history", [])[-6:]:  # Last 6 messages for context
        role = msg.get("role", "user")
        content = msg.get("content", "")
        history_str += f"{role}: {content}\n"

    prompt = GENERATE_SQL_PROMPT.format(
        db_schema=DB_SCHEMA,
        user_message=state["user_message"],
        chat_history=history_str or "No previous history.",
    )

    response = await llm.ainvoke([HumanMessage(content=prompt)])
    content = response.content
    if isinstance(content, list):
        content = " ".join([c.get("text", "") if isinstance(c, dict) else str(c) for c in content])
    sql = content.strip()

    # Clean up — remove markdown code fences if present
    sql = re.sub(r"^```sql\s*", "", sql)
    sql = re.sub(r"^```\s*", "", sql)
    sql = re.sub(r"\s*```$", "", sql)
    sql = sql.strip()

    # Safety check: only allow SELECT
    if not sql.upper().startswith("SELECT"):
        return {
            "sql_query": "",
            "error": "Generated query was not a SELECT statement.",
        }

    return {"sql_query": sql, "error": None}


async def execute_sql(state: AgentState) -> dict:
    """Execute the generated SQL query against the database."""
    sql = state.get("sql_query", "")

    if not sql:
        return {"sql_results": [], "has_results": False}

    try:
        results = await execute_query(sql)
        # Convert any non-serializable types
        clean_results = []
        for row in results:
            clean_row = {}
            for k, v in row.items():
                if hasattr(v, "isoformat"):  # datetime
                    clean_row[k] = v.isoformat()
                else:
                    clean_row[k] = v
            clean_results.append(clean_row)

        return {
            "sql_results": clean_results,
            "has_results": len(clean_results) > 0,
        }
    except Exception as e:
        return {
            "sql_results": [],
            "has_results": False,
            "error": f"Database query error: {str(e)}",
        }


async def validate_results(state: AgentState) -> dict:
    """Check if SQL results are sufficient. If not, try a broader query."""
    if state.get("has_results"):
        return {}  # Results are fine

    # If no results, we'll let the generate node handle it with a fallback
    return {"error": "No results found for the query."}


async def generate_response(state: AgentState) -> dict:
    """Generate the final response using the query results."""
    results = state.get("sql_results", [])
    error = state.get("error")

    if error and not results:
        # Fallback: respond without data
        results_str = "No specific data found in the knowledge base for this query."
    else:
        results_str = json.dumps(results, indent=2, default=str)

    # Format chat history
    history_str = ""
    for msg in state.get("chat_history", [])[-6:]:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        history_str += f"{role}: {content}\n"

    prompt = GENERATE_RESPONSE_PROMPT.format(
        sql_results=results_str,
        user_message=state["user_message"],
        chat_history=history_str or "No previous history.",
    )

    response = await llm_creative.ainvoke([HumanMessage(content=prompt)])

    content = response.content
    if isinstance(content, list):
        content = " ".join([c.get("text", "") if isinstance(c, dict) else str(c) for c in content])
        
    # Extract source URLs from results
    sources = []
    seen_urls = set()
    for row in results:
        url = row.get("page_url")
        if url and url not in seen_urls:
            seen_urls.add(url)
            sources.append({
                "url": f"https://www.thinklylabs.com{url}",
                "title": row.get("name", row.get("slug", "Thinkly Labs")),
            })

    return {
        "response": content,
        "sources": sources,
    }
