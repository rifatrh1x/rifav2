"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useComposerStore, useToastStore } from "@/lib/store";
import { Avatar } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { AuthorRef } from "@/lib/queries";

export interface StoryItem {
  s: { id: string; media: string | null; text: string | null; color: string | null };
  user: AuthorRef;
}

function StoryViewer({
  stories,
  initial,
  onClose,
}: {
  stories: StoryItem[];
  initial: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(initial);
  const [progress, setProgress] = useState(0);
  const current = stories[idx];

  useEffect(() => {
    setProgress(0);
    const t = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(t);
          if (idx < stories.length - 1) setIdx((i) => i + 1);
          else onClose();
          return 100;
        }
        return p + 1.6;
      });
    }, 50);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => Math.min(i + 1, stories.length - 1));
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!current) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={() => setIdx((i) => (i < stories.length - 1 ? i + 1 : 0))}
    >
      <button
        onClick={onClose}
        aria-label="Close story"
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="relative h-full max-h-[90vh] w-full max-w-md overflow-hidden rounded-none bg-zinc-900 sm:rounded-2xl">
        <div className="absolute left-0 right-0 top-0 z-10 flex gap-1 p-2">
          {stories.map((s, i) => (
            <div key={s.s.id} className="h-0.5 flex-1 overflow-hidden rounded bg-white/30">
              <div
                className="h-full bg-white transition-all"
                style={{ width: i < idx ? "100%" : i === idx ? `${progress}%` : "0%" }}
              />
            </div>
          ))}
        </div>

        <div className="absolute left-0 right-0 top-5 z-10 flex items-center gap-2 px-4">
          <Avatar name={current.user.name} src={current.user.avatar} size="sm" ring />
          <p className="text-sm font-semibold text-white">
            {current.user.username}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={current.s.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex h-full w-full items-center justify-center"
            style={{ background: current.s.color ?? "#18181b" }}
          >
            {current.s.media ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.s.media}
                alt="Story"
                className="h-full w-full object-cover"
              />
            ) : null}
            {current.s.text && (
              <p className="absolute bottom-16 px-6 text-center text-2xl font-bold text-white drop-shadow-lg">
                {current.s.text}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function StoryBar({
  stories,
  guest = false,
}: {
  stories: StoryItem[];
  guest?: boolean;
}) {
  const setOpen = useComposerStore((s) => s.setOpen);
  const toast = useToastStore((s) => s.toast);
  const [viewer, setViewer] = useState<number | null>(null);

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => {
            if (guest) {
              toast("Log in to share a story", "info");
              return;
            }
            setOpen(true);
            toast("Share a photo or video as your story", "info");
          }}
          className="flex w-16 shrink-0 flex-col items-center gap-1"
        >
          <div className="relative">
            <Avatar name="You" size="lg" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-violet-600 text-white dark:border-zinc-950">
              <Plus className="h-4 w-4" />
            </span>
          </div>
          <span className="max-w-16 truncate text-[11px]">Your story</span>
        </button>

        {stories.map((story, i) => (
          <button
            key={story.s.id}
            onClick={() => setViewer(i)}
            className="flex w-16 shrink-0 flex-col items-center gap-1"
          >
            <div className="rounded-full bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-amber-400 p-[2px]">
              <div className="rounded-full bg-white p-[2px] dark:bg-zinc-950">
                <Avatar name={story.user.name} src={story.user.avatar} size="lg" />
              </div>
            </div>
            <span className="max-w-16 truncate text-[11px]">{story.user.username}</span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {viewer !== null && (
          <StoryViewer
            stories={stories}
            initial={viewer}
            onClose={() => setViewer(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export function StorySkeleton() {
  return (
    <div className="flex gap-3 overflow-hidden pb-2">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex w-16 shrink-0 flex-col items-center gap-1">
          <div className={cn("h-16 w-16 rounded-full bg-zinc-200 dark:bg-zinc-800")} />
          <div className="h-2.5 w-12 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}
