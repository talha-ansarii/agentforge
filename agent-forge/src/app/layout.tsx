import "@/styles/globals.css";

import { type Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: {
    default: "AgentForge — AI Agent Discovery for Thinkly Labs",
    template: "%s | AgentForge",
  },
  description:
    "Discover the right AI agent for your team. AgentForge helps you find, match, and configure purpose-built AI agents for sales, marketing, support, and more — powered by Thinkly Labs.",
  keywords: [
    "AI agents",
    "agent discovery",
    "Thinkly Labs",
    "AI automation",
    "sales AI",
    "customer support AI",
    "HR automation",
    "marketing AI",
    "enterprise AI",
  ],
  metadataBase: new URL("https://agentforge.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "AgentForge",
    title: "AgentForge — AI Agent Discovery for Thinkly Labs",
    description:
      "Describe your operational bottleneck and get matched with the right AI agent in seconds. 12+ purpose-built agents for every workflow.",
  },
  twitter: {
    card: "summary_large_image",
    title: "AgentForge — AI Agent Discovery",
    description:
      "Describe your bottleneck, get matched with the right AI agent. Powered by Thinkly Labs.",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  manifest: undefined,
};

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className={`${jakarta.variable} ${inter.variable}`}>
        <ThemeProvider>
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
