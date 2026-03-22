"use client";

import { useCallback, useRef } from "react";
import { useChatStore, type ChatMessage } from "@/stores/chat-store";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Map backend error codes to user-friendly messages */
function friendlyErrorMessage(code?: string, fallback?: string): string {
  switch (code) {
    case "PIPELINE_ERROR":
      return "Our AI pipeline hit a snag. Please try sending your message again.";
    case "LLM_ERROR":
      return "The AI model is temporarily unavailable. Please try again in a moment.";
    case "VALIDATION_ERROR":
      return fallback ?? "Your message couldn't be processed. Please check and try again.";
    case "INTERNAL_ERROR":
      return "Something went wrong on our end. We're looking into it.";
    default:
      return fallback ?? "Something went wrong. Please try again.";
  }
}

export function useChatStream() {
  const {
    messages,
    isStreaming,
    addMessage,
    setIsStreaming,
    setStreamingContent,
    appendStreamingContent,
    setError,
    setThreads,
  } = useChatStore();

  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isStreaming) return;

      // Add user message to store
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: userMessage,
        createdAt: new Date().toISOString(),
      };
      addMessage(userMsg);

      // Auto-create a thread if none is active
      let currentThreadId = useChatStore.getState().activeThreadId;
      if (!currentThreadId) {
        try {
          const res = await fetch("/api/threads", { method: "POST" });
          if (!res.ok) {
            const errBody = (await res.json().catch(() => ({}))) as { error?: string };
            throw new Error(errBody.error ?? `Failed to create thread (${res.status})`);
          }
          const thread = (await res.json()) as { id: string; title: string; createdAt: string; updatedAt: string };
          currentThreadId = thread.id;
          const { setActiveThreadId: setId, setThreads: setT, threads: currentThreads } = useChatStore.getState();
          setId(thread.id);
          setT([thread, ...currentThreads]);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Failed to start a new conversation";
          toast.error("Connection Error", { description: msg });
          // Still attempt to continue — worst case messages won't persist
        }
      }

      // Prepare chat history (last 6 messages)
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Start streaming
      setIsStreaming(true);
      setStreamingContent("");

      const controller = new AbortController();
      abortRef.current = controller;

      let fullContent = "";
      let sources: { url: string; title: string }[] = [];
      let receivedError = false;

      try {
        const res = await fetch(`${API_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: userMessage,
            chat_history: history,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          // Try to parse a structured error from the backend
          const errBody = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
          const userErrorMsg = friendlyErrorMessage(errBody.code, errBody.error);
          throw new Error(userErrorMsg);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response received from the server.");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            // Handle SSE event type
            if (line.startsWith("event: ")) {
              const eventType = line.slice(7).trim();
              if (eventType === "error") {
                receivedError = true;
              }
              continue;
            }

            if (line.startsWith("data: ")) {
              const data = line.slice(6);

              try {
                const parsed = JSON.parse(data) as {
                  content?: string;
                  sources?: { url: string; title: string }[];
                  status?: string;
                  error?: string;
                  code?: string;
                };

                // Handle SSE error events from backend
                if (receivedError || parsed.error) {
                  const userErrorMsg = friendlyErrorMessage(parsed.code, parsed.error);
                  toast.error("AI Error", { description: userErrorMsg });

                  // Add an error message as an assistant reply so the user sees it inline
                  const errorAssistantMsg: ChatMessage = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: `⚠️ ${userErrorMsg}`,
                    createdAt: new Date().toISOString(),
                  };

                  setIsStreaming(false);
                  setStreamingContent("");
                  addMessage(errorAssistantMsg);
                  return;
                }

                if (parsed.content !== undefined) {
                  fullContent += parsed.content;
                  appendStreamingContent(parsed.content);
                } else if (parsed.sources) {
                  sources = parsed.sources;
                } else if (parsed.status === "complete") {
                  // Stream completed
                }
              } catch {
                // Not JSON, treat as raw token
                if (data !== "[DONE]") {
                  fullContent += data;
                  appendStreamingContent(data);
                }
              }
            }
          }
        }

        // If we streamed nothing at all, show a fallback
        if (!fullContent.trim() && !receivedError) {
          fullContent = "I wasn't able to generate a response. Please try rephrasing your question.";
        }

        // Clear streaming state FIRST to prevent double-bubble flash
        setIsStreaming(false);
        setStreamingContent("");

        // Add assistant message to store
        const assistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: fullContent,
          sources,
          createdAt: new Date().toISOString(),
        };
        addMessage(assistantMsg);

        // Save to database
        const threadId = currentThreadId;
        if (threadId) {
          try {
            const saveRes = await fetch(`/api/threads/${threadId}/messages`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userMessage: userMsg,
                assistantMessage: assistantMsg,
              }),
            });

            if (!saveRes.ok) {
              console.warn("Messages were not saved to history.");
            }

            // Update thread title if it's the first message
            const currentMessages = useChatStore.getState().messages;
            if (currentMessages.length <= 2) {
              const title =
                userMessage.length > 50
                  ? userMessage.slice(0, 50) + "..."
                  : userMessage;

              const patchRes = await fetch(`/api/threads/${threadId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title }),
              });

              if (patchRes.ok) {
                const freshThreads = useChatStore.getState().threads;
                setThreads(
                  freshThreads.map((t) => (t.id === threadId ? { ...t, title } : t)),
                );
              }
            }
          } catch {
            // DB save failure is non-critical — don't interrupt the user
            console.warn("Failed to persist chat to database.");
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // User cancelled — add partial content if any
          if (fullContent.trim()) {
            const partialMsg: ChatMessage = {
              id: crypto.randomUUID(),
              role: "assistant",
              content: fullContent + "\n\n*— Response stopped by user*",
              sources,
              createdAt: new Date().toISOString(),
            };
            addMessage(partialMsg);
          }
          return;
        }

        // Network / fetch failures
        let errorMsg: string;
        if (err instanceof TypeError && err.message.includes("fetch")) {
          errorMsg = "Cannot reach the server. Please check your connection and try again.";
        } else {
          errorMsg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
        }

        setError(errorMsg);
        toast.error("Chat Error", { description: errorMsg });

        // Show error inline in chat
        const errorAssistantMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `⚠️ ${errorMsg}`,
          createdAt: new Date().toISOString(),
        };
        addMessage(errorAssistantMsg);
      } finally {
        setIsStreaming(false);
        setStreamingContent("");
        abortRef.current = null;
      }
    },
    [
      isStreaming,
      messages,
      addMessage,
      setIsStreaming,
      setStreamingContent,
      appendStreamingContent,
      setError,
      setThreads,
    ],
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setIsStreaming(false);
    setStreamingContent("");
  }, [setIsStreaming, setStreamingContent]);

  return { sendMessage, stopStreaming, isStreaming };
}
