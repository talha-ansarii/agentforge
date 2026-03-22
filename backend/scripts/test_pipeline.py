"""Test the AgentForge pipeline locally."""

import asyncio
import os
import sys
import json
from dotenv import load_dotenv

# Add backend directory to path for app imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Load real environment variables before importing app modules
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"), override=True)

from app.agent.graph import graph


async def test_pipeline(message: str):
    """Run a test message through the pipeline and print events."""
    print(f"\n{'='*50}")
    print(f"User: {message}")
    print(f"{'='*50}\n")
    
    initial_state = {
        "user_message": message,
        "chat_history": [],
        "intent": "",
        "sql_query": "",
        "sql_results": [],
        "has_results": False,
        "response": "",
        "sources": [],
        "error": None,
    }
    
    print("Graph execution trace:")
    
    # Stream events from the graph execution
    async for event in graph.astream(initial_state):
        node_name = list(event.keys())[0]
        node_state = event[node_name] or {}
        
        print(f"\n--- Node: {node_name} ---")
        
        # Print relevant state updates
        if "intent" in node_state and node_state["intent"]:
            print(f"Intent classified: {node_state['intent']}")
            
        if "sql_query" in node_state and node_state["sql_query"]:
            print(f"Generated SQL:\n{node_state['sql_query']}")
            
        if "sql_results" in node_state and node_state["sql_results"]:
            print(f"Found {len(node_state['sql_results'])} results.")
            
        if "error" in node_state and node_state["error"]:
            print(f"❌ Error: {node_state['error']}")
            
        if "response" in node_state and node_state["response"]:
            print(f"\nFinal Response:\n{node_state['response']}")
            
        if "sources" in node_state and node_state["sources"]:
            print("\nSources:")
            for src in node_state["sources"]:
                print(f"- {src['title']}: {src['url']}")


async def main():
    messages = [
        "Hi there!",
        "What's the weather like today?",
        "How can AI help my sales team book more meetings?",
        "Compare the AI SDR to the AI Support Agent.",
        "Tell me about Authr-AI.",
    ]
    
    for msg in messages:
        await test_pipeline(msg)


if __name__ == "__main__":
    if not os.getenv("GOOGLE_API_KEY"):
        print("❌ Error: GOOGLE_API_KEY is not set in .env")
        sys.exit(1)
        
    if not os.getenv("DATABASE_URL"):
        print("❌ Error: DATABASE_URL is not set in .env")
        sys.exit(1)
        
    asyncio.run(main())
