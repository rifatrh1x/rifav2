import Link from "next/link";
import { ArrowLeft, MessageSquareX } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getChatThread } from "@/lib/queries";
import { Shell } from "@/components/shell";
import { EmptyState } from "@/components/empty";
import { ThreadView } from "@/components/chat";

export const dynamic = "force-dynamic";

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const me = await requireUser();
  const { chatId } = await params;
  const thread = await getChatThread(chatId, me.id);

  return (
    <Shell>
      <Link
        href="/messages"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="h-4 w-4" /> All messages
      </Link>

      {!thread ? (
        <EmptyState
          icon={<MessageSquareX />}
          title="Conversation not found"
          description="This chat may have been removed."
          action={{ href: "/messages", label: "Back to messages" }}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <ThreadView
            chatId={thread.chat.id}
            meId={me.id}
            title={
              thread.chat.type === "group"
                ? thread.chat.name ?? "Group"
                : [...thread.members.values()].find((m) => m.id !== me.id)?.name ?? "Chat"
            }
            members={[...thread.members.values()].filter((m) => m.id !== me.id)}
            messages={thread.messages}
          />
        </div>
      )}
    </Shell>
  );
}
