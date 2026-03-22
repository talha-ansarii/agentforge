"""SSE streaming chat endpoint for AgentForge."""

import json
import asyncio
import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from sse_starlette.sse import EventSourceResponse
from pydantic import BaseModel, field_validator
from langchain_core.messages import HumanMessage

from app.agent.graph import graph_streaming
from app.agent.prompts import FOLLOW_UP_SUGGESTIONS, GENERATE_RESPONSE_PROMPT
from app.agent.nodes import llm_creative

logger = logging.getLogger(__name__)

router = APIRouter()


class ChatRequest(BaseModel):
    message: str
    chat_history: list[dict] = []

    @field_validator("message")
    @classmethod
    def message_must_not_be_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Message cannot be empty")
        if len(stripped) > 10000:
            raise ValueError("Message is too long (max 10,000 characters)")
        return stripped


@router.post("/chat")
async def chat(request: ChatRequest):
    """Stream a response using the AgentForge LangGraph pipeline via SSE.

    For thinkly_query intents, the pipeline runs classify → SQL → execute →
    validate, then the final LLM response is streamed token-by-token.
    For greeting/off_topic, the static response is streamed word-by-word.
    """

    async def event_generator():
        try:
            # Initialize the state
            initial_state = {
                "user_message": request.message,
                "chat_history": request.chat_history,
                "intent": "",
                "sql_query": "",
                "sql_results": [],
                "has_results": False,
                "response": "",
                "sources": [],
                "error": None,
            }

            # Run the streaming graph (stops before generate_response for thinkly_query)
            try:
                result = await graph_streaming.ainvoke(initial_state)
            except Exception as graph_err:
                logger.error("Graph execution failed: %s", graph_err, exc_info=True)
                yield {
                    "event": "error",
                    "data": json.dumps({
                        "error": "Our AI pipeline encountered an issue. Please try again.",
                        "code": "PIPELINE_ERROR",
                    }),
                }
                return

            intent = result.get("intent", "")
            sources = result.get("sources", [])
            sql_results = result.get("sql_results", [])
            error = result.get("error")

            if intent in ("greeting", "off_topic"):
                # Static responses — stream word-by-word for a typing effect
                response_text = result.get("response", "")
                if not response_text:
                    response_text = "I'm sorry, I couldn't generate a response. Please try again."
                words = response_text.split(" ")
                for word in words:
                    yield {
                        "event": "token",
                        "data": json.dumps({"content": word + " "}),
                    }
                    await asyncio.sleep(0.02)
            else:
                # thinkly_query — stream LLM tokens in real-time
                if error and not sql_results:
                    results_str = "No specific data found in the knowledge base for this query."
                else:
                    results_str = json.dumps(sql_results, indent=2, default=str)

                history_str = ""
                for msg in request.chat_history[-6:]:
                    role = msg.get("role", "user")
                    content = msg.get("content", "")
                    history_str += f"{role}: {content}\n"

                prompt = GENERATE_RESPONSE_PROMPT.format(
                    sql_results=results_str,
                    user_message=request.message,
                    chat_history=history_str or "No previous history.",
                )

                # Stream tokens directly from the LLM
                try:
                    async for chunk in llm_creative.astream([HumanMessage(content=prompt)]):
                        token = chunk.content
                        if isinstance(token, list):
                            token = "".join(
                                [c.get("text", "") if isinstance(c, dict) else str(c) for c in token]
                            )
                        if token:
                            yield {
                                "event": "token",
                                "data": json.dumps({"content": token}),
                            }
                except Exception as llm_err:
                    logger.error("LLM streaming failed: %s", llm_err, exc_info=True)
                    yield {
                        "event": "error",
                        "data": json.dumps({
                            "error": "Failed to generate a response. The AI model may be temporarily unavailable.",
                            "code": "LLM_ERROR",
                        }),
                    }
                    return

                # Extract sources from SQL results
                seen_urls = set()
                for row in sql_results:
                    if isinstance(row, dict):
                        url = row.get("page_url")
                        if url and url not in seen_urls:
                            seen_urls.add(url)
                            sources.append({
                                "url": f"https://www.thinklylabs.com{url}",
                                "title": row.get("name", row.get("slug", "Thinkly Labs")),
                            })

            # Send sources
            if sources:
                yield {
                    "event": "sources",
                    "data": json.dumps({"sources": sources}),
                }

            # Send follow-up suggestions
            if intent in ("thinkly_query", "greeting"):
                yield {
                    "event": "suggestions",
                    "data": json.dumps(
                        {"suggestions": FOLLOW_UP_SUGGESTIONS[:4]}
                    ),
                }

            # Signal completion
            yield {
                "event": "done",
                "data": json.dumps({"status": "complete"}),
            }

        except Exception as e:
            logger.error("Unexpected error in chat stream: %s", e, exc_info=True)
            yield {
                "event": "error",
                "data": json.dumps({
                    "error": "An unexpected error occurred. Please try again later.",
                    "code": "INTERNAL_ERROR",
                }),
            }

    return EventSourceResponse(event_generator())


@router.get("/health")
async def health():
    return {"status": "ok", "service": "agentforge-backend"}
