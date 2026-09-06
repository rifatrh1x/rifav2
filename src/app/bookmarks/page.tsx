import { Bookmark } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getBookmarkedPosts } from "@/lib/queries";
import { Shell } from "@/components/shell";
import { PostGrid } from "@/components/post";
import { EmptyState } from "@/components/empty";

export const dynamic = "force-dynamic";

export default async function BookmarksPage() {
  const me = await requireUser();
  const saved = await getBookmarkedPosts(me.id);

  return (
    <Shell>
      <div className="space-y-4">
        <h1 className="text-xl font-extrabold">Saved posts</h1>
        {saved.length === 0 ? (
          <EmptyState
            icon={<Bookmark />}
            title="Nothing saved yet"
            description="Tap the bookmark on any post to keep it here, privately."
            action={{ href: "/", label: "Browse the feed" }}
          />
        ) : (
          <PostGrid views={saved} meId={me.id} />
        )}
      </div>
    </Shell>
  );
}
