import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { AppShell, type ShellUser } from "@/components/app-shell";

export async function Shell({
  children,
  rightRail,
  requireAuth = false,
}: {
  children: ReactNode;
  rightRail?: ReactNode;
  requireAuth?: boolean;
}) {
  const user = await getCurrentUser();
  if (requireAuth && !user) redirect("/login");

  let shellUser: ShellUser | null = null;
  let unread = 0;

  if (user) {
    shellUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
    };
    const [row] = await db
      .select({ c: count() })
      .from(notifications)
      .where(and(eq(notifications.toUserId, user.id), eq(notifications.read, false)));
    unread = row?.c ?? 0;
  }

  return (
    <AppShell user={shellUser} unread={unread} rightRail={rightRail}>
      {children}
    </AppShell>
  );
}
