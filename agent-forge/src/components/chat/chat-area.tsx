"use client";

import { useEffect, useRef } from "react";
import { useChatStore } from "@/stores/chat-store";
import { useChatStream } from "@/hooks/use-chat-stream";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bot, Link2, Sparkles } from "lucide-react";

export function ChatArea() {
  const { messages, isLoadingMessages, isStreaming, streamingContent, activeThreadId } = useChatStore();
  const { sendMessage } = useChatStream();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming, streamingContent]);

  // Loading skeletons
  if (isLoadingMessages) {
    return (
      <section className="flex-1 overflow-y-auto px-4 md:px-8 py-10 space-y-6 max-w-5xl mx-auto w-full">
        {[1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-5 animate-pulse">
            <div className="flex justify-end">
              <div className="h-12 w-[40%] rounded-3xl rounded-tr-sm bg-emerald-200/30 dark:bg-teal-700/20" />
            </div>
            <div className="w-full rounded-2xl bg-white/40 dark:bg-[#152626]/50 p-6 md:p-8 flex gap-5 items-start">
              <div className="w-14 h-14 rounded-2xl bg-emerald-200/40 dark:bg-teal-700/30 shrink-0" />
              <div className="flex-1 space-y-3 pt-1">
                <div className="h-4 w-[85%] rounded-full bg-emerald-200/25 dark:bg-teal-700/20" />
                <div className="h-4 w-[70%] rounded-full bg-emerald-200/25 dark:bg-teal-700/20" />
                <div className="h-4 w-[50%] rounded-full bg-emerald-200/25 dark:bg-teal-700/20" />
              </div>
            </div>
          </div>
        ))}
      </section>
    );
  }

  // Empty / Welcome state
  if (!activeThreadId && messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 mb-6 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-teal-600/25">
          <Sparkles className="text-white w-9 h-9" />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-on-surface mb-2 font-['Plus_Jakarta_Sans']">
          Welcome to Discovery
        </h2>
        <p className="text-on-surface-variant/50 text-sm max-w-md text-center leading-relaxed">
          Ask me to identify the perfect AI agent for your operational bottlenecks.
        </p>

        {/* Suggestion chips */}
        <div className="flex flex-wrap gap-2.5 mt-8 max-w-lg justify-center">
          {[
            "What AI agents do you offer?",
            "My team spends hours on cold outreach",
            "How does pricing work?",
          ].map((s) => (
            <button
              key={s}
              onClick={() => void sendMessage(s)}
              className="px-4 py-2.5 rounded-xl bg-white/70 dark:bg-[#1c3030]/60 backdrop-blur-sm border border-emerald-200/30 dark:border-teal-700/30 text-xs font-semibold text-on-surface-variant/60 hover:border-primary/40 hover:text-primary hover:bg-white dark:hover:bg-[#243a3a] transition-all duration-200 shadow-sm cursor-pointer active:scale-95"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="flex-1 overflow-y-auto px-4 md:px-8 py-8 max-w-5xl mx-auto w-full scroll-smooth">
      <div className="space-y-8">
        {messages.map((message) => {
          const isUser = message.role === "user";

          if (isUser) {
            return (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[75%] bg-white dark:bg-[#1c3030] px-5 py-3.5 rounded-3xl rounded-tr-sm shadow-sm border border-emerald-100/40 dark:border-teal-700/25">
                  <p className="text-[15px] leading-relaxed font-medium text-on-surface whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            );
          }

          // Assistant — Bento card (matching Stitch design)
          return (
            <div key={message.id} className="space-y-4">
              <div className="w-full relative overflow-hidden rounded-2xl bg-white/50 dark:bg-[#152626]/60 backdrop-blur-lg border border-white/60 dark:border-teal-700/20 shadow-sm dark:shadow-md dark:shadow-black/10 transition-all">
                <div className="p-5 md:p-7 flex flex-col md:flex-row gap-5 md:gap-7 items-start">
                  {/* Agent Avatar */}
                  <div className="hidden md:flex w-14 h-14 shrink-0 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-2xl items-center justify-center shadow-lg shadow-teal-600/20">
                    <Bot className="text-white w-7 h-7" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4 w-full min-w-0">
                    <div className="prose prose-sm md:prose-base dark:prose-invert prose-chat max-w-none text-on-surface-variant/80 leading-relaxed font-['Plus_Jakarta_Sans']">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>

                    {/* Sources */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="flex gap-2 flex-wrap pt-2">
                        {message.sources.map((src, i) => (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            key={i}
                            className="inline-flex items-center gap-1.5 bg-white/80 dark:bg-[#1c3030] px-3 py-1.5 rounded-full text-[11px] font-bold border border-emerald-100/40 dark:border-teal-700/25 text-on-surface-variant/60 hover:text-primary hover:border-primary/30 transition-colors shadow-sm"
                          >
                            <Link2 className="w-3 h-3 text-primary" />
                            <span className="truncate max-w-[140px]">{src.title || src.url}</span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Streaming / Thinking state */}
        {isStreaming && (
          <div className="space-y-4">
            <div className="w-full relative overflow-hidden rounded-2xl bg-white/50 dark:bg-[#152626]/60 backdrop-blur-lg border border-white/60 dark:border-teal-700/20 shadow-sm dark:shadow-md dark:shadow-black/10">
              <div className="p-5 md:p-7 flex flex-col md:flex-row gap-5 md:gap-7 items-start">
                {/* Animated Agent Avatar */}
                <div className="hidden md:flex w-14 h-14 shrink-0 bg-gradient-to-br from-teal-600 to-emerald-500 rounded-2xl items-center justify-center shadow-lg shadow-teal-600/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  <Bot className="text-white w-7 h-7 relative z-10" />
                </div>

                <div className="flex-1 space-y-3 w-full min-w-0">
                  {/* Thinking indicator */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-[0.15em]">Thinking</span>
                  </div>

                  {/* Streaming content */}
                  {streamingContent && (
                    <div className="prose prose-sm md:prose-base dark:prose-invert prose-chat max-w-none text-on-surface-variant/80 leading-relaxed font-['Plus_Jakarta_Sans']">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {streamingContent}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div ref={bottomRef} className="h-px" />
    </section>
  );
}
