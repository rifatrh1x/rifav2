"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { X, ImagePlus, MapPin, Check, Link2 } from "lucide-react";
import { createPostAction } from "@/lib/actions";
import { useComposerStore, useToastStore } from "@/lib/store";
import { AUDIENCES, MEDIA_CHOICES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button, Textarea, Input, Spinner } from "@/components/ui";

function HashtagSuggestions({
  value,
  onPick,
}: {
  value: string;
  onPick: (tag: string) => void;
}) {
  const suggestions = useMemo(() => {
    const last = value.split(/\s+/).pop() ?? "";
    if (!last.startsWith("#") || last.length < 2) return [];
    const partial = last.slice(1).toLowerCase();
    const pool = [
      "citylights",
      "travel",
      "biriyani",
      "buildinpublic",
      "monsoon",
      "streetfood",
      "photography",
      "art",
      "fitness",
      "fashion",
    ];
    return pool.filter((t) => t.startsWith(partial)).slice(0, 5);
  }, [value]);

  if (suggestions.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {suggestions.map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onPick(t)}
          className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700 hover:bg-violet-200 dark:bg-violet-900/40 dark:text-violet-300"
        >
          #{t}
        </button>
      ))}
    </div>
  );
}

export function CreatePostForm({
  onDone,
  autofocus,
}: {
  onDone?: () => void;
  autofocus?: boolean;
}) {
  const router = useRouter();
  const toast = useToastStore((s) => s.toast);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState("");
  const [audience, setAudience] = useState("public");
  const [media, setMedia] = useState<string[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [busy, setBusy] = useState(false);
const fileInputRef = useRef<HTMLInputElement>(null);
const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (!files) return;
  for (const file of Array.from(files)) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    toggleMedia(data.secure_url);
  }
};
  const toggleMedia = (src: string) =>
    setMedia((m) =>
      m.includes(src) ? m.filter((x) => x !== src) : [...m, src].slice(0, 10),
    );

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    const fd = new FormData();
    fd.set("caption", caption);
    fd.set("location", location);
    fd.set("audience", audience);
    fd.set("media", JSON.stringify(media));
    const res = await createPostAction(fd);
    setBusy(false);
    if (res.error) {
      toast(res.error, "error");
      return;
    }
    toast("Your post is live 🎉");
    setCaption("");
    setLocation("");
    setMedia([]);
    onDone?.();
    router.refresh();
    if (window.innerWidth < 768) router.push("/");
  };

  const pickHashtag = (tag: string) => {
    const parts = caption.split(/\s+/);
    parts.pop();
    setCaption([...parts, `#${tag}`].filter(Boolean).join(" ") + " ");
  };

  return (
    <div className="flex max-h-[85vh] flex-col">
      <div className="overflow-y-auto px-5 py-4">
        <Textarea
          autoFocus={autofocus}
          value={caption}
          onChange={(e) => setCaption(e.target.value.slice(0, 500))}
          placeholder="What's happening? Add a caption…"
          className="min-h-[100px] resize-none border-0 bg-transparent px-0 text-base shadow-none focus:ring-0"
        />
        <div className="text-right text-xs text-zinc-400">
          {caption.length}/500
        </div>
        <HashtagSuggestions value={caption} onPick={pickHashtag} />

        {media.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {media.map((src) => (
              <div key={src} className="group relative aspect-square overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="Selected" className="h-full w-full object-cover" />
                <button
                  onClick={() => toggleMedia(src)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3">
          <p className="mb-1.5 text-xs font-semibold text-zinc-500">
            Add photos ({media.length}/10)
          </p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            <input ref={fileInputRef} type="file" accept="image/" multiple className="hidden" onChange={handleFileUpload} />{MEDIA_CHOICES.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-lg ring-2 transition",
                  media.includes(src)
                    ? "ring-violet-500"
                    : "ring-transparent hover:ring-zinc-300",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="Pick media" className="h-full w-full object-cover" />
                {media.includes(src) && (
                  <span className="absolute inset-0 flex items-center justify-center bg-violet-600/40">
                    <Check className="h-5 w-5 text-white" />
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Paste image URL…"
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              size="default"
              onClick={() => {
                if (urlInput.trim()) {
                  setMedia((m) => [...m, urlInput.trim()].slice(0, 10));
                  setUrlInput("");
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-1.5 text-xs font-semibold text-zinc-500">Audience</p>
          <div className="grid grid-cols-3 gap-2">
            {AUDIENCES.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => setAudience(a.value)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-left transition",
                  audience === a.value
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20"
                    : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700",
                )}
              >
                <span className="block text-sm font-semibold">
                  {a.icon} {a.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-4">
          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Add location"
            className="pl-9"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
        <Button type="button" variant="ghost" onClick={() => toast("Draft saved", "info")}>
          Save draft
        </Button>
        <Button onClick={submit} disabled={busy || (!caption.trim() && media.length === 0)}>
          {busy ? <Spinner className="border-white/40 border-t-white" /> : <ImagePlus className="h-4 w-4" />}
          Post
        </Button>
      </div>
    </div>
  );
}

export function ComposerHost() {
  const open = useComposerStore((s) => s.open);
  const setOpen = useComposerStore((s) => s.setOpen);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: 80, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-zinc-900 sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 dark:border-zinc-800">
              <h2 className="text-base font-bold">Create post</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <CreatePostForm onDone={() => setOpen(false)} autofocus />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


