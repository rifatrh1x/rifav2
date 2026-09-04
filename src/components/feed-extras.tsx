"use client";

import Link from "next/link";
import { PenLine, ChevronDown } from "lucide-react";
import { useComposerStore } from "@/lib/store";
import { Avatar } from "@/components/ui";

export function QuickComposer({
  user,
}: {
  user: { name: string; avatar: string | null };
}) {
  const setOpen = useComposerStore((s) => s.setOpen);
  return (
    <button
      onClick={() => setOpen(true)}
      className="flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <Avatar name={user.name} src={user.avatar} size="sm" />
      <span className="flex-1 truncate rounded-full bg-zinc-100 px-4 py-2.5 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
        Share something with your community…
      </span>
      <span className="flex items-center gap-1 text-sm font-semibold text-violet-600 dark:text-violet-400">
        <PenLine className="h-4 w-4" /> Post
      </span>
    </button>
  );
}

export function LoadMore({ page }: { page: number }) {
  return (
    <div className="flex justify-center py-2">
      <Link
        href={`/?page=${page + 1}`}
        className="inline-flex items-center gap-1 rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        Load more <ChevronDown className="h-4 w-4" />
      </Link>
    </div>
  );
}
