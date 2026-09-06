import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Creates all tables directly via SQL if they don't exist yet.
 * This lets the app self-provision its schema on first boot — no
 * `drizzle-kit push` command required. Safe to run repeatedly.
 */
export async function ensureSchema() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "users" (
      "id" text PRIMARY KEY NOT NULL,
      "username" text NOT NULL,
      "name" text NOT NULL,
      "email" text NOT NULL,
      "password_hash" text,
      "bio" text,
      "avatar" text,
      "cover" text,
      "website" text,
      "interests" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "is_private" boolean DEFAULT false NOT NULL,
      "is_verified" boolean DEFAULT false NOT NULL,
      "is_admin" boolean DEFAULT false NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "users_username_unique" UNIQUE("username"),
      CONSTRAINT "users_email_unique" UNIQUE("email")
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "posts" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL,
      "caption" text,
      "media" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "hashtags" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "location" text,
      "audience" text DEFAULT 'public' NOT NULL,
      "likes" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "comments" (
      "id" text PRIMARY KEY NOT NULL,
      "post_id" text NOT NULL,
      "user_id" text NOT NULL,
      "text" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "follows" (
      "follower_id" text NOT NULL,
      "following_id" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "follows_follower_id_following_id_pk" PRIMARY KEY("follower_id","following_id")
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "bookmarks" (
      "user_id" text NOT NULL,
      "post_id" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      CONSTRAINT "bookmarks_user_id_post_id_pk" PRIMARY KEY("user_id","post_id")
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "notifications" (
      "id" text PRIMARY KEY NOT NULL,
      "to_user_id" text NOT NULL,
      "from_user_id" text,
      "type" text NOT NULL,
      "post_id" text,
      "read" boolean DEFAULT false NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "chats" (
      "id" text PRIMARY KEY NOT NULL,
      "type" text DEFAULT 'private' NOT NULL,
      "name" text,
      "photo" text,
      "member_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "admin_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "last_message" text,
      "last_message_at" timestamp DEFAULT now() NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "messages" (
      "id" text PRIMARY KEY NOT NULL,
      "chat_id" text NOT NULL,
      "sender_id" text NOT NULL,
      "content" text NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "stories" (
      "id" text PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL,
      "media" text,
      "text" text,
      "color" text,
      "viewers" jsonb DEFAULT '[]'::jsonb NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "expires_at" timestamp NOT NULL
    );
  `);

  // Helpful indexes (ignore errors if they already exist).
  const indexes = [
    sql`CREATE INDEX IF NOT EXISTS "users_username_idx" ON "users" ("username");`,
    sql`CREATE INDEX IF NOT EXISTS "posts_user_idx" ON "posts" ("user_id");`,
    sql`CREATE INDEX IF NOT EXISTS "posts_created_idx" ON "posts" ("created_at");`,
    sql`CREATE INDEX IF NOT EXISTS "comments_post_idx" ON "comments" ("post_id");`,
    sql`CREATE INDEX IF NOT EXISTS "notif_to_idx" ON "notifications" ("to_user_id");`,
    sql`CREATE INDEX IF NOT EXISTS "messages_chat_idx" ON "messages" ("chat_id");`,
    sql`CREATE INDEX IF NOT EXISTS "stories_user_idx" ON "stories" ("user_id");`,
  ];
  for (const stmt of indexes) {
    try {
      await db.execute(stmt);
    } catch {
      /* index may already exist */
    }
  }

  console.log("✓ Rifav schema ensured");
}
