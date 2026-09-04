import Link from "next/link";
import { ArrowLeft, FileX2 } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getPostDetail } from "@/lib/queries";
import { Shell } from "@/components/shell";
import { PostCard } from "@/components/post";
import { EmptyState } from "@/components/empty";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getCurrentUser();
  const { id } = await params;
  const view = await getPostDetail(id, me?.id ?? null);

  return (
    <Shell>
      <Link
        href="/"
        className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      {view ? (
        <PostCard view={view} meId={me?.id ?? null} showComments />
      ) : (
        <EmptyState
          icon={<FileX2 />}
          title="Post not found"
          description="This post may have been deleted."
          action={{ href: "/", label: "Go home" }}
        />
      )}
    </Shell>
  );
}
