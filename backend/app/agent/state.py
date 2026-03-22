from typing import TypedDict, Annotated, Literal
import operator


class AgentState(TypedDict):
    """State schema for the AgentForge LangGraph pipeline."""

    # The user's original message
    user_message: str

    # Chat history for context
    chat_history: list[dict]

    # Intent classification result
    intent: Literal["thinkly_query", "off_topic", "greeting"]

    # Generated SQL query
    sql_query: str

    # Raw results from SQL execution
    sql_results: list[dict]

    # Whether the SQL query returned valid results
    has_results: bool

    # The final response to send to the user
    response: str

    # Source citations for the response
    sources: list[dict]

    # Error message if something went wrong
    error: str | None
