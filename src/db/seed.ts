import { sql } from "drizzle-orm";
import { db } from "@/db";
import {
  users,
  posts,
  comments,
  follows,
  notifications,
  bookmarks,
  chats,
  messages,
  stories,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const hoursAgo = (n: number) => new Date(Date.now() - n * 60 * 60 * 1000);

export async function seedIfEmpty() {
  try {
    const existing = await db.execute(sql`select count(*)::int as c from users`);
    const count = (existing.rows[0] as { c: number } | undefined)?.c ?? 0;
    if (count > 0) return;
  } catch {
    // table may not exist yet; let caller handle
    return;
  }

  const pass = await hashPassword("demo1234");
  const adminPass = await hashPassword("admin1234");

  const userRows = [
    { id: "u1", username: "aarif", name: "Arif Rahman", email: "arif@rifav.app", passwordHash: pass, bio: "Dreamer ✦ Building things for the web. ✦ ঢাকার ছেলে 🖤", website: "https://aarif.dev", isVerified: true, isAdmin: false, interests: ["tech", "photography", "travel"] },
    { id: "u2", username: "meghna", name: "Meghna Chowdhury", email: "meghna@rifav.app", passwordHash: pass, bio: "📷 Photographer | Storyteller | Chasing light", website: "", isVerified: true, isAdmin: false, interests: ["photography", "art"] },
    { id: "u3", username: "tanvir", name: "Tanvir Ahmed", email: "tanvir@rifav.app", passwordHash: pass, bio: "🌍 32 countries and counting ✈️ Travel tips every week", website: "https://tanvir.travel", isVerified: false, isAdmin: false, interests: ["travel"] },
    { id: "u4", username: "nusrat", name: "Nusrat Jahan", email: "nusrat@rifav.app", passwordHash: pass, bio: "🍜 Food lover. Recipe hoarder. Biryani is life.", website: "", isVerified: false, isAdmin: false, interests: ["food", "lifestyle"] },
    { id: "u5", username: "rafi", name: "Rafi Hasan", email: "rafi@rifav.app", passwordHash: pass, bio: "🎸 Guitarist & singer-songwriter. New single out now 🎵", website: "https://linktr.ee/rafi", isVerified: false, isAdmin: false, interests: ["music"] },
    { id: "u6", username: "sadia", name: "Sadia Islam", email: "sadia@rifav.app", passwordHash: pass, bio: "👗 Fashion | Style inspo daily | DM for collabs", website: "", isVerified: true, isAdmin: false, interests: ["fashion", "lifestyle"] },
    { id: "u7", username: "farhan", name: "Farhan Kabir", email: "farhan@rifav.app", passwordHash: pass, bio: "💪 Fitness coach. Helping 10k+ people get stronger.", website: "", isVerified: false, isAdmin: false, interests: ["fitness", "health"] },
    { id: "u8", username: "priya", name: "Priya Das", email: "priya@rifav.app", passwordHash: pass, bio: "🎨 Illustrator. Painting the world in pastels.", website: "https://priya.art", isVerified: false, isAdmin: false, interests: ["art", "design"] },
    { id: "u9", username: "johncarter", name: "John Carter", email: "john@rifav.app", passwordHash: pass, bio: "💻 Full-stack dev. Open source enthusiast.", website: "", isVerified: false, isAdmin: false, interests: ["tech"] },
    { id: "u10", username: "emmawilson", name: "Emma Wilson", email: "emma@rifav.app", passwordHash: pass, bio: "✨ Product designer. Less, but better.", website: "https://emmaw.design", isVerified: true, isAdmin: false, interests: ["design", "tech"] },
    { id: "u11", username: "rifav", name: "Rifav Team", email: "admin@rifav.app", passwordHash: adminPass, bio: "Official account of Rifav. ✨", website: "https://rifav.app", isVerified: true, isAdmin: true, interests: [] },
    { id: "u12", username: "zara", name: "Zara Khan", email: "zara@rifav.app", passwordHash: pass, bio: "Keeping it private 🔒", website: "", isVerified: false, isAdmin: false, isPrivate: true, interests: ["lifestyle"] },
  ];

  await db.insert(users).values(userRows);

  const postRows = [
    { id: "p1", userId: "u1", caption: "Chasing neon dreams in the city ✨ #citylights #nightphotography", media: ["/seed/post-1.jpg"], hashtags: ["citylights", "nightphotography"], location: "Dhaka, Bangladesh", audience: "public", likes: ["u2", "u3", "u5", "u6", "u8", "u9"], createdAt: hoursAgo(3) },
    { id: "p2", userId: "u2", caption: "Golden hour hits different over the hills. Worth every step. 🏔️ #travel #nature #wanderlust", media: ["/seed/post-3.jpg"], hashtags: ["travel", "nature", "wanderlust"], location: "Sajek Valley", audience: "public", likes: ["u1", "u3", "u4", "u6", "u7", "u10", "u11"], createdAt: hoursAgo(6) },
    { id: "p3", userId: "u10", caption: "Slow mornings, hot coffee, and a clean workspace. The recipe for deep work. ☕ #desksetup #minimal", media: ["/seed/post-2.jpg"], hashtags: ["desksetup", "minimal"], location: "Berlin, Germany", audience: "public", likes: ["u1", "u9", "u8"], createdAt: hoursAgo(9) },
    { id: "p4", userId: "u6", caption: "Fresh pair for the season 👟 What do you think of this colorway? #sneakers #fashion", media: ["/seed/post-4.jpg"], hashtags: ["sneakers", "fashion"], location: "Gulshan, Dhaka", audience: "public", likes: ["u1", "u2", "u4", "u12"], createdAt: hoursAgo(12) },
    { id: "p5", userId: "u4", caption: "Homemade biryani — the one dish that never fails to fix a bad day. 🍛❤️ #foodporn #biriyani", media: ["/seed/post-5.jpg"], hashtags: ["foodporn", "biriyani"], location: "", audience: "public", likes: ["u1", "u2", "u3", "u5", "u6", "u7", "u11"], createdAt: hoursAgo(18) },
    { id: "p6", userId: "u5", caption: "Last night was electric ⚡ Thank you for singing along. More to come! 🎤 #livemusic #concert", media: ["/seed/post-6.jpg"], hashtags: ["livemusic", "concert"], location: "Dhaka", audience: "public", likes: ["u1", "u2", "u6", "u8"], createdAt: hoursAgo(26) },
    { id: "p7", userId: "u1", caption: "Reminder to yourself: progress over perfection. Keep shipping. 🚀 #buildinpublic #dev", media: [], hashtags: ["buildinpublic", "dev"], location: "", audience: "public", likes: ["u9", "u10"], createdAt: hoursAgo(30) },
    { id: "p8", userId: "u3", caption: "Found this hidden waterfall after a 2 hour hike. Totally worth it 🌊 #hiking #adventure #travel", media: ["/seed/post-3.jpg"], hashtags: ["hiking", "adventure", "travel"], location: "Bandarban", audience: "public", likes: ["u1", "u2", "u5", "u7", "u12"], createdAt: daysAgo(2) },
    { id: "p9", userId: "u8", caption: "New illustration drop 🎨 inspired by the monsoons. Prints available on my site. #art #illustration", media: ["/seed/post-2.jpg"], hashtags: ["art", "illustration"], location: "Kolkata, India", audience: "public", likes: ["u1", "u2", "u6", "u10"], createdAt: daysAgo(2) },
    { id: "p10", userId: "u7", caption: "Your Monday doesn't care how you feel. Show up anyway. 💪 #fitness #motivation", media: [], hashtags: ["fitness", "motivation"], location: "", audience: "public", likes: ["u1", "u3", "u5"], createdAt: daysAgo(3) },
    { id: "p11", userId: "u2", caption: "Monsoon mood in the old town 🌧️ #streetphotography #monsoon", media: ["/seed/post-1.jpg"], hashtags: ["streetphotography", "monsoon"], location: "Old Dhaka", audience: "public", likes: ["u1", "u4", "u8", "u9"], createdAt: daysAgo(3) },
    { id: "p12", userId: "u4", caption: "Street food tour recap part 1 🍢 Fuchka > everything. #streetfood #dhaka", media: ["/seed/post-5.jpg"], hashtags: ["streetfood", "dhaka"], location: "Dhanmondi", audience: "public", likes: ["u1", "u2", "u6", "u7", "u12"], createdAt: daysAgo(4) },
    { id: "p13", userId: "u9", caption: "Shipped v2 of my side project today. 3am commits were worth it. #buildinpublic #opensource", media: [], hashtags: ["buildinpublic", "opensource"], location: "", audience: "public", likes: ["u1", "u10"], createdAt: daysAgo(4) },
    { id: "p14", userId: "u11", caption: "Welcome to Rifav! 🎉 We're building a community for creators. Drop your first post and say hi 👋 #rifav #community", media: ["/seed/post-6.jpg"], hashtags: ["rifav", "community"], location: "", audience: "public", likes: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8", "u9", "u10"], createdAt: daysAgo(5) },
  ];

  await db.insert(posts).values(postRows);

  const commentRows = [
    { id: "c1", postId: "p1", userId: "u2", text: "This is gorgeous! 😍", createdAt: hoursAgo(2) },
    { id: "c2", postId: "p1", userId: "u3", text: "Where was this taken?", createdAt: hoursAgo(1) },
    { id: "c3", postId: "p2", userId: "u1", text: "Absolutely stunning shot, Meghna 🙌", createdAt: hoursAgo(5) },
    { id: "c4", postId: "p2", userId: "u4", text: "Adding this to my bucket list!", createdAt: hoursAgo(4) },
    { id: "c5", postId: "p3", userId: "u9", text: "Clean setup. What monitor is that?", createdAt: hoursAgo(8) },
    { id: "c6", postId: "p5", userId: "u1", text: "আমার জন্য এক প্লেট রাখবেন 😋", createdAt: hoursAgo(16) },
    { id: "c7", postId: "p6", userId: "u2", text: "Epic night 🔥", createdAt: hoursAgo(20) },
    { id: "c8", postId: "p14", userId: "u1", text: "So excited to be here! 🎉", createdAt: daysAgo(5) },
  ];

  await db.insert(comments).values(commentRows);

  // aarif follows everyone; others follow back
  const followRows = [
    { followerId: "u1", followingId: "u2", createdAt: daysAgo(20) },
    { followerId: "u1", followingId: "u3", createdAt: daysAgo(19) },
    { followerId: "u1", followingId: "u4", createdAt: daysAgo(18) },
    { followerId: "u1", followingId: "u5", createdAt: daysAgo(17) },
    { followerId: "u1", followingId: "u6", createdAt: daysAgo(16) },
    { followerId: "u1", followingId: "u7", createdAt: daysAgo(15) },
    { followerId: "u1", followingId: "u8", createdAt: daysAgo(14) },
    { followerId: "u1", followingId: "u9", createdAt: daysAgo(13) },
    { followerId: "u1", followingId: "u10", createdAt: daysAgo(12) },
    { followerId: "u1", followingId: "u11", createdAt: daysAgo(11) },
    { followerId: "u2", followingId: "u1", createdAt: daysAgo(20) },
    { followerId: "u3", followingId: "u1", createdAt: daysAgo(18) },
    { followerId: "u4", followingId: "u1", createdAt: daysAgo(17) },
    { followerId: "u5", followingId: "u1", createdAt: daysAgo(16) },
    { followerId: "u6", followingId: "u1", createdAt: daysAgo(15) },
    { followerId: "u8", followingId: "u1", createdAt: daysAgo(14) },
    { followerId: "u9", followingId: "u1", createdAt: daysAgo(13) },
    { followerId: "u10", followingId: "u1", createdAt: daysAgo(12) },
    { followerId: "u11", followingId: "u1", createdAt: daysAgo(11) },
    { followerId: "u2", followingId: "u3", createdAt: daysAgo(10) },
    { followerId: "u2", followingId: "u6", createdAt: daysAgo(9) },
    { followerId: "u3", followingId: "u2", createdAt: daysAgo(8) },
    { followerId: "u4", followingId: "u2", createdAt: daysAgo(7) },
    { followerId: "u6", followingId: "u4", createdAt: daysAgo(6) },
    { followerId: "u5", followingId: "u6", createdAt: daysAgo(5) },
  ];
  await db.insert(follows).values(followRows);

  const bookmarkRows = [
    { userId: "u1", postId: "p2", createdAt: hoursAgo(5) },
    { userId: "u1", postId: "p5", createdAt: hoursAgo(10) },
    { userId: "u1", postId: "p3", createdAt: hoursAgo(8) },
  ];
  await db.insert(bookmarks).values(bookmarkRows);

  const notifRows = [
    { id: "n1", toUserId: "u1", fromUserId: "u2", type: "like", postId: "p1", read: false, createdAt: hoursAgo(2) },
    { id: "n2", toUserId: "u1", fromUserId: "u3", type: "comment", postId: "p1", read: false, createdAt: hoursAgo(1) },
    { id: "n3", toUserId: "u1", fromUserId: "u6", type: "follow", postId: null, read: false, createdAt: hoursAgo(4) },
    { id: "n4", toUserId: "u1", fromUserId: "u2", type: "message", postId: null, read: false, createdAt: hoursAgo(3) },
    { id: "n5", toUserId: "u1", fromUserId: "u4", type: "like", postId: "p5", read: true, createdAt: hoursAgo(15) },
    { id: "n6", toUserId: "u1", fromUserId: "u11", type: "follow", postId: null, read: true, createdAt: daysAgo(1) },
  ];
  await db.insert(notifications).values(notifRows);

  const chatRows = [
    { id: "ch1", type: "private", name: null, photo: null, memberIds: ["u1", "u2"], adminIds: [], lastMessage: "Your shots are unreal 🔥", lastMessageAt: hoursAgo(3), createdAt: daysAgo(20) },
    { id: "ch2", type: "private", name: null, photo: null, memberIds: ["u1", "u9"], adminIds: [], lastMessage: "Let's pair program soon", lastMessageAt: daysAgo(1), createdAt: daysAgo(15) },
    { id: "ch3", type: "group", name: "Rifav Creators", photo: null, memberIds: ["u1", "u2", "u4", "u5", "u6", "u10"], adminIds: ["u1"], lastMessage: "Nusrat: post the recap 🙌", lastMessageAt: hoursAgo(7), createdAt: daysAgo(10) },
  ];
  await db.insert(chats).values(chatRows);

  const messageRows = [
    { id: "m1", chatId: "ch1", senderId: "u2", content: "Hey! Saw your neon city post, so good 😍", createdAt: hoursAgo(5) },
    { id: "m2", chatId: "ch1", senderId: "u1", content: "Thanks Meghna! Your golden hour one was unreal", createdAt: hoursAgo(4) },
    { id: "m3", chatId: "ch1", senderId: "u2", content: "We should do a collab sometime 📸", createdAt: hoursAgo(3) },
    { id: "m4", chatId: "ch1", senderId: "u1", content: "Definitely! Let's plan it", createdAt: hoursAgo(2) },
    { id: "m5", chatId: "ch2", senderId: "u9", content: "Merged your PR, great work man", createdAt: daysAgo(1) },
    { id: "m6", chatId: "ch3", senderId: "u4", content: "post the recap 🙌", createdAt: hoursAgo(7) },
    { id: "m7", chatId: "ch3", senderId: "u5", content: "On it 😄", createdAt: hoursAgo(6) },
  ];
  await db.insert(messages).values(messageRows);

  const storyRows = [
    { id: "s1", userId: "u2", media: "/seed/post-3.jpg", text: "Golden hour 🧡", color: "#7c3aed", viewers: ["u1", "u3"], createdAt: hoursAgo(2), expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000) },
    { id: "s2", userId: "u4", media: "/seed/post-5.jpg", text: "Lunch time 🍛", color: "#db2777", viewers: ["u1"], createdAt: hoursAgo(5), expiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000) },
    { id: "s3", userId: "u5", media: "/seed/post-6.jpg", text: "New music soon 🎸", color: "#0891b2", viewers: [], createdAt: hoursAgo(8), expiresAt: new Date(Date.now() + 16 * 60 * 60 * 1000) },
  ];
  await db.insert(stories).values(storyRows);

  console.log("✓ Rifav demo data seeded");
}
