"use client";

import { useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { useChatStream } from "@/hooks/use-chat-stream";
import { toast } from "sonner";
import { useChatStore } from "@/stores/chat-store";
import { Square, Send } from "lucide-react";

export function ChatInput() {
  const [input, setInput] = useState("");
  const { isStreaming } = useChatStore();
  const { sendMessage, stopStreaming } = useChatStream();

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;

    setInput("");
    try {
      await sendMessage(trimmed);
    } catch {
      setInput(trimmed);
      toast.error("Failed to send message");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const hasInput = input.trim().length > 0;

  return (
    <footer className="px-4 md:px-8 pb-5 pt-2 bg-gradient-to-t from-background via-background/95 to-transparent relative z-30 shrink-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end w-full bg-white/80 dark:bg-[#152626]/80 backdrop-blur-xl border border-emerald-100/40 dark:border-teal-700/25 rounded-2xl shadow-lg shadow-emerald-900/5 dark:shadow-black/15 transition-all">
          <TextareaAutosize
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            minRows={1}
            maxRows={5}
            placeholder="Type to ask about AI agents..."
            className="flex-1 w-full bg-transparent border-none py-4 px-5 text-on-surface placeholder:text-emerald-700/30 dark:placeholder:text-teal-400/25 font-medium text-[15px] resize-none focus:ring-0 focus:outline-none leading-relaxed"
          />

          <div className="flex items-center p-2.5 shrink-0">
            {isStreaming ? (
              <button
                onClick={stopStreaming}
                className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-all shadow-md"
                aria-label="Stop generating"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!hasInput}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  hasInput
                    ? "bg-gradient-to-r from-teal-600 to-emerald-500 text-white shadow-lg shadow-teal-600/25 hover:shadow-xl active:scale-90"
                    : "bg-emerald-100/50 dark:bg-teal-800/30 text-emerald-400/40 dark:text-teal-500/30 cursor-default"
                }`}
                aria-label="Send message"
              >
                <Send className="w-[18px] h-[18px]" />
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}
