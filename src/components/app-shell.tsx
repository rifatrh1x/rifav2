"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Bell,
  MessageCircle,
  Bookmark,
  User,
  Settings,
  Search,
  Plus,
  Sun,
  Moon,
  ShieldCheck,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, Button } from "@/components/ui";
import { useUIStore, useComposerStore } from "@/lib/store";

export type ShellUser = {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  isAdmin: boolean;
};

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span
        className={cn(
          "flex items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 font-black text-white shadow-lg shadow-violet-600/30",
          size === "md" ? "h-9 w-9 text-xl" : "h-7 w-7 text-base",
        )}
      >
        R
      </span>
      <span
        className={cn(
          "bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text font-extrabold tracking-tight text-transparent",
          size === "md" ? "text-2xl" : "text-xl",
        )}
      >
        Rifav
      </span>
    </Link>
  );
}

function ThemeToggle() {
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const next = theme === "dark" ? "light" : "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      onClick={() => setTheme(next)}
    >
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  badge,
  active,
}: {
  href: string;
  icon: typeof Home;
  label: string;
  badge?: number;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/70 dark:hover:text-white",
      )}
    >
      <span className="relative">
        <Icon className="h-5 w-5" />
        {badge ? (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        ) : null}
      </span>
      <span className="truncate">{label}</span>
      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-500" />
      )}
    </Link>
  );
}

export function AppShell({
  user,
  unread,
  children,
  rightRail,
}: {
  user: ShellUser | null;
  unread: number;
  children: ReactNode;
  rightRail?: ReactNode;
}) {
  const setOpen = useComposerStore((s) => s.setOpen);
  const pathname = usePathname();

  const fullNav = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/explore", icon: Compass, label: "Explore" },
    { href: "/notifications", icon: Bell, label: "Notifications", badge: unread },
    { href: "/messages", icon: MessageCircle, label: "Messages" },
    { href: "/bookmarks", icon: Bookmark, label: "Saved" },
    { href: `/profile/${user?.username}`, icon: User, label: "Profile" },
    { href: "/settings", icon: Settings, label: "Settings" },
    ...(user?.isAdmin
      ? [{ href: "/admin", icon: ShieldCheck, label: "Admin" }]
      : []),
  ];

  const guestNav = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/explore", icon: Compass, label: "Explore" },
  ];

  const nav = user ? fullNav : guestNav;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      {/* Mobile header */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-zinc-200 bg-white/80 px-4 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80 lg:hidden">
        <Logo size="sm" />
        <div className="flex items-center gap-1">
          {user ? (
            <>
              <Link
                href="/explore"
                aria-label="Search"
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Search className="h-5 w-5" />
              </Link>
              <Link
                href="/notifications"
                aria-label="Notifications"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-600" />
                )}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-zinc-200 px-4 py-5 dark:border-zinc-800 lg:flex">
          <div className="px-2 pb-4">
            <Logo />
          </div>
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
            {nav.map((item) => (
              <NavItem
                key={item.href}
                {...item}
                active={
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)
                }
              />
            ))}
            {user ? (
              <button
                onClick={() => setOpen(true)}
                className="mt-2 flex w-full items-center gap-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition hover:brightness-110"
              >
                <Plus className="h-5 w-5" /> Create
              </button>
            ) : (
              <Link
                href="/login"
                className="mt-2 flex w-full items-center gap-3 rounded-xl border border-violet-500/40 px-3 py-2.5 text-sm font-semibold text-violet-600 transition hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/20"
              >
                <LogIn className="h-5 w-5" /> Log in to post
              </Link>
            )}
          </nav>
          <div className="mt-2 flex items-center gap-2 border-t border-zinc-200 pt-3 dark:border-zinc-800">
            {user ? (
              <>
                <Link href={`/profile/${user.username}`} className="flex items-center gap-2">
                  <Avatar name={user.name} src={user.avatar} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-zinc-500">@{user.username}</p>
                  </div>
                </Link>
                <div className="ml-auto">
                  <ThemeToggle />
                </div>
              </>
            ) : (
              <div className="flex w-full gap-2">
                <Link href="/login" className="flex-1">
                  <Button variant="secondary" className="w-full" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button className="w-full" size="sm">
                    Sign up
                  </Button>
                </Link>
                <ThemeToggle />
              </div>
            )}
          </div>
        </aside>

        {/* Center content */}
        <main className="min-w-0 flex-1 px-4 pb-24 pt-4 sm:px-6 lg:pb-8">
          <div className="mx-auto max-w-2xl">{children}</div>
        </main>

        {/* Right rail */}
        {rightRail ? (
          <aside className="sticky top-0 hidden h-screen w-80 shrink-0 overflow-y-auto px-4 py-5 xl:block">
            {rightRail}
          </aside>
        ) : null}
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-zinc-200 bg-white/90 px-2 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/90 lg:hidden">
        <Link href="/" className="flex flex-1 flex-col items-center gap-0.5 text-zinc-500">
          <Home className="h-6 w-6" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link href="/explore" className="flex flex-1 flex-col items-center gap-0.5 text-zinc-500">
          <Compass className="h-6 w-6" />
          <span className="text-[10px]">Explore</span>
        </Link>
        {user ? (
          <button
            onClick={() => setOpen(true)}
            aria-label="Create post"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-violet-600/40"
          >
            <Plus className="h-7 w-7" />
          </button>
        ) : (
          <Link
            href="/login"
            aria-label="Log in to post"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-xl shadow-violet-600/40"
          >
            <LogIn className="h-7 w-7" />
          </Link>
        )}
        {user ? (
          <Link href="/messages" className="relative flex flex-1 flex-col items-center gap-0.5 text-zinc-500">
            <MessageCircle className="h-6 w-6" />
            <span className="text-[10px]">Chat</span>
          </Link>
        ) : (
          <Link href="/login" className="flex flex-1 flex-col items-center gap-0.5 text-zinc-500">
            <MessageCircle className="h-6 w-6" />
            <span className="text-[10px]">Chat</span>
          </Link>
        )}
        {user ? (
          <Link href={`/profile/${user.username}`} className="flex flex-1 flex-col items-center gap-0.5 text-zinc-500">
            <User className="h-6 w-6" />
            <span className="text-[10px]">Profile</span>
          </Link>
        ) : (
          <Link href="/login" className="flex flex-1 flex-col items-center gap-0.5 text-zinc-500">
            <User className="h-6 w-6" />
            <span className="text-[10px]">Log in</span>
          </Link>
        )}
      </nav>
    </div>
  );
}
