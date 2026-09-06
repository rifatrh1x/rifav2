import { redirect } from "next/navigation";
import { ShieldAlert, Users, FileImage, MessageCircle, GitBranch } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getAdminStats, getAllUsers } from "@/lib/queries";
import { Shell } from "@/components/shell";
import { Avatar, VerifiedBadge } from "@/components/ui";
import { VerifyButton, BanButton } from "@/components/admin-actions";
import { formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const me = await requireUser();
  if (!me.isAdmin) redirect("/");

  const [stats, users] = await Promise.all([getAdminStats(), getAllUsers()]);

  const cards = [
    { label: "Total users", value: stats.users, icon: Users, color: "from-violet-500 to-fuchsia-500" },
    { label: "Total posts", value: stats.posts, icon: FileImage, color: "from-pink-500 to-rose-500" },
    { label: "Comments", value: stats.comments, icon: MessageCircle, color: "from-sky-500 to-indigo-500" },
    { label: "Follow links", value: stats.follows, icon: GitBranch, color: "from-emerald-500 to-teal-500" },
  ];

  return (
    <Shell>
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-violet-500" />
          <h1 className="text-xl font-extrabold">Admin dashboard</h1>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white`}>
                <c.icon className="h-4 w-4" />
              </div>
              <p className="text-2xl font-extrabold">{formatCount(c.value)}</p>
              <p className="text-xs text-zinc-500">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="border-b border-zinc-100 px-4 py-3 text-sm font-bold text-zinc-500 dark:border-zinc-800">
            Users ({users.length})
          </h2>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={u.name} src={u.avatar} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1 truncate text-sm font-semibold">
                    {u.name}
                    {u.isVerified && <VerifiedBadge className="h-3.5 w-3.5" />}
                    {u.isAdmin && (
                      <span className="rounded bg-violet-100 px-1.5 text-[10px] font-bold text-violet-600 dark:bg-violet-900/40">
                        ADMIN
                      </span>
                    )}
                  </p>
                  <p className="truncate text-xs text-zinc-500">
                    @{u.username} · {u.email}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <VerifyButton userId={u.id} verified={u.isVerified} self={u.id === me.id} />
                  <BanButton userId={u.id} self={u.id === me.id} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  );
}
