"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, desc, inArray, or, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "@/db";
import {
  users,
  posts,
  comments,
  follows,
  bookmarks,
  notifications,
  chats,
  messages,
} from "@/db/schema";
import {
  getCurrentUser,
  requireUser,
  hashPassword,
  verifyPassword,
  setSessionCookie,
  clearSessionCookie,
} from "@/lib/auth";
import { extractHashtags } from "@/lib/utils";

type ActionResult = {
  error?: string;
  ok?: boolean;
  loginRequired?: boolean;
};

async function createNotification(
  toUserId: string,
  fromUserId: string,
  type: string,
  postId?: string | null,
) {
  if (toUserId === fromUserId) return;
  await db.insert(notifications).values({
    id: randomUUID(),
    toUserId,
    fromUserId,
    type,
    postId: postId ?? null,
  });
}

function parseJsonField(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw as string[];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

// ─────────────────────────── AUTH ───────────────────────────

export async function signupAction(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !username || !email || !password) {
    return { error: "Please fill in all fields." };
  }
  if (!/^[a-z0-9._]{3,20}$/.test(username)) {
    return {
      error: "Username must be 3-20 chars: letters, numbers, dots, underscores.",
    };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(or(eq(users.email, email), eq(users.username, username)))
    .limit(1);
  if (existingUser.length) {
    return { error: "Email or username is already taken." };
  }

  const id = randomUUID();
  await db.insert(users).values({
    id,
    name,
    username,
    email,
    passwordHash: await hashPassword(password),
    bio: "",
    interests: [],
  });

  await setSessionCookie(id);
  return { ok: true };
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const [user] = await db
    .select()
    .from(users)
    .where(or(eq(users.email, email), eq(users.username, email)))
    .limit(1);
  if (!user || !user.passwordHash) {
    return { error: "No account found with that email/username." };
  }
  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return { error: "Incorrect password. Try again." };
  }

  await setSessionCookie(user.id);
  return { ok: true };
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

// ─────────────────────────── POSTS ───────────────────────────

export async function createPostAction(
  formData: FormData,
): Promise<ActionResult & { postId?: string }> {
  const me = await requireUser();
  const caption = String(formData.get("caption") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const audience = String(formData.get("audience") ?? "public");
  const media = parseJsonField(formData.get("media"));

  if (!caption && media.length === 0) {
    return { error: "Add a caption or at least one photo." };
  }

  const id = randomUUID();
  await db.insert(posts).values({
    id,
    userId: me.id,
    caption: caption || null,
    location: location || null,
    audience,
    media,
    hashtags: extractHashtags(caption),
  });

  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath(`/profile/${me.username}`);
  return { ok: true, postId: id };
}

export async function deletePostAction(postId: string): Promise<ActionResult> {
  const me = await requireUser();
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);
  if (!post) return { error: "Post not found." };
  if (post.userId !== me.id && !me.isAdmin) {
    return { error: "You can't delete this post." };
  }
  await db.delete(posts).where(eq(posts.id, postId));
  revalidatePath("/");
  revalidatePath("/explore");
  revalidatePath(`/profile/${me.username}`);
  return { ok: true };
}

export async function toggleLikeAction(postId: string) {
  const me = await getCurrentUser();
  if (!me) return { loginRequired: true };
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);
  if (!post) return { error: "Post not found." };

  const likes = post.likes ?? [];
  const liked = likes.includes(me.id);
  const next = liked ? likes.filter((id) => id !== me.id) : [...likes, me.id];
  await db.update(posts).set({ likes: next }).where(eq(posts.id, postId));

  if (!liked) await createNotification(post.userId, me.id, "like", postId);
  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  return { liked: !liked };
}

export async function addCommentAction(postId: string, text: string): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (!me) return { loginRequired: true };
  const clean = text.trim();
  if (!clean) return { error: "Comment can't be empty." };
  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);
  if (!post) return { error: "Post not found." };

  await db.insert(comments).values({
    id: randomUUID(),
    postId,
    userId: me.id,
    text: clean,
  });
  await createNotification(post.userId, me.id, "comment", postId);
  revalidatePath("/");
  revalidatePath(`/post/${postId}`);
  return { ok: true };
}

export async function deleteCommentAction(commentId: string): Promise<ActionResult> {
  const me = await requireUser();
  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);
  if (!comment) return { error: "Comment not found." };
  if (comment.userId !== me.id && !me.isAdmin) {
    return { error: "Not allowed." };
  }
  await db.delete(comments).where(eq(comments.id, commentId));
  revalidatePath("/");
  return { ok: true };
}

// ─────────────────────────── BOOKMARKS ───────────────────────────

export async function toggleBookmarkAction(postId: string) {
  const me = await getCurrentUser();
  if (!me) return { loginRequired: true };
  const existing = await db
    .select()
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, me.id), eq(bookmarks.postId, postId)))
    .limit(1);

  if (existing.length) {
    await db
      .delete(bookmarks)
      .where(and(eq(bookmarks.userId, me.id), eq(bookmarks.postId, postId)));
    revalidatePath("/");
    revalidatePath("/bookmarks");
    return { bookmarked: false };
  }
  await db.insert(bookmarks).values({ userId: me.id, postId });
  revalidatePath("/");
  revalidatePath("/bookmarks");
  return { bookmarked: true };
}

// ─────────────────────────── FOLLOWS ───────────────────────────

export async function toggleFollowAction(targetId: string) {
  const me = await getCurrentUser();
  if (!me) return { loginRequired: true };
  if (me.id === targetId) return { error: "You can't follow yourself." };

  const existing = await db
    .select()
    .from(follows)
    .where(and(eq(follows.followerId, me.id), eq(follows.followingId, targetId)))
    .limit(1);

  if (existing.length) {
    await db
      .delete(follows)
      .where(and(eq(follows.followerId, me.id), eq(follows.followingId, targetId)));
    revalidatePath("/");
    return { following: false };
  }
  await db.insert(follows).values({ followerId: me.id, followingId: targetId });
  await createNotification(targetId, me.id, "follow");
  revalidatePath("/");
  return { following: true };
}

// ─────────────────────────── PROFILE ───────────────────────────

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  const me = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const bio = String(formData.get("bio") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const avatar = String(formData.get("avatar") ?? "").trim();
  const cover = String(formData.get("cover") ?? "").trim();
  const interests = parseJsonField(formData.get("interests"));

  if (!name || !username) return { error: "Name and username are required." };
  if (!/^[a-z0-9._]{3,20}$/.test(username)) {
    return { error: "Username must be 3-20 characters." };
  }
  const clash = await db
    .select()
    .from(users)
    .where(and(eq(users.username, username), sql`${users.id} <> ${me.id}`))
    .limit(1);
  if (clash.length) return { error: "That username is already taken." };

  await db
    .update(users)
    .set({
      name,
      username,
      bio,
      website: website || null,
      avatar: avatar || null,
      cover: cover || null,
      interests,
    })
    .where(eq(users.id, me.id));

  revalidatePath("/");
  revalidatePath(`/profile/${username}`);
  revalidatePath(`/profile/${me.username}`);
  return { ok: true };
}

// ─────────────────────────── NOTIFICATIONS ───────────────────────────

export async function markAllReadAction() {
  const me = await requireUser();
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.toUserId, me.id), eq(notifications.read, false)));
  revalidatePath("/notifications");
  return { ok: true };
}

// ─────────────────────────── MESSAGES ───────────────────────────

export async function startChatAction(
  otherUserId: string,
): Promise<{ error?: string; chatId?: string; loginRequired?: boolean }> {
  const me = await getCurrentUser();
  if (!me) return { loginRequired: true };
  if (otherUserId === me.id) return { error: "That's you!" };

  const existing = await db
    .select()
    .from(chats)
    .where(and(eq(chats.type, "private"), sql`${chats.memberIds} @> ${JSON.stringify([me.id, otherUserId])}::jsonb`))
    .limit(1);

  if (existing.length) return { chatId: existing[0].id };

  const id = randomUUID();
  await db.insert(chats).values({
    id,
    type: "private",
    memberIds: [me.id, otherUserId],
    adminIds: [],
    lastMessage: "",
  });
  revalidatePath("/messages");
  return { chatId: id };
}

export async function sendMessageAction(chatId: string, content: string): Promise<ActionResult> {
  const me = await requireUser();
  const clean = content.trim();
  if (!clean) return { error: "Message can't be empty." };

  await db.insert(messages).values({
    id: randomUUID(),
    chatId,
    senderId: me.id,
    content: clean,
  });
  await db
    .update(chats)
    .set({ lastMessage: clean, lastMessageAt: new Date() })
    .where(eq(chats.id, chatId));

  // notify other members
  const [chat] = await db.select().from(chats).where(eq(chats.id, chatId)).limit(1);
  if (chat) {
    const others = (chat.memberIds ?? []).filter((id) => id !== me.id);
    for (const id of others) await createNotification(id, me.id, "message");
  }

  revalidatePath(`/messages/${chatId}`);
  revalidatePath("/messages");
  return { ok: true };
}

export async function createGroupAction(formData: FormData): Promise<ActionResult> {
  const me = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const memberIds = parseJsonField(formData.get("memberIds"));
  if (!name) return { error: "Group name is required." };
  const all = [...new Set([me.id, ...memberIds])].slice(0, 50);

  await db.insert(chats).values({
    id: randomUUID(),
    type: "group",
    name,
    memberIds: all,
    adminIds: [me.id],
    lastMessage: "",
  });
  revalidatePath("/messages");
  return { ok: true };
}

// ─────────────────────────── ADMIN ───────────────────────────

export async function toggleVerifiedAction(targetId: string) {
  const me = await requireUser();
  if (!me.isAdmin) return { error: "Admins only." };
  const [user] = await db.select().from(users).where(eq(users.id, targetId)).limit(1);
  if (!user) return { error: "User not found." };
  await db.update(users).set({ isVerified: !user.isVerified }).where(eq(users.id, targetId));
  revalidatePath("/admin");
  return { ok: true };
}

export async function banUserAction(targetId: string) {
  const me = await requireUser();
  if (!me.isAdmin) return { error: "Admins only." };
  if (targetId === me.id) return { error: "You can't ban yourself." };
  await db.delete(users).where(eq(users.id, targetId));
  revalidatePath("/admin");
  return { ok: true };
}

// ─────────────────────────── QUERY HELPERS (server components) ───────────────────────────

export async function getFeedPosts(limit = 20, offset = 0) {
  const me = await getCurrentUser();
  const rows = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
  return { posts: rows, meId: me?.id ?? null };
}

export async function getPostUserMap() {
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      avatar: users.avatar,
      isVerified: users.isVerified,
    })
    .from(users);
  return new Map(rows.map((u) => [u.id, u]));
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ followingId: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, userId));
  return rows.map((r) => r.followingId);
}
