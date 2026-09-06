# Rifav 🌐

A modern, cross-platform social media app (PWA) built with **Next.js 14+ (App Router)**, **Tailwind CSS**, **Framer Motion**, **Zustand**, **Drizzle ORM** and **PostgreSQL**.

English + বাংলা · Mobile · Tablet · Desktop · Dark/Light mode · Offline (PWA)

---

## ✨ Features

- 🔐 Email/password auth (bcrypt + JWT session cookies) + Google sign-in (ready)
- 👁️ Public browsing — anyone can view the feed; actions require login
- 🏠 Feed with stories, carousel posts, hashtags & mentions
- ✍️ Post composer (media, audience, hashtag suggestions, location)
- 💬 Real-time-style chat (private + groups, auto-refresh)
- 👤 Profiles (edit, follow, private accounts, saved posts)
- 🔎 Explore & search (people, hashtags, categories)
- 🔔 Notifications, bookmarks, settings (theme, language, privacy)
- 🛡️ Admin panel (verify/badges, ban users, analytics)
- 📱 PWA — installable + offline (service worker)

## 🚀 Run locally

```bash
npm install

# 1. Set up environment variables
cp .env.example .env
#   -> fill in DATABASE_URL and AUTH_SECRET

# 2. Create the database tables
npx drizzle-kit push

# 3. Seed demo data (optional; also auto-seeds on first start)
npx tsx scripts/seed.ts

# 4. Start the dev server
npm run dev
```

Open http://localhost:3000

### Demo accounts
| Role  | Email            | Password   |
| ----- | ---------------- | ---------- |
| User  | arif@rifav.app   | demo1234   |
| Admin | admin@rifav.app  | admin1234  |

---

## ☁️ Deploy to Vercel (free)

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com) → **Add New → Project** → import the repo.
3. Framework: **Next.js** (auto-detected). Click **Deploy**.
4. Create a free PostgreSQL database at [neon.tech](https://neon.tech) (or Supabase / Railway).
5. In Vercel → **Project → Settings → Environment Variables**, add:
   - `DATABASE_URL` — your PostgreSQL connection string
   - `AUTH_SECRET` — any long random string (`openssl rand -base64 32`)
6. Run the schema migration against your production DB (from your machine):
   ```bash
   DATABASE_URL="postgresql://..." npx drizzle-kit push
   ```
7. **Redeploy** in Vercel. Done 🎉

> The app auto-seeds demo data on first boot via `instrumentation.ts`, so the first
> load already feels alive.

---

## 🔧 Tech stack

- **Framework:** Next.js (App Router, React Server Components)
- **Database:** PostgreSQL + Drizzle ORM
- **Auth:** bcryptjs + jose (JWT in httpOnly cookies)
- **UI:** Tailwind CSS, Framer Motion, Lucide icons, custom components
- **State:** Zustand

## 📁 Project structure

```
src/
  app/            # App Router pages (feed, explore, profile, chat, admin…)
  components/     # UI, shell, post, composer, chat, stories, PWA…
  db/             # Drizzle schema + seed data
  lib/            # auth, actions (server), queries, store, utils
public/           # PWA assets, seed images
scripts/seed.ts   # demo-data seeder
instrumentation.ts# auto-seed on server start
```
