import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getChats, getAllUsers } from "@/lib/queries";
import { Shell } from "@/components/shell";
import { EmptyState } from "@/components/empty";
import { Avatar, VerifiedBadge } from "@/components/ui";
import { NewChatButton } from "@/components/chat";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  const me = await requireUser();
  const [chats, allUsers] = await Promise.all([getChats(me.id), getAllUsers()]);

  const chatUsers = allUsers
    .filter((u) => u.id !== me.id)
    .map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      avatar: u.avatar,
      isVerified: u.isVerified,
    }));

  return (
    <Shell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold">Messages</h1>
          <NewChatButton users={chatUsers} />
        </div>

        {chats.length === 0 ? (
          <EmptyState
            icon={<MessageSquareText />}
            title="No conversations yet"
            description="Start a chat with someone to see messages here."
            action={{ href: "/explore?category=people", label: "Find people" }}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {chats.map(({ chat, other, lastMessageAt, preview }) => {
              const name = chat.type === "group" ? chat.name ?? "Group" : other?.name ?? "User";
              return (
                <Link
                  key={chat.id}
                  href={`/messages/${chat.id}`}
                  className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3.5 transition last:border-0 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/60"
                >
                  <div className="relative">
                    <Avatar name={name} src={chat.type === "group" ? null : other?.avatar} size="md" />
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-900" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate text-sm font-semibold">
                      {name}
                      {chat.type === "group" ? (
                        <span className="rounded bg-zinc-100 px-1.5 text-[10px] font-semibold text-zinc-500 dark:bg-zinc-800">
                          Group
                        </span>
                      ) : (
                        other?.isVerified && <VerifiedBadge className="h-3.5 w-3.5" />
                      )}
                    </p>
                    <p className="truncate text-xs text-zinc-500">{preview}</p>
                  </div>
                  <span className="shrink-0 text-xs text-zinc-400">{timeAgo(lastMessageAt)}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
