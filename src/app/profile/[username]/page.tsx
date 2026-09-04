import Link from "next/link";
import { Lock, UserX, Grid3X3, MessageSquare, Bookmark } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getProfile, getBookmarkedPosts } from "@/lib/queries";
import { Shell } from "@/components/shell";
import { ProfileHeader, ProfileTabs } from "@/components/profile";
import { EmptyState } from "@/components/empty";
import type { PostView } from "@/lib/queries";

export const dynamic = "force-dynamic";

function PostThumbs({ views }: { views: PostView[] }) {
  if (views.length === 0) {
    return (
      <EmptyState
        icon={<Grid3X3 />}
        title="No posts yet"
        description="Posts will appear here once you share something with the world."
      />
    );
  }
  return (
    <div className="grid grid-cols-3 gap-1 sm:gap-2">
      {views.map((v) => (
        <Link
          key={v.post.id}
          href={`/post/${v.post.id}`}
          className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800"
        >
          {v.post.media[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={v.post.media[0]}
              alt={v.post.caption ?? "Post"}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <p className="line-clamp-5 p-3 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              {v.post.caption}
            </p>
          )}
          {v.post.media.length > 1 && (
            <span className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              <Grid3X3 className="h-3 w-3" /> {v.post.media.length}
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center gap-3 bg-black/0 text-white opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100">
            <span className="flex items-center gap-1 text-sm font-semibold">
              ♥ {v.post.likes.length}
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold">
              <MessageSquare className="h-4 w-4" /> {v.comments.length}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const me = await getCurrentUser();
  const meId = me?.id ?? null;
  const { username } = await params;

  const profile = await getProfile(username, meId);

  if (!profile) {
    return (
      <Shell>
        <EmptyState
          icon={<UserX />}
          title="User not found"
          description={`No account exists with @${username}.`}
          action={{ href: "/explore", label: "Find people" }}
        />
      </Shell>
    );
  }

  if (profile.user.isPrivate && !profile.isMe && !profile.isFollowing) {
    return (
      <Shell>
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <div className="relative h-24 bg-gradient-to-r from-zinc-400 to-zinc-600" />
          <div className="px-5 pb-8 text-center">
            <div className="-mt-10 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-zinc-200 text-2xl dark:border-zinc-900 dark:bg-zinc-700">
                <Lock />
              </div>
            </div>
            <h1 className="mt-3 text-xl font-bold">@{profile.user.username}</h1>
            <p className="mt-2 text-sm text-zinc-500">
              This account is private. Follow them to see their photos and videos.
            </p>
            <p className="mt-4 text-sm">
              <span className="font-bold">{profile.postCount}</span> posts ·{" "}
              <span className="font-bold">{profile.followersCount}</span> followers
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  const saved = profile.isMe && meId ? await getBookmarkedPosts(meId) : [];

  return (
    <Shell>
      <div className="space-y-4">
        <ProfileHeader
          data={{
            user: {
              id: profile.user.id,
              username: profile.user.username,
              name: profile.user.name,
              avatar: profile.user.avatar,
              cover: profile.user.cover,
              bio: profile.user.bio,
              website: profile.user.website,
              isVerified: profile.user.isVerified,
              isPrivate: profile.user.isPrivate,
              isAdmin: profile.user.isAdmin,
              interests: profile.user.interests,
              createdAt: profile.user.createdAt,
            },
            isMe: profile.isMe,
            isFollowing: profile.isFollowing,
            followersCount: profile.followersCount,
            followingCount: profile.followingCount,
            postCount: profile.postCount,
            mutual: profile.mutual,
          }}
        />

        <ProfileTabs
          isMe={profile.isMe}
          posts={<PostThumbs views={profile.posts} />}
          saved={
            <PostThumbs views={saved} />
          }
          tagged={
            <EmptyState
              icon={<Bookmark />}
              title="No tagged posts"
              description="Photos you're tagged in will show up here."
            />
          }
        />
      </div>
    </Shell>
  );
}
