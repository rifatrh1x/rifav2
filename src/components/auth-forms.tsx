"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User as UserIcon, AtSign, Sparkles } from "lucide-react";
import { loginAction, signupAction } from "@/lib/actions";
import { useToastStore } from "@/lib/store";
import { Button, Input, Label, Spinner } from "@/components/ui";
import { INTERESTS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-violet-700 via-fuchsia-600 to-pink-500 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 text-2xl font-black text-white backdrop-blur">
            R
          </span>
          <span className="text-3xl font-extrabold text-white">Rifav</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-extrabold leading-tight text-white xl:text-5xl">
            Share your world,
            <br />
            find your people.
          </h1>
          <p className="max-w-md text-lg text-white/85">
            Photos, stories, and real conversations — a global community built for
            creators. 100% free, forever.
          </p>
          <div className="flex flex-wrap gap-2">
            {["📸", "🎬", "💬", "🌍", "🎨", "🔥"].map((e, i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur"
              >
                {e}
              </motion.span>
            ))}
          </div>
        </div>
        <p className="text-sm text-white/70">
          © 2026 Rifav · English & বাংলা · Available worldwide
        </p>
      </div>
      <div className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const score = useMemo(() => {
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    if (password.length >= 12) s++;
    return s;
  }, [password]);
  if (!password) return null;
  const labels = ["Very weak", "Weak", "Okay", "Good", "Strong"];
  const colors = [
    "bg-rose-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-lime-500",
    "bg-emerald-500",
  ];
  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn("h-1 flex-1 rounded-full", i < score ? colors[score - 1] : "bg-zinc-200 dark:bg-zinc-700")}
          />
        ))}
      </div>
      <p className="mt-1 text-xs text-zinc-500">{labels[Math.max(0, score - 1)]}</p>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const toast = useToastStore((s) => s.toast);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await loginAction(fd);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    toast("Welcome back! 👋");
    router.push("/");
    router.refresh();
  };

  return (
    <AuthShell>
      <Link href="/" className="mb-6 inline-flex items-center gap-2 lg:hidden">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 text-xl font-black text-white">
          R
        </span>
        <span className="text-2xl font-extrabold text-gradient">Rifav</span>
      </Link>
      <h2 className="text-2xl font-extrabold">Welcome back</h2>
      <p className="mt-1 text-sm text-zinc-500">Log in to continue to Rifav</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="email">Email or username</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input id="email" name="email" type="text" placeholder="you@example.com" className="pl-10" required />
          </div>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input id="password" name="password" type={show ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" required />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
              aria-label="Toggle password visibility"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
            <input type="checkbox" name="remember" className="h-4 w-4 rounded accent-violet-600" />
            Remember me
          </label>
          <button
            type="button"
            onClick={() => toast("Password reset link sent (demo)", "info")}
            className="font-medium text-violet-600 hover:underline dark:text-violet-400"
          >
            Forgot password?
          </button>
        </div>

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={busy}>
          {busy ? <Spinner className="border-white/40 border-t-white" /> : "Log in"}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-zinc-400">
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" /> OR{" "}
        <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-700" />
      </div>

      <Button
        variant="outline"
        className="w-full"
        size="lg"
        onClick={() => toast("Google sign-in is available in the deployed build", "info")}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
        </svg>
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
          Sign up
        </Link>
      </p>

      <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="flex items-center gap-1 font-semibold text-zinc-600 dark:text-zinc-300">
          <Sparkles className="h-3.5 w-3.5 text-violet-500" /> Demo accounts
        </p>
        <p className="mt-1">User: arif@rifav.app · pass: demo1234</p>
        <p>Admin: admin@rifav.app · pass: admin1234</p>
      </div>
    </AuthShell>
  );
}

export function SignupForm() {
  const router = useRouter();
  const toast = useToastStore((s) => s.toast);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [interests, setInterests] = useState<string[]>([]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("interests", JSON.stringify(interests));
    const res = await signupAction(fd);
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    toast("Account created 🎉");
    router.push("/");
    router.refresh();
  };

  const toggleInterest = (i: string) =>
    setInterests((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].slice(0, 6),
    );

  return (
    <AuthShell>
      <Link href="/" className="mb-6 inline-flex items-center gap-2 lg:hidden">
        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 text-xl font-black text-white">
          R
        </span>
        <span className="text-2xl font-extrabold text-gradient">Rifav</span>
      </Link>
      <h2 className="text-2xl font-extrabold">Create your account</h2>
      <p className="mt-1 text-sm text-zinc-500">Join the community in seconds</p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <div>
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input id="name" name="name" placeholder="Arif Rahman" className="pl-10" required />
          </div>
        </div>
        <div>
          <Label htmlFor="username">Username</Label>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input id="username" name="username" placeholder="aarif" className="pl-10" required />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input id="email" name="email" type="email" placeholder="you@example.com" className="pl-10" required />
          </div>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <PasswordStrength password={password} />
        </div>

        <div>
          <Label>Pick your interests (optional)</Label>
          <div className="flex flex-wrap gap-1.5">
            {INTERESTS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleInterest(i)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition",
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

        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={busy}>
          {busy ? <Spinner className="border-white/40 border-t-white" /> : "Sign up"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-violet-600 hover:underline dark:text-violet-400">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
