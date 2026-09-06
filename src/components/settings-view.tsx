"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  LogOut,
  Trash2,
  Download,
  Shield,
  Moon,
  Sun,
  Monitor,
  Languages,
  Smartphone,
} from "lucide-react";
import { logoutAction } from "@/lib/actions";
import { PwaInstallButton } from "@/components/pwa-install";
import { useUIStore, useToastStore, type Theme } from "@/lib/store";
import { Avatar, Button, Switch } from "@/components/ui";
import { cn } from "@/lib/utils";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="border-b border-zinc-100 px-4 py-3 text-sm font-bold text-zinc-500 dark:border-zinc-800">
        {title}
      </h2>
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">{children}</div>
    </section>
  );
}

function Row({
  icon,
  label,
  sub,
  children,
}: {
  icon?: React.ReactNode;
  label: React.ReactNode;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      {icon && <span className="text-zinc-400">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{label}</p>
        {sub && <p className="text-xs text-zinc-500">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  label,
  sub,
  value,
  onChange,
}: {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Row label={label} sub={sub}>
      <Switch checked={value} onCheckedChange={onChange} />
    </Row>
  );
}

export function SettingsView({
  user,
}: {
  user: { name: string; username: string; avatar: string | null; email: string };
}) {
  const router = useRouter();
  const toast = useToastStore((s) => s.toast);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const [lang, setLang] = useState("en");

  const [notifLikes, setNotifLikes] = useState(true);
  const [notifComments, setNotifComments] = useState(true);
  const [notifFollows, setNotifFollows] = useState(true);
  const [notifMessages, setNotifMessages] = useState(true);
  const [dnd, setDnd] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [hideOnline, setHideOnline] = useState(false);

  const themes: { id: Theme; label: string; icon: React.ReactNode }[] = [
    { id: "light", label: "Light", icon: <Sun className="h-4 w-4" /> },
    { id: "dark", label: "Dark", icon: <Moon className="h-4 w-4" /> },
    { id: "auto", label: "Auto", icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 px-1 py-2">
        <Avatar name={user.name} src={user.avatar} size="lg" />
        <div>
          <h1 className="text-xl font-extrabold">Settings</h1>
          <p className="text-sm text-zinc-500">
            @{user.username} · {user.email}
          </p>
        </div>
      </div>

      <Section title="Account">
        <Link href={`/profile/${user.username}`} className="block">
          <Row icon={<Shield className="h-4 w-4" />} label="Edit profile" sub="Name, bio, links, photos">
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </Row>
        </Link>
        <button
          className="block w-full text-left"
          onClick={() => toast("Change password flow (demo)", "info")}
        >
          <Row label="Change password" sub="Update your account password">
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </Row>
        </button>
        <button
          className="block w-full text-left"
          onClick={() => toast("Your data export has been queued", "info")}
        >
          <Row icon={<Download className="h-4 w-4" />} label="Download my data" sub="Get a copy of everything">
            <ChevronRight className="h-4 w-4 text-zinc-400" />
          </Row>
        </button>
      </Section>

      <Section title="Appearance">
        <Row icon={<Sun className="h-4 w-4" />} label="Theme">
          <div className="flex gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-800">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
                  theme === t.id
                    ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-white"
                    : "text-zinc-500",
                )}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </Row>
        <Row icon={<Languages className="h-4 w-4" />} label="Language" sub="English / বাংলা">
          <select
            value={lang}
            onChange={(e) => {
              setLang(e.target.value);
              toast(e.target.value === "bn" ? "ভাষা বাংলায় সেট করা হয়েছে" : "Language set to English", "info");
            }}
            className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="en">English</option>
            <option value="bn">বাংলা (Bengali)</option>
          </select>
        </Row>
      </Section>

      <Section title="Notifications">
        <ToggleRow label="Likes" value={notifLikes} onChange={setNotifLikes} />
        <ToggleRow label="Comments" value={notifComments} onChange={setNotifComments} />
        <ToggleRow label="New followers" value={notifFollows} onChange={setNotifFollows} />
        <ToggleRow label="Direct messages" value={notifMessages} onChange={setNotifMessages} />
        <ToggleRow label="Do not disturb" sub="Pause all notifications" value={dnd} onChange={setDnd} />
      </Section>

      <Section title="App">
        <Row
          icon={<Smartphone className="h-4 w-4" />}
          label="Install app"
          sub="Add Rifav to your home screen — works offline"
        >
          <PwaInstallButton />
        </Row>
      </Section>

      <Section title="Privacy">
        <ToggleRow
          label="Private account"
          sub="Only followers can see your posts"
          value={privateAccount}
          onChange={setPrivateAccount}
        />
        <ToggleRow
          label="Hide online status"
          value={hideOnline}
          onChange={setHideOnline}
        />
      </Section>

      <Section title="Danger zone">
        <button
          onClick={async () => {
            if (!confirm("Log out of Rifav?")) return;
            await logoutAction();
          }}
          className="block w-full text-left"
        >
          <Row icon={<LogOut className="h-4 w-4" />} label="Log out" sub="Sign out of this device" />
        </button>
        <button
          onClick={() => {
            if (confirm("Delete your account? This can't be undone.")) {
              toast("Account deletion requested (demo)", "info");
            }
          }}
          className="block w-full text-left"
        >
          <Row
            icon={<Trash2 className="h-4 w-4" />}
            label={<span className="text-rose-600">Delete account</span>}
            sub="Permanently remove your account and data"
          />
        </button>
      </Section>

      <p className="pb-4 text-center text-xs text-zinc-400">Rifav v1.0.0 · Made with 💜</p>
    </div>
  );
}
