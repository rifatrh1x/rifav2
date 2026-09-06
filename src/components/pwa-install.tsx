"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Share, X } from "lucide-react";
import { Button } from "@/components/ui";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/** Registers the service worker once. */
export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline cache is optional */
      });
    }
  }, []);
  return null;
}

function useInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    setIos(isIOS());
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  return { deferred, installed, ios, setDeferred };
}

/** Small inline button — used in Settings etc. */
export function PwaInstallButton({ variant = "outline" }: { variant?: "outline" | "gradient" }) {
  const { deferred, installed, ios, setDeferred } = useInstallPrompt();
  const [showIosHelp, setShowIosHelp] = useState(false);

  const install = useCallback(async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setDeferred(null);
      return;
    }
    setShowIosHelp(true);
  }, [deferred, setDeferred]);

  if (installed) return null;

  return (
    <div className="space-y-2">
      <Button variant={variant} size="sm" onClick={install}>
        <Download className="h-4 w-4" /> Install app
      </Button>
      {showIosHelp && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs leading-relaxed text-sky-800 dark:border-sky-900 dark:bg-sky-900/20 dark:text-sky-200">
          <p className="flex items-center gap-1 font-semibold">
            <Share className="h-3.5 w-3.5" /> iPhone/iPad এ ইনস্টল:
          </p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-4">
            <li>Safari ব্রাউজারে Rifav খুলুন</li>
            <li>নিচের <b>Share</b> (↑) বাটনে ট্যাপ করুন</li>
            <li><b>Add to Home Screen</b> চাপুন</li>
          </ol>
        </div>
      )}
    </div>
  );
}

/** Auto banner — appears when the app is installable (Chrome/Edge/Android). */
export function InstallBanner() {
  const { deferred, installed, ios, setDeferred } = useInstallPrompt();
  const [dismissed, setDismissed] = useState(false);

  const show = Boolean(deferred) && !dismissed && !installed && !ios;

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") setDeferred(null);
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
          className="fixed inset-x-3 bottom-20 z-[90] mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-zinc-200 bg-white/95 p-3 shadow-2xl backdrop-blur dark:border-zinc-700 dark:bg-zinc-900/95 lg:bottom-4"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-xl font-black text-white">
            R
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold">Rifav অ্যাপ ইনস্টল করুন</p>
            <p className="text-xs text-zinc-500">হোম স্ক্রিন থেকে দ্রুত খুলুন — অফলাইনেও কাজ করে</p>
          </div>
          <Button size="sm" onClick={install}>
            <Download className="h-4 w-4" /> Install
          </Button>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
