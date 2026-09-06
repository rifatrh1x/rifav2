import Link from "next/link";
import { Hash, Users, Image as ImageIcon, Video, Sparkles, Search } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  searchAll,
  getFeed,
  getTrendingHashtags,
  getAllUsers,
  type PostView,
} from "@/lib/queries";
import { Shell } from "@/components/shell";
import { SearchBox } from "@/components/search-box";
import { PostGrid } from "@/components/post";
import { EmptyState } from "@/components/empty";
import { FollowButton } from "@/components/follow-button";
import { Avatar, VerifiedBadge } from "@/components/ui";
import { cn, formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "photos", label: "Photos", icon: ImageIcon },
  { id: "videos", label: "Videos", icon: Video },
  { id: "people", label: "People", icon: Users },
];

function PeopleGrid({
  users,
  meId,
}: {
  users: Awaited<ReturnType<typeof getAllUsers>>;
  meId: string | null;
}) {
  const others = meId ? users.filter((u) => u.id !== meId) : users;
  if (others.length === 0)
    return <EmptyState icon={<Users />} title="No users yet" description="Be the first to join!" />;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {others.map((u) => (
        <div
          key={u.id}
          className="flex flex-col items-center rounded-2xl border border-zinc-200 bg-white p-4 text-center dark:border-zinc-800 dark:bg-zinc-900"
        >
          <Link href={`/profile/${u.username}`}>
            <Avatar name={u.name} src={u.avatar} size="lg" />
          </Link>
          <Link
            href={`/profile/${u.username}`}
            className="mt-2 flex items-center gap-1 truncate text-sm font-semibold hover:underline"
          >
            <span className="truncate">{u.name}</span>
            {u.isVerified && <VerifiedBadge className="h-3.5 w-3.5" />}
          </Link>
          <p className="truncate text-xs text-zinc-500">@{u.username}</p>
          <div className="mt-2">
            <FollowButton userId={u.id} initial={false} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PostMasonry({ views }: { views: PostView[] }) {
  if (views.length === 0)
    return <EmptyState icon={<ImageIcon />} title="Nothing here yet" description="Try a different filter." />;
  return (
    <div className="columns-2 gap-3 sm:columns-3 [&>*]:mb-3">
      {views.map((v) => (
        <Link
          key={v.post.id}
          href={`/post/${v.post.id}`}
          className="group relative block overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800"
        >
          {v.post.media[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={v.post.media[0]}
              alt={v.post.caption ?? "Post"}
              loading="lazy"
              className="w-full transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 dark:from-violet-900/20 dark:to-fuchsia-900/20">
              <p className="line-clamp-4 text-sm text-zinc-700 dark:text-zinc-200">
                {v.post.caption}
              </p>
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
            <span className="text-sm font-semibold">♥ {v.post.likes.length}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const me = await getCurrentUser();
  const meId = me?.id ?? null;
  const { q, category } = await searchParams;
  const term = q ?? "";
  const cat = category ?? "all";

  const [allUsers, trending] = await Promise.all([getAllUsers(), getTrendingHashtags()]);
  const searchUsers = allUsers.map((u) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    avatar: u.avatar,
    isVerified: u.isVerified,
  }));

  let body: React.ReactNode;

  if (term) {
    const results = await searchAll(term, meId);
    body = (
      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-zinc-500">
          Results for &ldquo;{term}&rdquo;
        </h2>
        {results.users.length > 0 && (
          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
              <Users className="h-4 w-4 text-violet-500" /> People
            </h3>
            <div className="space-y-2">
              {results.users.map((u) => (
                <Link
                  key={u.id}
                  href={`/profile/${u.username}`}
                  className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
                >
                  <Avatar name={u.name} src={u.avatar} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate text-sm font-semibold">
                      {u.name}
                      {u.isVerified && <VerifiedBadge className="h-3.5 w-3.5" />}
                    </p>
                    <p className="truncate text-xs text-zinc-500">@{u.username}</p>
                  </div>
                  <FollowButton userId={u.id} initial={false} />
                </Link>
              ))}
            </div>
          </section>
        )}
        {results.posts.length > 0 ? (
          <section>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold">
              <ImageIcon className="h-4 w-4 text-violet-500" /> Posts
            </h3>
            <PostGrid views={results.posts} meId={meId} />
          </section>
        ) : (
          results.users.length === 0 && (
            <EmptyState
              icon={<Search />}
              title="No results"
              description={`Nothing found for "${term}". Try another search.`}
            />
          )
        )}
      </div>
    );
  } else {
    const feed = await getFeed(meId, 60, 0);
    let views = feed;
    if (cat === "photos") views = feed.filter((v) => v.post.media.length > 0);
    if (cat === "videos") views = [];

    body = (
      <div className="space-y-6">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {trending.map((t) => (
            <Link
              key={t.tag}
              href={`/explore?q=${encodeURIComponent("#" + t.tag)}`}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-600 hover:border-violet-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <Hash className="h-3.5 w-3.5 text-violet-500" />
              {t.tag}
              <span className="text-zinc-400">{formatCount(t.posts)}</span>
            </Link>
          ))}
        </div>

        <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800/60">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={c.id === "all" ? "/explore" : `/explore?category=${c.id}`}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold transition",
                cat === c.id
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
              )}
            >
              <c.icon className="h-4 w-4" /> {c.label}
            </Link>
          ))}
        </div>

        {cat === "people" ? (
          <PeopleGrid users={allUsers} meId={meId} />
        ) : cat === "videos" ? (
          <EmptyState
            icon={<Video />}
            title="No videos yet"
            description="Video posts will show up here. Try Photos instead!"
          />
        ) : (
          <PostMasonry views={views} />
        )}
      </div>
    );
  }

  return (
    <Shell>
      <div className="space-y-4">
        <SearchBox defaultValue={term} users={searchUsers} />
        {body}
      </div>
    </Shell>
  );
}
