"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUIStore, useToastStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ThemeProvider() {
  const theme = useUIStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem("rifav-theme");
    if (stored === "dark" || stored === "light" || stored === "auto") {
      useUIStore.setState({ theme: stored as "light" | "dark" | "auto" });
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (t: string) => {
      const isDark = t === "dark" || (t === "auto" && media.matches);
      root.classList.toggle("dark", isDark);
      root.style.colorScheme = isDark ? "dark" : "light";
    };

    apply(useUIStore.getState().theme);
    localStorage.setItem("rifav-theme", useUIStore.getState().theme);

    const onChange = () => {
      if (useUIStore.getState().theme === "auto") apply("auto");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const isDark = theme === "dark" || (theme === "auto" && media.matches);
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
    if (theme !== "auto") localStorage.setItem("rifav-theme", theme);
  }, [theme]);

  return null;
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            onClick={() => dismiss(t.id)}
            className={cn(
              "pointer-events-auto flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-xl",
              t.type === "error"
                ? "bg-rose-600"
                : t.type === "info"
                  ? "bg-sky-600"
                  : "bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900",
            )}
          >
            {t.type === "error" ? "⚠️" : t.type === "info" ? "ℹ️" : "✓"}
            {t.message}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
