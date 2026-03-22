"use client";

import { useState } from "react";
import { AppSidebar } from "@/components/sidebar";
import { PanelLeft, Settings, HelpCircle } from "lucide-react";
import { useChatStore } from "@/stores/chat-store";

interface ChatShellProps {
  user: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  children: React.ReactNode;
}

export function ChatShell({ user, children }: Readonly<ChatShellProps>) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { activeThreadId, threads } = useChatStore();

  const activeThread = threads.find((t) => t.id === activeThreadId);

  return (
    <div className="bg-background text-on-background font-body min-h-screen flex selection:bg-primary-container">
      <AppSidebar
        user={user}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className={`flex-1 ${sidebarOpen ? "md:ml-72" : ""} flex flex-col h-screen overflow-hidden transition-all duration-300`}>
        {/* Top App Bar */}
        <header className="flex justify-between items-center w-full px-6 md:px-8 h-14 bg-emerald-50/60 dark:bg-[#101e1e]/80 backdrop-blur-xl sticky top-0 z-40 border-b border-emerald-100/40 dark:border-teal-800/30">
          <div className="flex items-center gap-3">
            {!sidebarOpen && (
              <button
                className="p-2 text-emerald-700/50 dark:text-teal-400/40 hover:text-emerald-800 dark:hover:text-teal-300 hover:bg-emerald-100/50 dark:hover:bg-teal-800/20 rounded-xl transition-all mr-1"
                onClick={() => setSidebarOpen(true)}
              >
                <PanelLeft className="h-5 w-5" />
              </button>
            )}
            <h2 className="font-['Plus_Jakarta_Sans'] tracking-tight text-sm font-medium">
              <span className="text-emerald-700/50 dark:text-teal-400/40">Discovery</span>
              <span className="text-emerald-700/30 dark:text-teal-500/20 mx-1.5">/</span>
              <span className="text-emerald-900 dark:text-teal-200 font-semibold">
                {activeThread?.title ?? "New Chat"}
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white dark:border-teal-800 shadow-sm ml-2">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt={user.name ?? "User"} className="w-full h-full object-cover" src={user.image} />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-teal-600 to-emerald-500 text-white font-bold text-xs">
                  {user.name?.charAt(0) ?? "U"}
                </div>
              )}
            </div>
          </div>
        </header>

        {children}

        {/* Ambient blobs */}
        <div className="fixed top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-primary/5 dark:bg-teal-500/3 rounded-full blur-[120px] -z-10 pointer-events-none" />
        <div className="fixed bottom-[5%] left-[10%] w-[30vw] h-[30vw] bg-secondary-container/8 dark:bg-teal-600/3 rounded-full blur-[100px] -z-10 pointer-events-none" />
      </main>
    </div>
  );
}
