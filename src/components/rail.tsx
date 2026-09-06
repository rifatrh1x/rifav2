import Link from "next/link";
import { TrendingUp, Hash } from "lucide-react";
import { getSuggestions, getTrendingHashtags } from "@/lib/queries";
import { Avatar, VerifiedBadge } from "@/components/ui";
import { FollowButton } from "@/components/follow-button";
import { formatCount } from "@/lib/utils";

export async function Rail({ meId }: { meId: string }) {
  const [suggestions, trending] = await Promise.all([
    getSuggestions(meId, 5),
    getTrendingHashtags(),
  ]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <TrendingUp className="h-4 w-4 text-violet-500" /> Trending now
        </h2>
        <ul className="space-y-1">
          {trending.map((t, i) => (
            <li key={t.tag}>
              <Link
                href={`/explore?q=${encodeURIComponent("#" + t.tag)}`}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                <span className="flex items-center gap-2 text-sm">
                  <span className="w-4 text-xs font-bold text-zinc-400">{i + 1}</span>
                  <span className="font-medium">#{t.tag}</span>
                </span>
                <span className="text-xs text-zinc-400">{formatCount(t.posts)} posts</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-bold">Suggested for you</h2>
        <ul className="space-y-3">
          {suggestions.map((u) => (
            <li key={u.id} className="flex items-center gap-2.5">
              <Link href={`/profile/${u.username}`}>
                <Avatar name={u.name} src={u.avatar} size="sm" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/profile/${u.username}`}
                  className="flex items-center gap-1 truncate text-sm font-semibold hover:underline"
                >
                  <span className="truncate">{u.name}</span>
                  {u.isVerified && <VerifiedBadge className="h-3.5 w-3.5" />}
                </Link>
                <p className="truncate text-xs text-zinc-500">@{u.username}</p>
              </div>
              <FollowButton userId={u.id} initial={false} />
            </li>
          ))}
        </ul>
      </section>

      <footer className="px-2 text-xs leading-relaxed text-zinc-400">
        <p className="flex items-center gap-1">
          <Hash className="h-3 w-3" /> Rifav · A global community for creators
        </p>
        <p>© 2026 Rifav · Terms · Privacy</p>
      </footer>
    </div>
  );
}
