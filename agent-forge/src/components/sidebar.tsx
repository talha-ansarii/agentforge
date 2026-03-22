"use client";

import { useEffect, useCallback } from "react";
import { useChatStore, type ChatThread, type ChatMessage } from "@/stores/chat-store";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { X, MessageSquare, Plus, Moon, Sun, LogOut, Sparkles } from "lucide-react";

interface AppSidebarProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ user: _user, isOpen, onClose }: Readonly<AppSidebarProps>) {
  const { theme, setTheme } = useTheme();
  const {
    threads,
    activeThreadId,
    isLoadingThreads,
    setThreads,
    setActiveThreadId,
    setMessages,
    setIsLoadingThreads,
    setIsLoadingMessages,
  } = useChatStore();

  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoadingThreads(true);
      try {
        const res = await fetch("/api/threads");
        if (res.status === 401) {
          toast.error("Session expired", { description: "Please sign in again to continue." });
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch threads");
        const data = (await res.json()) as ChatThread[];
        setThreads(data);
      } catch {
        toast.error("Couldn't load your chats", { description: "Please check your connection and try refreshing." });
      } finally {
        setIsLoadingThreads(false);
      }
    };
    void fetchThreads();
  }, [setThreads, setIsLoadingThreads]);

  const handleNewChat = useCallback(async () => {
    try {
      const res = await fetch("/api/threads", { method: "POST" });
      if (res.status === 401) {
        toast.error("Session expired", { description: "Please sign in again to start a new chat." });
        return;
      }
      if (!res.ok) throw new Error("Failed to create thread");
      const thread = (await res.json()) as ChatThread;
      setThreads([thread, ...threads]);
      setActiveThreadId(thread.id);
      setMessages([]);
    } catch {
      toast.error("Couldn't create new chat", { description: "Please try again in a moment." });
    }
  }, [threads, setThreads, setActiveThreadId, setMessages]);

  const handleSelectThread = useCallback(async (threadId: string) => {
    if (threadId === useChatStore.getState().activeThreadId) return;
    setActiveThreadId(threadId);
    setMessages([]);
    setIsLoadingMessages(true);
    try {
      const [res] = await Promise.all([
        fetch(`/api/threads/${threadId}`),
        new Promise((r) => setTimeout(r, 400)),
      ]);
      if (res.status === 401) {
        toast.error("Session expired", { description: "Please sign in again to view this chat." });
        return;
      }
      if (res.status === 404) {
        toast.error("Chat not found", { description: "This conversation may have been deleted." });
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = (await res.json()) as { messages: ChatMessage[] };
      setMessages(data.messages);
    } catch {
      toast.error("Couldn't load messages", { description: "Please try selecting the chat again." });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [setActiveThreadId, setMessages, setIsLoadingMessages]);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black/20 dark:bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside className={`fixed left-0 top-0 h-screen w-72 flex flex-col py-6 px-5 bg-emerald-50/90 dark:bg-[#101e1e]/95 backdrop-blur-2xl rounded-r-[2rem] z-50 shadow-[0_20px_60px_rgba(0,60,50,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] transition-transform duration-300 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:hidden"
      }`}>
        {/* Logo Header */}
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-600/25 dark:shadow-teal-500/15">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-extrabold tracking-tight text-emerald-900 dark:text-emerald-200 leading-none font-['Plus_Jakarta_Sans']">
              Project Log
            </h1>
            <p className="text-[9px] uppercase tracking-[0.2em] text-emerald-600/60 dark:text-teal-400/40 font-bold mt-0.5">
              Recent Threads
            </p>
          </div>
          <button className="md:hidden p-1.5 text-emerald-700/50 dark:text-teal-400/40 hover:bg-emerald-200/50 dark:hover:bg-teal-800/30 rounded-lg transition-colors" onClick={onClose}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Thread List */}
        <nav className="flex flex-col gap-0.5 flex-grow overflow-y-auto">
          {isLoadingThreads ? (
            <div className="space-y-2 px-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3 px-3 py-3 animate-pulse">
                  <div className="w-4 h-4 rounded-full bg-emerald-200/60 dark:bg-teal-700/40 shrink-0 mt-0.5" />
                  <div className="h-4 rounded-full bg-emerald-200/50 dark:bg-teal-700/30" style={{ width: `${85 - i * 12}%` }} />
                </div>
              ))}
            </div>
          ) : threads.length === 0 ? (
            <div className="px-3 py-12 text-center">
              <MessageSquare className="w-8 h-8 text-emerald-600/20 dark:text-teal-500/20 mx-auto mb-3" />
              <p className="text-xs text-emerald-700/40 dark:text-teal-400/30 font-medium">No conversations yet</p>
            </div>
          ) : (
            threads.map((thread) => {
              const isActive = thread.id === activeThreadId;
              return (
                <button
                  key={thread.id}
                  onClick={() => handleSelectThread(thread.id)}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 w-full text-left cursor-pointer ${
                    isActive
                      ? "bg-emerald-200/50 dark:bg-teal-800/40 text-emerald-900 dark:text-teal-200 font-semibold border-l-[3px] border-emerald-600 dark:border-teal-400 rounded-l-lg"
                      : "text-emerald-800/60 dark:text-teal-300/50 hover:bg-emerald-100/60 dark:hover:bg-teal-800/20 font-medium hover:translate-x-0.5"
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-700 dark:text-teal-300" : "text-emerald-600/30 dark:text-teal-500/30"}`} />
                  <span className="text-[13px] truncate">{thread.title}</span>
                </button>
              );
            })
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto flex flex-col gap-2 pt-5 border-t border-emerald-200/30 dark:border-teal-700/20">
          <button
            onClick={handleNewChat}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-700 to-emerald-600 hover:from-teal-600 hover:to-emerald-500 text-white font-bold text-sm tracking-tight shadow-lg shadow-teal-700/20 dark:shadow-teal-600/15 active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex items-center gap-3 px-3 py-2 text-emerald-700/50 dark:text-teal-400/50 text-[13px] hover:bg-emerald-100/50 dark:hover:bg-teal-800/20 rounded-lg transition-all w-full font-medium cursor-pointer"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 px-3 py-2 text-emerald-700/50 dark:text-teal-400/50 text-[13px] hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all w-full font-medium cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
