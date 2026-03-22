"""LangGraph StateGraph definition for the AgentForge pipeline."""

from langgraph.graph import StateGraph, START, END

from app.agent.state import AgentState
from app.agent.nodes import (
    classify_intent,
    handle_greeting,
    handle_off_topic,
    generate_sql,
    execute_sql,
    validate_results,
    generate_response,
)


def route_by_intent(state: AgentState) -> str:
    """Route to the appropriate handler based on intent classification."""
    intent = state.get("intent", "off_topic")
    if intent == "thinkly_query":
        return "generate_sql"
    elif intent == "greeting":
        return "handle_greeting"
    else:
        return "handle_off_topic"


def route_after_validation(state: AgentState) -> str:
    """After validation, always proceed to generate response."""
    return "generate_response"


def build_graph() -> StateGraph:
    """Build and compile the AgentForge LangGraph pipeline.

    Pipeline:
        classify_intent
            ├── greeting      → handle_greeting    → END
            ├── off_topic     → handle_off_topic   → END
            └── thinkly_query → generate_sql
                                  → execute_sql
                                    → validate_results
                                      → generate_response → END
    """
    workflow = StateGraph(AgentState)

    # Add all nodes
    workflow.add_node("classify_intent", classify_intent)
    workflow.add_node("handle_greeting", handle_greeting)
    workflow.add_node("handle_off_topic", handle_off_topic)
    workflow.add_node("generate_sql", generate_sql)
    workflow.add_node("execute_sql", execute_sql)
    workflow.add_node("validate_results", validate_results)
    workflow.add_node("generate_response", generate_response)

    # Entry point
    workflow.add_edge(START, "classify_intent")

    # Conditional routing based on intent
    workflow.add_conditional_edges(
        "classify_intent",
        route_by_intent,
        {
            "handle_greeting": "handle_greeting",
            "handle_off_topic": "handle_off_topic",
            "generate_sql": "generate_sql",
        },
    )

    # Greeting and off-topic go straight to END
    workflow.add_edge("handle_greeting", END)
    workflow.add_edge("handle_off_topic", END)

    # SQL pipeline: generate → execute → validate → respond
    workflow.add_edge("generate_sql", "execute_sql")
    workflow.add_edge("execute_sql", "validate_results")
    workflow.add_edge("validate_results", "generate_response")
    workflow.add_edge("generate_response", END)

    return workflow.compile()


def build_graph_for_streaming() -> StateGraph:
    """Build a graph variant that stops before generate_response.

    Used by the streaming chat endpoint — it runs classify → SQL → execute
    → validate, then the endpoint streams the final LLM call itself.
    """
    workflow = StateGraph(AgentState)

    workflow.add_node("classify_intent", classify_intent)
    workflow.add_node("handle_greeting", handle_greeting)
    workflow.add_node("handle_off_topic", handle_off_topic)
    workflow.add_node("generate_sql", generate_sql)
    workflow.add_node("execute_sql", execute_sql)
    workflow.add_node("validate_results", validate_results)

    workflow.add_edge(START, "classify_intent")

    workflow.add_conditional_edges(
        "classify_intent",
        route_by_intent,
        {
            "handle_greeting": "handle_greeting",
            "handle_off_topic": "handle_off_topic",
            "generate_sql": "generate_sql",
        },
    )

    workflow.add_edge("handle_greeting", END)
    workflow.add_edge("handle_off_topic", END)

    workflow.add_edge("generate_sql", "execute_sql")
    workflow.add_edge("execute_sql", "validate_results")
    workflow.add_edge("validate_results", END)  # Stop here — streaming endpoint handles response

    return workflow.compile()


# Pre-compiled graph instances
graph = build_graph()
graph_streaming = build_graph_for_streaming()
