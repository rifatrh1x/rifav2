import Link from "next/link";
import { Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getFeed, getStories } from "@/lib/queries";
import { Shell } from "@/components/shell";
import { Rail } from "@/components/rail";
import { StoryBar } from "@/components/stories";
import { PostGrid } from "@/components/post";
import { QuickComposer, LoadMore } from "@/components/feed-extras";
import { Button } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getCurrentUser();
  const meId = user?.id ?? null;
  const { page } = await searchParams;
  const pageNum = Math.max(1, parseInt(page ?? "1", 10) || 1);
  const pageSize = 10;

  const [views, stories] = await Promise.all([
    getFeed(meId, pageSize + 1, (pageNum - 1) * pageSize),
    getStories(meId),
  ]);

  const hasMore = views.length > pageSize;
  const shown = views.slice(0, pageSize);

  return (
    <Shell rightRail={user ? <Rail meId={user.id} /> : undefined}>
      <div className="space-y-4">
        <StoryBar stories={stories} guest={!user} />

        {user ? (
          <QuickComposer user={{ name: user.name, avatar: user.avatar }} />
        ) : (
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-500 p-5 text-white shadow-lg">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/80">
              <Sparkles className="h-4 w-4" /> Welcome to Rifav
            </p>
            <h2 className="mt-1 text-xl font-extrabold leading-snug">
              Share your world. Find your people.
            </h2>
            <p className="mt-1 text-sm text-white/85">
              Browse posts and stories for free — log in to like, comment, follow,
              and post your own content.
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="/signup">
                <Button variant="primary" size="sm">
                  Create account
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="sm"
                  className="bg-white/15 text-white hover:bg-white/25"
                >
                  Log in
                </Button>
              </Link>
            </div>
          </div>
        )}

        <PostGrid views={shown} meId={meId} />
        {hasMore ? (
          <LoadMore page={pageNum} />
        ) : (
          <p className="py-6 text-center text-sm text-zinc-400">
            You&apos;re all caught up 🎉
          </p>
        )}
      </div>
    </Shell>
  );
}
