"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Avatar, VerifiedBadge } from "@/components/ui";
import { TRENDING_TAGS } from "@/lib/constants";

export interface SearchUser {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  isVerified: boolean;
}

export function SearchBox({
  defaultValue,
  users,
}: {
  defaultValue: string;
  users: SearchUser[];
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return [];
    if (q.startsWith("#")) {
      const partial = q.slice(1);
      return TRENDING_TAGS.filter((t) => t.tag.startsWith(partial))
        .slice(0, 5)
        .map((t) => ({ type: "tag" as const, tag: t.tag, label: `#${t.tag}` }));
    }
    return users
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q),
      )
      .slice(0, 6)
      .map((u) => ({ type: "user" as const, user: u }));
  }, [value, users]);

  const submit = () => {
    if (value.trim()) router.push(`/explore?q=${encodeURIComponent(value.trim())}`);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2.5 shadow-sm focus-within:border-violet-500 dark:border-zinc-800 dark:bg-zinc-900">
        <Search className="h-5 w-5 shrink-0 text-zinc-400" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Search people, hashtags…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
        />
        {value && (
          <button
            onClick={() => {
              setValue("");
              router.push("/explore");
            }}
            aria-label="Clear"
            className="text-zinc-400 hover:text-zinc-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {focused && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-2xl border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
          {suggestions.map((s, i) =>
            s.type === "tag" ? (
              <button
                key={`t${i}`}
                onClick={() => router.push(`/explore?q=${encodeURIComponent(s.label)}`)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-900/40">
                  #
                </span>
                <span className="text-sm font-medium">{s.label}</span>
              </button>
            ) : (
              <button
                key={s.user.id}
                onClick={() => router.push(`/profile/${s.user.username}`)}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <Avatar name={s.user.name} src={s.user.avatar} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 truncate text-sm font-semibold">
                    {s.user.name}
                    {s.user.isVerified && <VerifiedBadge className="h-3.5 w-3.5" />}
                  </span>
                  <span className="block truncate text-xs text-zinc-500">
                    @{s.user.username}
                  </span>
                </span>
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
