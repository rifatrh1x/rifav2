import Link from "next/link";
import { Bell, Heart, MessageCircle, UserPlus, AtSign, MessageSquareText } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getNotifications } from "@/lib/queries";
import { Shell } from "@/components/shell";
import { EmptyState } from "@/components/empty";
import { Avatar, VerifiedBadge } from "@/components/ui";
import { MarkAllReadButton } from "@/components/notif-button";
import { timeAgo, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TYPE_META = {
  like: { icon: Heart, color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30", verb: "liked your post" },
  comment: { icon: MessageCircle, color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30", verb: "commented on your post" },
  follow: { icon: UserPlus, color: "bg-sky-100 text-sky-600 dark:bg-sky-900/30", verb: "started following you" },
  message: { icon: MessageSquareText, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30", verb: "sent you a message" },
  mention: { icon: AtSign, color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30", verb: "mentioned you" },
};

export default async function NotificationsPage() {
  const me = await requireUser();
  const notifs = await getNotifications(me.id);
  const unreadCount = notifs.filter((x) => !x.n.read).length;

  return (
    <Shell>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold">Notifications</h1>
          <MarkAllReadButton disabled={unreadCount === 0} />
        </div>

        {notifs.length === 0 ? (
          <EmptyState
            icon={<Bell />}
            title="No notifications yet"
            description="When someone likes, comments, or follows you, it will show up here."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            {notifs.map(({ n, actor, post }) => {
              const meta = TYPE_META[n.type as keyof typeof TYPE_META] ?? TYPE_META.like;
              const Icon = meta.icon;
              const href = n.type === "follow" && actor
                ? `/profile/${actor.username}`
                : n.type === "message"
                  ? "/messages"
                  : n.postId
                    ? `/post/${n.postId}`
                    : "#";
              const body = (
                <div
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 transition hover:bg-zinc-50 dark:hover:bg-zinc-800/60",
                    !n.read && "bg-violet-50/60 dark:bg-violet-900/10",
                  )}
                >
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", meta.color)}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    {actor ? (
                      <div className="flex items-center gap-2">
                        <Avatar name={actor.name} src={actor.avatar} size="xs" />
                        <p className="text-sm">
                          <Link href={`/profile/${actor.username}`} className="font-semibold hover:underline">
                            {actor.name}
                          </Link>{" "}
                          <span className="text-zinc-600 dark:text-zinc-300">{meta.verb}</span>
                        </p>
                        {actor.isVerified && <VerifiedBadge className="h-3.5 w-3.5" />}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-600 dark:text-zinc-300">{meta.verb}</p>
                    )}
                    {post?.caption && (
                      <p className="mt-1 line-clamp-1 text-xs text-zinc-400">&ldquo;{post.caption}&rdquo;</p>
                    )}
                    <p className="mt-1 text-xs text-zinc-400">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-500" />}
                </div>
              );
              return href === "#" ? (
                <div key={n.id}>{body}</div>
              ) : (
                <Link key={n.id} href={href} className="block">
                  {body}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}
