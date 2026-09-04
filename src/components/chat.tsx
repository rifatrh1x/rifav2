"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, Search, Send, Users, CheckCheck, Smile } from "lucide-react";
import { startChatAction, createGroupAction, sendMessageAction } from "@/lib/actions";
import { useToastStore } from "@/lib/store";
import { Avatar, Button, Input, VerifiedBadge, Spinner } from "@/components/ui";
import { cn, timeAgo } from "@/lib/utils";
import type { AuthorRef } from "@/lib/queries";

export interface ChatUser {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  isVerified: boolean;
}

export function NewChatButton({ users }: { users: ChatUser[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Send className="h-4 w-4" /> New
      </Button>
      <AnimatePresence>
        {open && <NewChatModal users={users} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

export function NewChatModal({
  users,
  onClose,
}: {
  users: ChatUser[];
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToastStore((s) => s.toast);
  const [query, setQuery] = useState("");
  const [groupMode, setGroupMode] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter(
      (u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q),
    );
  }, [users, query]);

  const start = async (id: string) => {
    setBusy(true);
    const res = await startChatAction(id);
    setBusy(false);
    if (res.chatId) {
      onClose();
      router.push(`/messages/${res.chatId}`);
    } else if (res.error) toast(res.error, "error");
  };

  const createGroup = async () => {
    if (!groupName.trim() || members.length === 0) {
      toast("Add a group name and at least one member", "error");
      return;
    }
    setBusy(true);
    const fd = new FormData();
    fd.set("name", groupName);
    fd.set("memberIds", JSON.stringify(members));
    const res = await createGroupAction(fd);
    setBusy(false);
    if (res.error) toast(res.error, "error");
    else {
      toast("Group created 🎉");
      onClose();
      router.push("/messages");
      router.refresh();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-white dark:bg-zinc-900 sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
          <h2 className="text-base font-bold">New message</h2>
          <button onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people…"
              className="pl-9"
            />
          </div>
          <button
            onClick={() => setGroupMode((v) => !v)}
            className={cn(
              "mt-3 flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition",
              groupMode
                ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                : "border-zinc-200 dark:border-zinc-700",
            )}
          >
            <Users className="h-4 w-4 text-violet-500" /> Create a group
          </button>

          {groupMode && (
            <div className="mt-3 space-y-2">
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name"
              />
              <p className="text-xs text-zinc-500">
                {members.length} member{members.length !== 1 && "s"} selected
              </p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {filtered.map((u) => (
            <button
              key={u.id}
              onClick={() => (groupMode ? setMembers((m) => (m.includes(u.id) ? m.filter((x) => x !== u.id) : [...m, u.id].slice(0, 49))) : start(u.id))}
              disabled={busy}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-zinc-50 disabled:opacity-50 dark:hover:bg-zinc-800"
            >
              <Avatar name={u.name} src={u.avatar} size="md" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 truncate text-sm font-semibold">
                  {u.name}
                  {u.isVerified && <VerifiedBadge className="h-3.5 w-3.5" />}
                </span>
                <span className="block truncate text-xs text-zinc-500">@{u.username}</span>
              </span>
              {groupMode && (
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border text-xs",
                    members.includes(u.id)
                      ? "border-violet-600 bg-violet-600 text-white"
                      : "border-zinc-300 dark:border-zinc-600",
                  )}
                >
                  {members.includes(u.id) && "✓"}
                </span>
              )}
            </button>
          ))}
        </div>

        {groupMode && (
          <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
            <Button className="w-full" onClick={createGroup} disabled={busy}>
              {busy ? <Spinner className="border-white/40 border-t-white" /> : "Create group"}
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export interface ThreadMessage {
  m: { id: string; senderId: string; content: string; createdAt: Date | string };
  sender: AuthorRef | null;
}

export function ThreadView({
  chatId,
  meId,
  title,
  members,
  messages,
}: {
  chatId: string;
  meId: string;
  title: string;
  members: AuthorRef[];
  messages: ThreadMessage[];
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    const t = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(t);
  }, [router]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    await sendMessageAction(chatId, text);
    setText("");
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col lg:h-[calc(100vh-3rem)]">
      <div className="flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
        <Avatar
          name={title}
          src={members.length === 1 ? members[0].avatar : undefined}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold">{title}</p>
          <p className="flex items-center gap-1 text-xs text-emerald-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {members.length > 1 ? `${members.length} members` : "Online"}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map(({ m, sender }) => {
          const mine = m.senderId === meId;
          return (
            <div key={m.id} className={cn("flex items-end gap-2", mine && "flex-row-reverse")}>
              {!mine && <Avatar name={sender?.name ?? "?"} src={sender?.avatar} size="xs" />}
              <div className={cn("max-w-[75%] space-y-1", mine && "items-end")}>
                <div
                  className={cn(
                    "rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    mine
                      ? "rounded-br-md bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
                      : "rounded-bl-md bg-zinc-100 dark:bg-zinc-800",
                  )}
                >
                  {m.content}
                </div>
                <p className={cn("flex items-center gap-1 text-[10px] text-zinc-400", mine && "justify-end")}>
                  {timeAgo(m.createdAt)}
                  {mine && <CheckCheck className="h-3 w-3 text-sky-500" />}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className="flex items-center gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
        <button
          type="button"
          aria-label="Emoji"
          className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Smile className="h-5 w-5" />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message…"
          className="h-10 flex-1 rounded-full border border-zinc-200 bg-transparent px-4 text-sm outline-none focus:border-violet-500 dark:border-zinc-700"
        />
        <button
          type="submit"
          disabled={!text.trim() || busy}
          aria-label="Send"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}
