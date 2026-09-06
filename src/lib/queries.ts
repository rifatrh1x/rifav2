import { and, desc, eq, inArray, ne, sql, asc } from "drizzle-orm";
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
  stories,
  type Post,
  type User,
} from "@/db/schema";

export interface AuthorRef {
  id: string;
  username: string;
  name: string;
  avatar: string | null;
  isVerified: boolean;
}

export interface CommentView {
  id: string;
  text: string;
  createdAt: Date;
  user: AuthorRef;
}

export interface PostView {
  post: Post;
  author: AuthorRef;
  meLiked: boolean;
  meBookmarked: boolean;
  isFollowing: boolean;
  comments: CommentView[];
}

async function userMap(ids: string[]): Promise<Map<string, AuthorRef>> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return new Map();
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      avatar: users.avatar,
      isVerified: users.isVerified,
    })
    .from(users)
    .where(inArray(users.id, unique));
  return new Map(rows.map((r) => [r.id, r]));
}

export async function followingSet(userId: string): Promise<Set<string>> {
  const rows = await db
    .select({ followingId: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, userId));
  return new Set(rows.map((r) => r.followingId));
}

export async function bookmarkSet(userId: string, postIds: string[]): Promise<Set<string>> {
  if (postIds.length === 0) return new Set();
  const rows = await db
    .select({ postId: bookmarks.postId })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), inArray(bookmarks.postId, postIds)));
  return new Set(rows.map((r) => r.postId));
}

export async function assemblePosts(
  postRows: Post[],
  meId: string | null,
): Promise<PostView[]> {
  if (postRows.length === 0) return [];

  const authorIds = postRows.map((p) => p.userId);
  const authors = await userMap(authorIds);

  const postIds = postRows.map((p) => p.id);
  const commentRows = await db
    .select()
    .from(comments)
    .where(inArray(comments.postId, postIds))
    .orderBy(asc(comments.createdAt));

  const commentUserIds = commentRows.map((c) => c.userId);
  const commentUsers = await userMap(commentUserIds);

  const myBookmarks = meId ? await bookmarkSet(meId, postIds) : new Set<string>();
  const myFollowing = meId ? await followingSet(meId) : new Set<string>();

  const commentsByPost = new Map<string, CommentView[]>();
  for (const c of commentRows) {
    const u = commentUsers.get(c.userId);
    if (!u) continue;
    const list = commentsByPost.get(c.postId) ?? [];
    list.push({ id: c.id, text: c.text, createdAt: c.createdAt, user: u });
    commentsByPost.set(c.postId, list);
  }

  return postRows.map((post) => {
    const author = authors.get(post.userId) ?? {
      id: post.userId,
      username: "unknown",
      name: "Unknown",
      avatar: null,
      isVerified: false,
    };
    return {
      post,
      author,
      meLiked: meId ? post.likes.includes(meId) : false,
      meBookmarked: myBookmarks.has(post.id),
      isFollowing: meId ? myFollowing.has(post.userId) : false,
      comments: commentsByPost.get(post.id) ?? [],
    };
  });
}

export async function getFeed(meId: string | null, limit = 20, offset = 0) {
  const rows = await db
    .select()
    .from(posts)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);
  return assemblePosts(rows, meId);
}

export async function getPostDetail(postId: string, meId: string | null) {
  const rows = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
  const view = await assemblePosts(rows, meId);
  return view[0] ?? null;
}

export interface ProfileView {
  user: User;
  posts: PostView[];
  postCount: number;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
  isMe: boolean;
  mutual: AuthorRef[];
}

export async function getProfile(username: string, meId: string | null) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (!user) return null;

  const postRows = await db
    .select()
    .from(posts)
    .where(eq(posts.userId, user.id))
    .orderBy(desc(posts.createdAt));
  const views = await assemblePosts(postRows, meId);

  const [f1] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(follows)
    .where(eq(follows.followingId, user.id));
  const [f2] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(follows)
    .where(eq(follows.followerId, user.id));

  const isFollowing = meId
    ? (
        await db
          .select()
          .from(follows)
          .where(
            and(eq(follows.followerId, meId), eq(follows.followingId, user.id)),
          )
          .limit(1)
      ).length > 0
    : false;

  // mutual: people I follow who also follow this user (excluding me)
  let mutual: AuthorRef[] = [];
  if (meId && meId !== user.id) {
    const myFollow = await followingSet(meId);
    const theirFollowers = await db
      .select({ followerId: follows.followerId })
      .from(follows)
      .where(eq(follows.followingId, user.id));
    const mutualIds = theirFollowers
      .map((r) => r.followerId)
      .filter((id) => myFollow.has(id))
      .slice(0, 4);
    const m = await userMap(mutualIds);
    mutual = mutualIds.map((id) => m.get(id)!).filter(Boolean);
  }

  return {
    user,
    posts: views,
    postCount: postRows.length,
    followersCount: f1?.c ?? 0,
    followingCount: f2?.c ?? 0,
    isFollowing,
    isMe: meId === user.id,
    mutual,
  };
}

export interface NotifView {
  n: (typeof notifications.$inferSelect);
  actor: AuthorRef | null;
  post: Post | null;
}

export async function getNotifications(meId: string) {
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.toUserId, meId))
    .orderBy(desc(notifications.createdAt))
    .limit(40);

  const actorIds = rows.map((n) => n.fromUserId).filter(Boolean) as string[];
  const postIds = rows.map((n) => n.postId).filter(Boolean) as string[];
  const actors = await userMap(actorIds);
  const postRows = postIds.length
    ? await db.select().from(posts).where(inArray(posts.id, postIds))
    : [];
  const postMap = new Map(postRows.map((p) => [p.id, p]));

  return rows.map((n) => ({
    n,
    actor: n.fromUserId ? actors.get(n.fromUserId) ?? null : null,
    post: n.postId ? postMap.get(n.postId) ?? null : null,
  }));
}

export async function getSuggestions(meId: string, limit = 5): Promise<AuthorRef[]> {
  const following = await followingSet(meId);
  const exclude = [...following, meId];
  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      avatar: users.avatar,
      isVerified: users.isVerified,
    })
    .from(users)
    .where(ne(users.id, meId))
    .limit(50);
  return rows.filter((u) => !exclude.includes(u.id)).slice(0, limit);
}

export async function getTrendingHashtags() {
  const rows = await db.select({ hashtags: posts.hashtags }).from(posts).limit(500);
  const counts = new Map<string, number>();
  for (const r of rows) {
    for (const tag of r.hashtags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, posts]) => ({ tag, posts }))
    .sort((a, b) => b.posts - a.posts)
    .slice(0, 10);
}

export async function searchAll(q: string, meId: string | null) {
  const term = q.trim();
  if (!term) return { users: [] as AuthorRef[], posts: [] as PostView[] };

  const like = `%${term.toLowerCase()}%`;
  const userRows = await db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      avatar: users.avatar,
      isVerified: users.isVerified,
    })
    .from(users)
    .where(sql`(lower(${users.name}) like ${like} or lower(${users.username}) like ${like})`)
    .limit(20);

  const postRows = await db
    .select()
    .from(posts)
    .where(sql`lower(coalesce(${posts.caption},'')) like ${like}`)
    .orderBy(desc(posts.createdAt))
    .limit(20);

  const postViews = await assemblePosts(postRows, meId);
  return { users: userRows, posts: postViews };
}

export async function getBookmarkedPosts(meId: string) {
  const rows = await db
    .select({ postId: bookmarks.postId })
    .from(bookmarks)
    .where(eq(bookmarks.userId, meId))
    .orderBy(desc(bookmarks.createdAt));
  if (rows.length === 0) return [];
  const postIds = rows.map((r) => r.postId);
  const postRows = await db
    .select()
    .from(posts)
    .where(inArray(posts.id, postIds));
  const ordered = postIds
    .map((id) => postRows.find((p) => p.id === id))
    .filter((p): p is Post => Boolean(p));
  return assemblePosts(ordered, meId);
}

export interface ChatView {
  chat: (typeof chats.$inferSelect);
  other: AuthorRef | null;
  lastMessageAt: Date;
  preview: string;
}

export async function getChats(meId: string) {
  const rows = await db
    .select()
    .from(chats)
    .where(sql`${chats.memberIds} @> ${JSON.stringify([meId])}::jsonb`)
    .orderBy(desc(chats.lastMessageAt));
  const others = new Set<string>();
  for (const c of rows) {
    for (const m of c.memberIds) if (m !== meId) others.add(m);
  }
  const usersMap = await userMap([...others]);
  return rows.map((chat) => {
    const members = chat.memberIds.filter((m) => m !== meId);
    const other = members[0] ? usersMap.get(members[0]) ?? null : null;
    return {
      chat,
      other,
      lastMessageAt: chat.lastMessageAt,
      preview: chat.lastMessage || "Say hi 👋",
    };
  });
}

export async function getChatThread(chatId: string, meId: string) {
  const [chat] = await db.select().from(chats).where(eq(chats.id, chatId)).limit(1);
  if (!chat) return null;
  if (!chat.memberIds.includes(meId)) return null;

  const msgRows = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(asc(messages.createdAt))
    .limit(200);

  const senders = await userMap(msgRows.map((m) => m.senderId));
  const members = await userMap(chat.memberIds);

  return {
    chat,
    members,
    messages: msgRows.map((m) => ({
      m,
      sender: senders.get(m.senderId) ?? null,
    })),
  };
}

export async function getStories(meId: string | null) {
  const now = Date.now();
  const rows = await db
    .select()
    .from(stories)
    .orderBy(asc(stories.createdAt));
  const live = rows.filter((s) => new Date(s.expiresAt).getTime() > now);
  const uids = [...new Set(live.map((s) => s.userId))];
  const umap = await userMap(uids);
  return rows
    .map((s) => ({ s, user: umap.get(s.userId) ?? null }))
    .filter((x): x is { s: typeof x.s; user: AuthorRef } => Boolean(x.user));
}

export async function getAdminStats() {
  const [u] = await db.select({ c: sql<number>`count(*)::int` }).from(users);
  const [p] = await db.select({ c: sql<number>`count(*)::int` }).from(posts);
  const [cm] = await db.select({ c: sql<number>`count(*)::int` }).from(comments);
  const [nf] = await db.select({ c: sql<number>`count(*)::int` }).from(follows);
  return { users: u?.c ?? 0, posts: p?.c ?? 0, comments: cm?.c ?? 0, follows: nf?.c ?? 0 };
}

export async function getAllUsers() {
  return db
    .select({
      id: users.id,
      username: users.username,
      name: users.name,
      email: users.email,
      avatar: users.avatar,
      isVerified: users.isVerified,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));
}
