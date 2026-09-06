import { requireUser } from "@/lib/auth";
import { Shell } from "@/components/shell";
import { CreatePostForm } from "@/components/composer";

export const dynamic = "force-dynamic";

export default async function UploadPage() {
  await requireUser();
  return (
    <Shell>
      <div className="mb-3">
        <h1 className="text-xl font-extrabold">Create a post</h1>
        <p className="text-sm text-zinc-500">Share a photo, video, or just your thoughts.</p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <CreatePostForm autofocus />
      </div>
    </Shell>
  );
}
