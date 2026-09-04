"use client";

import { create } from "zustand";

export type Theme = "light" | "dark" | "auto";

interface UIState {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: "dark",
  setTheme: (theme) => set({ theme }),
}));

export interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
}

interface ToastState {
  toasts: Toast[];
  toast: (message: string, type?: Toast["type"]) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  toast: (message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

interface ComposerState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const useComposerStore = create<ComposerState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
