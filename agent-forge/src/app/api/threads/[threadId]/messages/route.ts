import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId } = await params;

    // Verify thread ownership
    const thread = await db.chatThread.findFirst({
      where: { id: threadId, userId: session.user.id },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const body = (await req.json()) as {
      userMessage: {
        id: string;
        role: string;
        content: string;
        createdAt: string;
      };
      assistantMessage: {
        id: string;
        role: string;
        content: string;
        sources?: { url: string; title: string }[];
        createdAt: string;
      };
    };

    // Create both messages in a transaction
    await db.$transaction([
      db.message.create({
        data: {
          threadId,
          role: body.userMessage.role,
          content: body.userMessage.content,
        },
      }),
      db.message.create({
        data: {
          threadId,
          role: body.assistantMessage.role,
          content: body.assistantMessage.content,
          sources: body.assistantMessage.sources ?? undefined,
        },
      }),
      db.chatThread.update({
        where: { id: threadId },
        data: { updatedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to save messages:", error);
    return NextResponse.json(
      { error: "Failed to save messages" },
      { status: 500 },
    );
  }
}
