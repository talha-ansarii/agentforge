import { auth, signIn } from "@/server/auth";
import Link from "next/link";
import { LandingChatInput } from "@/components/landing-chat-input";
import { BarChart3, Megaphone, Bot, Headset, Send, ArrowRight, Zap, Shield } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  const isSignedIn = !!session?.user;

  return (
    <main className="relative min-h-screen flex flex-col bg-gradient-to-b from-emerald-50/80 via-white to-emerald-50/40 dark:from-background dark:via-surface-container-lowest dark:to-background text-slate-900 dark:text-slate-100 selection:bg-primary-container selection:text-on-primary-container overflow-hidden">
      {/* Ambient background elements */}
      <div className="fixed top-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-teal-200/15 dark:bg-teal-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-emerald-200/15 dark:bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-background/80 backdrop-blur-xl border-b border-emerald-100/40 dark:border-white/5">
        <div className="flex justify-between items-center h-16 px-6 md:px-10 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans']">
              AgentForge
            </span>
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">for Thinkly Labs</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
          
          </div>

          {isSignedIn ? (
            <Link
              href="/chat"
              className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 rounded-full text-sm font-bold tracking-tight transition-all active:scale-95 shadow-md shadow-teal-700/15"
            >
              Go to Chat
            </Link>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/chat" });
              }}
            >
              <button
                type="submit"
                className="bg-teal-700 hover:bg-teal-800 text-white px-5 py-2 rounded-full text-sm font-bold tracking-tight transition-all active:scale-95 shadow-md shadow-teal-700/15 cursor-pointer"
              >
                Get Started
              </button>
            </form>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-36 md:pt-44 pb-12 px-6 max-w-5xl mx-auto text-center">
        

        <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-[0.95] mb-7 font-['Plus_Jakarta_Sans']">
          Find the right AI
          <br />
          agent for your team
        </h1>

        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
          Describe your operational pain points. We&apos;ll find the perfect Thinkly Labs AI agent for you.
        </p>

        {isSignedIn ? (
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-7 py-3.5 rounded-full text-sm font-bold tracking-tight transition-all active:scale-95 shadow-lg shadow-teal-700/20 cursor-pointer"
          >
            Start Discovery
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/chat" });
            }}
          >
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white px-7 py-3.5 rounded-full text-sm font-bold tracking-tight transition-all active:scale-95 shadow-lg shadow-teal-700/20 cursor-pointer"
            >
              Start Discovery
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </section>

      {/* ── Bento Conversation Starters ── */}
      <section className="px-6 max-w-5xl mx-auto w-full mb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { text: "I spend too much time on reporting", icon: BarChart3, label: "Try Agent" },
            { text: "Help me automate sales outreach", icon: Megaphone, label: "Try Agent" },
            { text: "What agents do you offer?", icon: Bot, label: "Explore" },
            { text: "I need an AI Chief of Staff", icon: Headset, label: "Try Agent" },
          ].map((card) => {
            const Icon = card.icon;
            const inner = (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100/60 dark:bg-emerald-500/10 flex items-center justify-center">
                    <Icon className="text-teal-700 dark:text-teal-400 w-5 h-5" />
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug mb-4">{card.text}</p>
                <span className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-[0.15em]">{card.label}</span>
              </>
            );

            return isSignedIn ? (
              <Link
                key={card.text}
                href={`/chat?q=${encodeURIComponent(card.text)}`}
                className="group bg-white/60 dark:bg-surface-container-lowest/60 hover:bg-white dark:hover:bg-surface-container-low backdrop-blur-sm p-5 rounded-2xl border border-emerald-100/40 dark:border-white/5 hover:border-emerald-200/60 dark:hover:border-white/10 transition-all duration-200 hover:shadow-lg hover:shadow-teal-900/5 dark:hover:shadow-black/20 active:scale-[0.98] block"
              >
                {inner}
              </Link>
            ) : (
              <form key={card.text} action={async () => { "use server"; await signIn("google", { redirectTo: "/chat" }); }} className="w-full">
                <button type="submit" className="w-full group bg-white/60 dark:bg-surface-container-lowest/60 hover:bg-white dark:hover:bg-surface-container-low backdrop-blur-sm p-5 rounded-2xl border border-emerald-100/40 dark:border-white/5 hover:border-emerald-200/60 dark:hover:border-white/10 transition-all duration-200 hover:shadow-lg hover:shadow-teal-900/5 dark:hover:shadow-black/20 active:scale-[0.98] text-left">
                  {inner}
                </button>
              </form>
            );
          })}
        </div>
      </section>

      {/* ── Chat Input Preview ── */}
      <section className="px-6 max-w-4xl mx-auto w-full mb-20 relative">
        {isSignedIn ? (
          <LandingChatInput />
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/chat" });
            }}
          >
            <div className="bg-white/80 dark:bg-surface-container-low/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-teal-900/5 dark:shadow-black/40 border border-emerald-100/40 dark:border-white/5 p-3 flex items-center gap-3">
              <div className="flex-1">
                <input
                  className="w-full bg-emerald-50/50 dark:bg-background border-none rounded-xl py-4 px-5 text-[15px] focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-surface transition-all placeholder:text-slate-400 font-medium dark:text-slate-200"
                  placeholder="Ask me anything..."
                  type="text"
                />
              </div>
              <button type="submit" className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-600/20 shrink-0 active:scale-90 transition-transform">
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </form>
        )}
        {/* Glow under input */}
        <div className="absolute -z-10 -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-teal-400/10 blur-[60px] rounded-full" />
      </section>

      {/* ── Features / Trust strip ── */}
      <section className="px-6 max-w-5xl mx-auto w-full mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: "Instant Discovery", desc: "Describe your bottleneck and get matched with the right agent in seconds." },
            { icon: Bot, title: "12+ AI Agents", desc: "From Sales SDR to HR Screener, purpose-built agents for every workflow." },
            { icon: Shield, title: "Enterprise Ready", desc: "SOC2 compliant, GDPR ready. Your data stays yours, always." },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="bg-white/50 dark:bg-surface-container-lowest/50 backdrop-blur-sm border border-emerald-100/30 dark:border-white/5 rounded-2xl p-7 hover:bg-white/70 dark:hover:bg-surface-container-low transition-all">
                <div className="w-11 h-11 rounded-xl bg-emerald-100/50 dark:bg-emerald-500/10 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2 font-['Plus_Jakarta_Sans']">{feature.title}</h3>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="w-full mt-auto py-8 border-t border-emerald-100/40 dark:border-white/5 bg-white/40 dark:bg-background/40 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-center items-center px-6 md:px-10 max-w-7xl mx-auto gap-4">
          <div className="text-xs font-medium text-slate-400 dark:text-slate-500">
            Agent Forge for Thinkly Labs
          </div>
        </div>
      </footer>
    </main>
  );
}
