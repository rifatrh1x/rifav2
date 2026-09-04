import { requireUser } from "@/lib/auth";
import { Shell } from "@/components/shell";
import { SettingsView } from "@/components/settings-view";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const me = await requireUser();
  return (
    <Shell>
      <SettingsView
        user={{ name: me.name, username: me.username, avatar: me.avatar, email: me.email }}
      />
    </Shell>
  );
}
