import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { ThemeProvider, Toaster } from "@/components/providers";
import { ComposerHost } from "@/components/composer";
import { ServiceWorkerRegister, InstallBanner } from "@/components/pwa-install";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["latin", "bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bangla",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rifav — Share your world",
  description:
    "Rifav is a modern social platform to share photos, videos, and stories with friends and creators worldwide.",
  applicationName: "Rifav",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "Rifav", statusBarStyle: "black-translucent" },
  icons: { icon: "/icons/icon-512.png", apple: "/icons/icon-512.png" },
};

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
};

const themeInit = `
try {
  const t = localStorage.getItem('rifav-theme') || 'dark';
  const m = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const d = t === 'dark' || (t === 'auto' && m);
  document.documentElement.classList.toggle('dark', d);
  document.documentElement.style.colorScheme = d ? 'dark' : 'light';
} catch (e) {}
`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${hindSiliguri.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-screen font-[Inter,var(--font-bangla),sans-serif] antialiased">
        <ThemeProvider />
        <ServiceWorkerRegister />
        {children}
        <ComposerHost />
        <InstallBanner />
        <Toaster />
      </body>
    </html>
  );
}
