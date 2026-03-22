"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

export function LandingChatInput() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    router.push(`/chat?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-teal-900/5 border border-emerald-100/40 p-3 flex items-center gap-3 hover:shadow-2xl transition-all">
        <div className="flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-emerald-50/50 border-none rounded-xl py-4 px-5 text-[15px] focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all placeholder:text-slate-400 font-medium"
            placeholder="Ask me anything..."
            type="text"
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim()}
          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 active:scale-90 transition-all ${
            query.trim()
              ? "bg-gradient-to-br from-teal-600 to-emerald-500 shadow-md shadow-teal-600/20"
              : "bg-emerald-100/60"
          }`}
        >
          <Send className={`w-5 h-5 ${query.trim() ? "text-white" : "text-emerald-400/40"}`} />
        </button>
      </div>
    </form>
  );
}
