import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { ChatShell } from "@/components/chat-shell";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/");

  return (
    <ChatShell user={session.user}>
      {children}
    </ChatShell>
  );
}
