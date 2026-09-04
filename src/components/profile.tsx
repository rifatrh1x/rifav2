"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  Link2,
  MessageCircle,
  MoreHorizontal,
  QrCode,
  Share2,
  X,
  Pencil,
  Flag,
  Ban,
} from "lucide-react";
import { updateProfileAction, startChatAction } from "@/lib/actions";
import { useToastStore } from "@/lib/store";
import { Avatar, Button, Input, Label, Textarea, VerifiedBadge, Spinner } from "@/components/ui";
import { FollowButton } from "@/components/follow-button";
import { INTERESTS } from "@/lib/constants";
import { cn, formatCount } from "@/lib/utils";
import type { AuthorRef } from "@/lib/queries";

export interface ProfileHeaderData {
  user: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
    cover: string | null;
    bio: string | null;
    website: string | null;
    isVerified: boolean;
    isPrivate: boolean;
    isAdmin: boolean;
    interests: string[];
    createdAt: Date;
  };
  isMe: boolean;
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
  postCount: number;
  mutual: AuthorRef[];
}

function EditProfileModal({
  data,
  onClose,
}: {
  data: ProfileHeaderData;
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToastStore((s) => s.toast);
  const [busy, setBusy] = useState(false);
  const [interests, setInterests] = useState<string[]>(data.user.interests);
  const [error, setError] = useState("");

  const toggle = (i: string) =>
    setInterests((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("interests", JSON.stringify(interests));
    const res = await updateProfileAction(fd);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    toast("Profile updated ✨");
    onClose();
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 dark:bg-zinc-900 sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Edit profile</h2>
          <button onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={data.user.name} required />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" defaultValue={data.user.username} required />
            </div>
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" defaultValue={data.user.bio ?? ""} placeholder="Tell people about yourself…" />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input id="website" name="website" defaultValue={data.user.website ?? ""} placeholder="https://…" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input id="avatar" name="avatar" defaultValue={data.user.avatar ?? ""} placeholder="https://…" />
            </div>
            <div>
              <Label htmlFor="cover">Cover URL</Label>
              <Input id="cover" name="cover" defaultValue={data.user.cover ?? ""} placeholder="https://…" />
            </div>
          </div>
          <div>
            <Label>Interests</Label>
            <div className="flex flex-wrap gap-1.5">
              {INTERESTS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggle(i)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition",
                    interests.includes(i)
                      ? "bg-violet-600 text-white"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300",
                  )}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <Spinner className="border-white/40 border-t-white" /> : "Save changes"}
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export function ProfileTabs({
  posts,
  saved,
  tagged,
  isMe,
}: {
  posts: React.ReactNode;
  saved?: React.ReactNode;
  tagged?: React.ReactNode;
  isMe: boolean;
}) {
  const [tab, setTab] = useState<"posts" | "saved" | "tagged">("posts");
  const tabs = isMe
    ? ([
        { id: "posts", label: "Posts" },
        { id: "saved", label: "Saved" },
        { id: "tagged", label: "Tagged" },
      ] as const)
    : ([{ id: "posts", label: "Posts" }] as const);

  return (
    <div>
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex-1 py-3 text-sm font-semibold transition",
              tab === t.id
                ? "border-b-2 border-violet-600 text-zinc-900 dark:text-white"
                : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tab === "posts" && posts}
        {tab === "saved" && saved}
        {tab === "tagged" && tagged}
      </div>
    </div>
  );
}

export function ProfileHeader({ data }: { data: ProfileHeaderData }) {
  const router = useRouter();
  const toast = useToastStore((s) => s.toast);
  const [editing, setEditing] = useState(false);
  const [menu, setMenu] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}/profile/${data.user.username}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Profile link copied");
    } catch {
      toast("Couldn't copy", "error");
    }
  };

  const message = async () => {
    const res = await startChatAction(data.user.id);
    if (res.loginRequired) {
      toast("Log in to send messages", "info");
      router.push("/login");
      return;
    }
    if (res.chatId) router.push(`/messages/${res.chatId}`);
    else if (res.error) toast(res.error, "error");
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div
        className="relative h-32 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 sm:h-44"
        style={
          data.user.cover
            ? { backgroundImage: `url(${data.user.cover})`, backgroundSize: "cover", backgroundPosition: "center" }
            : undefined
        }
      />
      <div className="px-4 pb-4">
        <div className="-mt-10 flex items-end justify-between sm:-mt-14">
          <Avatar
            name={data.user.name}
            src={data.user.avatar}
            size="xl"
            ring
            className="border-4 border-white dark:border-zinc-900"
          />
          <div className="flex items-center gap-2 pt-10">
            {data.isMe ? (
              <>
                <Button variant="outline" size="sm" onClick={share}>
                  <Share2 className="h-4 w-4" /> Share
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                  <Pencil className="h-4 w-4" /> Edit profile
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={message}>
                  <MessageCircle className="h-4 w-4" /> Message
                </Button>
                <FollowButton userId={data.user.id} initial={data.isFollowing} />
                <div className="relative">
                  <button
                    onClick={() => setMenu((v) => !v)}
                    aria-label="More"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-300 text-zinc-500 dark:border-zinc-700"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  <AnimatePresence>
                    {menu && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute right-0 top-11 z-20 w-44 rounded-xl border border-zinc-200 bg-white py-1 shadow-xl dark:border-zinc-700 dark:bg-zinc-900"
                      >
                        <button
                          onClick={() => { toast("Blocked user", "info"); setMenu(false); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                          <Ban className="h-4 w-4" /> Block
                        </button>
                        <button
                          onClick={() => { toast("User reported", "info"); setMenu(false); }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800"
                        >
                          <Flag className="h-4 w-4" /> Report
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-extrabold">{data.user.name}</h1>
            {data.user.isVerified && <VerifiedBadge className="h-5 w-5" />}
          </div>
          <p className="text-sm text-zinc-500">@{data.user.username}</p>
          {data.user.bio && <p className="mt-2 text-sm leading-relaxed">{data.user.bio}</p>}
          {data.user.website && (
            <a
              href={data.user.website}
              target="_blank"
              rel="noreferrer"
              className="mt-1 flex items-center gap-1 text-sm font-medium text-violet-600 hover:underline dark:text-violet-400"
            >
              <Link2 className="h-4 w-4" /> {data.user.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          <p className="mt-2 flex items-center gap-1 text-xs text-zinc-400">
            <Calendar className="h-3.5 w-3.5" />
            Joined {new Date(data.user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="mt-4 flex gap-5 text-sm">
          <p>
            <span className="font-bold">{formatCount(data.postCount)}</span>{" "}
            <span className="text-zinc-500">posts</span>
          </p>
          <p>
            <span className="font-bold">{formatCount(data.followersCount)}</span>{" "}
            <span className="text-zinc-500">followers</span>
          </p>
          <p>
            <span className="font-bold">{formatCount(data.followingCount)}</span>{" "}
            <span className="text-zinc-500">following</span>
          </p>
        </div>

        {data.mutual.length > 0 && (
          <p className="mt-3 text-xs text-zinc-500">
            Followed by {data.mutual.map((m) => m.username).join(", ")} and others
          </p>
        )}
      </div>

      <AnimatePresence>
        {editing && <EditProfileModal data={data} onClose={() => setEditing(false)} />}
      </AnimatePresence>
    </div>
  );
}
