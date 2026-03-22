"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChatArea } from "@/components/chat/chat-area";
import { ChatInput } from "@/components/chat/chat-input";
import { useChatStream } from "@/hooks/use-chat-stream";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { sendMessage } = useChatStream();
  const hasSentRef = useRef(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !hasSentRef.current) {
      hasSentRef.current = true;
      // Clear the query param from the URL without navigation
      router.replace("/chat", { scroll: false });
      // Small delay so the chat UI is mounted before sending
      setTimeout(() => {
        void sendMessage(q);
      }, 300);
    }
  }, [searchParams, router, sendMessage]);

  return (
    <div className="flex h-full flex-col">
      <ChatArea />
      <ChatInput />
    </div>
  );
}
