"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Flag,
  EyeOff,
} from "lucide-react";
import {
  toggleLikeAction,
  toggleBookmarkAction,
  addCommentAction,
  deletePostAction,
  deleteCommentAction,
  toggleFollowAction,
} from "@/lib/actions";
import {
  cn,
  timeAgo,
  formatCount,
  renderCaption,
  isTokenHashtag,
  isTokenMention,
} from "@/lib/utils";
import { useToastStore } from "@/lib/store";
import { Avatar, Button, VerifiedBadge, Spinner } from "@/components/ui";
import type { PostView } from "@/lib/queries";

function RichCaption({ text }: { text: string }) {
  const tokens = renderCaption(text);
  return (
    <>
      {tokens.map((t, i) => {
        if (isTokenHashtag(t))
          return (
            <Link
              key={i}
              href={`/explore?q=${encodeURIComponent(t)}`}
              className="font-medium text-violet-600 hover:underline dark:text-violet-400"
            >
              {t}
            </Link>
          );
        if (isTokenMention(t))
          return (
            <Link
              key={i}
              href={`/profile/${t.slice(1)}`}
              className="font-medium text-violet-600 hover:underline dark:text-violet-400"
            >
              {t}
            </Link>
          );
        return <span key={i}>{t}</span>;
      })}
    </>
  );
}

function MediaCarousel({ media }: { media: string[] }) {
  const [idx, setIdx] = useState(0);
  if (media.length === 0) return null;
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-zinc-900">
      <div
        className="flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {media.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt="Post media"
            loading="lazy"
            className="h-full w-full shrink-0 object-cover"
          />
        ))}
      </div>
      {media.length > 1 && (
        <>
          <button
            aria-label="Previous image"
            onClick={() => setIdx((i) => (i - 1 + media.length) % media.length)}
            className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Next image"
            onClick={() => setIdx((i) => (i + 1) % media.length)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {media.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === idx ? "w-4 bg-white" : "w-1.5 bg-white/50",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Actions({
  view,
  meId,
  onToggleComments,
  showComments,
}: {
  view: PostView;
  meId: string | null;
  onToggleComments: () => void;
  showComments: boolean;
}) {
  const router = useRouter();
  const toast = useToastStore((s) => s.toast);
  const [pending, startTransition] = useTransition();
  const [liked, setLiked] = useState(view.meLiked);
  const [likeCount, setLikeCount] = useState(view.post.likes.length);
  const [saved, setSaved] = useState(view.meBookmarked);
  const [menu, setMenu] = useState(false);

  const requireLogin = () => {
    toast("Log in to interact with posts", "info");
    router.push("/login");
  };

  const doLike = () => {
    if (!meId) return requireLogin();
    setLiked((v) => !v);
    setLikeCount((c) => c + (liked ? -1 : 1));
    startTransition(async () => {
      const res = await toggleLikeAction(view.post.id);
      if (res && res.loginRequired) return requireLogin();
      router.refresh();
    });
  };

  const doSave = () => {
    if (!meId) return requireLogin();
    setSaved((v) => !v);
    startTransition(async () => {
      const res = await toggleBookmarkAction(view.post.id);
      router.refresh();
      if (res && !("error" in res)) {
        toast(res.bookmarked ? "Saved to your collection" : "Removed from saved");
      }
    });
  };

  const doShare = async () => {
    const url = `${window.location.origin}/post/${view.post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Link copied to clipboard");
    } catch {
      toast("Couldn't copy link", "error");
    }
  };

  const doDelete = () => {
    if (!confirm("Delete this post permanently?")) return;
    startTransition(async () => {
      await deletePostAction(view.post.id);
      toast("Post deleted");
      router.refresh();
    });
  };

  return (
    <div className="relative">
      <div className="mt-1 flex items-center">
        <motion.button
          whileTap={{ scale: 1.4 }}
          onClick={doLike}
          aria-label="Like"
          className="group flex h-10 w-10 items-center justify-center"
        >
          <AnimatePresence>
            <Heart
              key={liked ? "on" : "off"}
              className={cn(
                "h-6 w-6 transition-colors",
                liked
                  ? "fill-rose-500 text-rose-500"
                  : "text-zinc-700 group-hover:text-rose-500 dark:text-zinc-300",
              )}
            />
          </AnimatePresence>
        </motion.button>
        <button
          onClick={onToggleComments}
          aria-label="Comments"
          className="flex h-10 w-10 items-center justify-center text-zinc-700 dark:text-zinc-300"
        >
          <MessageCircle
            className={cn("h-6 w-6", showComments && "fill-violet-500 text-violet-500")}
          />
        </button>
        <button
          onClick={doShare}
          aria-label="Share"
          className="flex h-10 w-10 items-center justify-center text-zinc-700 dark:text-zinc-300"
        >
          <Share2 className="h-6 w-6" />
        </button>
        <div className="ml-auto flex items-center">
          <motion.button
            whileTap={{ scale: 1.3 }}
            onClick={doSave}
            aria-label="Save"
            className="flex h-10 w-10 items-center justify-center"
          >
            <Bookmark
              className={cn(
                "h-6 w-6",
                saved
                  ? "fill-amber-400 text-amber-400"
                  : "text-zinc-700 dark:text-zinc-300",
              )}
            />
          </motion.button>
          <div className="relative">
            <button
              onClick={() => setMenu((v) => !v)}
              aria-label="More options"
              className="flex h-10 w-8 items-center justify-center text-zinc-700 dark:text-zinc-300"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
            <AnimatePresence>
              {menu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                >
                  {view.post.userId === meId ? (
                    <button
                      onClick={doDelete}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    >
                      <Trash2 className="h-4 w-4" /> Delete post
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          toast("Post reported. Thanks for keeping Rifav safe", "info");
                          setMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >
                        <Flag className="h-4 w-4" /> Report
                      </button>
                      <button
                        onClick={() => {
                          toast("Post hidden from your feed", "info");
                          setMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      >
                        <EyeOff className="h-4 w-4" /> Hide post
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <p className="px-4 text-sm font-semibold">{formatCount(likeCount)} likes</p>
      {pending && (
        <Spinner className="absolute -right-1 top-0 h-4 w-4 border-2" />
      )}
    </div>
  );
}

function Comments({ view, meId }: { view: PostView; meId: string | null }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const visible = showAll ? view.comments : view.comments.slice(0, 2);

  const submit = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    await addCommentAction(view.post.id, text);
    setText("");
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="border-t border-zinc-100 px-4 pb-3 pt-2 dark:border-zinc-800">
      {view.comments.length > 2 && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="mb-1 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
        >
          {showAll
            ? "Hide comments"
            : `View all ${view.comments.length} comments`}
        </button>
      )}
      <div className="space-y-2">
        {visible.map((c) => (
          <div key={c.id} className="flex items-start gap-2">
            <Avatar name={c.user.name} src={c.user.avatar} size="xs" />
            <div className="min-w-0 flex-1">
              <p className="text-xs leading-relaxed">
                <Link
                  href={`/profile/${c.user.username}`}
                  className="font-semibold hover:underline"
                >
                  {c.user.username}
                </Link>{" "}
                {c.text}
              </p>
              <p className="text-[10px] text-zinc-400">{timeAgo(c.createdAt)}</p>
            </div>
            {c.user.id === meId && (
              <button
                aria-label="Delete comment"
                onClick={async () => {
                  await deleteCommentAction(c.id);
                  router.refresh();
                }}
                className="text-zinc-300 hover:text-rose-500 dark:text-zinc-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
      {meId ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="mt-2 flex items-center gap-2"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            className="h-9 flex-1 rounded-full border border-zinc-200 bg-transparent px-3 text-sm outline-none focus:border-violet-500 dark:border-zinc-700"
          />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={!text.trim() || busy}
          >
            Post
          </Button>
        </form>
      ) : (
        <Link href="/login" className="mt-2 text-xs font-medium text-violet-500">
          Log in to comment
        </Link>
      )}
    </div>
  );
}

export function PostCard({
  view,
  meId,
  showComments = false,
}: {
  view: PostView;
  meId: string | null;
  showComments?: boolean;
}) {
  const [commentsOpen, setCommentsOpen] = useState(showComments);
  const router = useRouter();
  const toast = useToastStore((s) => s.toast);
  const [following, setFollowing] = useState(view.isFollowing);

  const follow = async () => {
    if (!meId) {
      toast("Log in to follow people", "info");
      router.push("/login");
      return;
    }
    setFollowing((v) => !v);
    const res = await toggleFollowAction(view.author.id);
    router.refresh();
    if (res && res.loginRequired) {
      toast("Log in to follow people", "info");
      router.push("/login");
      return;
    }
    if (res && typeof res.following === "boolean") setFollowing(res.following);
    else if (res && res.error) toast(res.error, "error");
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-3 px-4 py-3">
        <Link href={`/profile/${view.author.username}`}>
          <Avatar name={view.author.name} src={view.author.avatar} size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <Link
              href={`/profile/${view.author.username}`}
              className="truncate text-sm font-semibold hover:underline"
            >
              {view.author.name}
            </Link>
            {view.author.isVerified && <VerifiedBadge />}
          </div>
          <p className="truncate text-xs text-zinc-500">
            @{view.author.username} · {timeAgo(view.post.createdAt)}
          </p>
        </div>
        {view.author.id !== meId && meId && (
          <Button size="sm" variant={following ? "secondary" : "gradient"} onClick={follow}>
            {following ? "Following" : "Follow"}
          </Button>
        )}
      </div>

      {view.post.media.length > 0 ? (
        <MediaCarousel media={view.post.media} />
      ) : (
        <div className="px-4 pb-1 text-[15px] leading-relaxed">
          <RichCaption text={view.post.caption ?? ""} />
        </div>
      )}

      <Actions
        view={view}
        meId={meId}
        showComments={commentsOpen}
        onToggleComments={() => setCommentsOpen((v) => !v)}
      />

      {(view.post.caption || view.post.location) && view.post.media.length > 0 && (
        <div className="px-4 pb-3 text-sm leading-relaxed">
          {view.post.caption && <RichCaption text={view.post.caption} />}
          {view.post.location && (
            <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
              <MapPin className="h-3.5 w-3.5" /> {view.post.location}
            </p>
          )}
        </div>
      )}

      {commentsOpen && <Comments view={view} meId={meId} />}
    </article>
  );
}

export function PostGrid({ views, meId }: { views: PostView[]; meId: string | null }) {
  return (
    <div className="space-y-4">
      {views.map((v) => (
        <PostCard key={v.post.id} view={v} meId={meId} />
      ))}
    </div>
  );
}
