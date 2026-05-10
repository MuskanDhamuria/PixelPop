import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.ts";
const app = new Hono();

const contentList = async (prefix: string) => {
  const items = await kv.getByPrefix(prefix);
  return items.sort((a, b) => {
    const left = a.rank ?? a.order ?? a.id ?? 0;
    const right = b.rank ?? b.order ?? b.id ?? 0;
    return typeof left === "number" && typeof right === "number"
      ? left - right
      : String(left).localeCompare(String(right));
  });
};

const gameReviews = async (gameId: number) => {
  const reviews = await kv.getByPrefix(`game-review:${gameId}:`);
  return reviews.sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime());
};

const normalizeGame = async (game) => {
  const reviews = await gameReviews(Number(game.id));
  const reviewCount = reviews.length;
  const rating = reviewCount > 0
    ? Number((reviews.reduce((total, review) => total + Number(review.rating ?? 0), 0) / reviewCount).toFixed(1))
    : 0;

  return {
    ...game,
    rating,
    reviewCount,
    reviews,
  };
};

const gamesList = async () => {
  const games = await contentList("game:");
  return Promise.all(games.map(normalizeGame));
};

const leaderboardEntries = async () => {
  const profiles = await kv.getByPrefix("user-profile:");
  return profiles
    .map((profile) => {
      const score = Number(profile.xp ?? 0);
      const games = Number(profile.gamesPlayed ?? 0);
      const level = Number(profile.level ?? 1);
      const progress = Math.min(100, Math.max(0, score % 1000 / 10));

      return {
        id: profile.id,
        username: profile.username ?? "Player",
        score,
        games,
        level,
        progress,
      };
    })
    .sort((a, b) => b.score - a.score || b.games - a.games || a.username.localeCompare(b.username))
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
};

const communityPosts = async () => {
  const posts = await kv.getByPrefix("community-post:");
  return posts.map((post) => ({
    ...post,
    likes: Number(post.likes ?? post.likedBy?.length ?? 0),
    likedBy: post.likedBy ?? [],
    replies: Number(post.replies ?? post.comments?.length ?? 0),
    comments: post.comments ?? [],
  })).sort((a, b) => {
    const left = new Date(a.timestamp ?? 0).getTime();
    const right = new Date(b.timestamp ?? 0).getTime();
    return right - left;
  });
};

const findCommunityPost = async (postId: string) => {
  const entries = await kv.getEntriesByPrefix("community-post:");
  return entries.find((entry) => entry.value?.id === postId) ?? null;
};

const profileToFriend = (profile) => ({
  id: profile.id,
  username: profile.username,
  avatar: profile.avatar,
  level: profile.level ?? 1,
  status: "offline",
});

const userActivity = (profile, description) => ({
  id: crypto.randomUUID(),
  userId: profile.id,
  username: profile.username,
  avatar: profile.avatar,
  type: "friend_added",
  description,
  timestamp: new Date().toISOString(),
});

const conversationKey = (userId: string, friendId: string) =>
  `friend-chat:${[userId, friendId].sort().join(":")}`;

const readReceiptKey = (userId: string, friendId: string) =>
  `friend-chat-read:${userId}:${friendId}`;

const getAuthorizedUser = async (c) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
  );

  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { user: null, error: "Unauthorized" };
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { user: null, error: "Unauthorized" };
  }

  return { user, error: null };
};

const createProfile = (user) => ({
  id: user.id,
  email: user.email ?? '',
  username: user.user_metadata?.username ?? user.email?.split('@')[0] ?? '',
  avatar: user.user_metadata?.avatar_url,
  bio: '',
  level: 1,
  xp: 0,
  xpToNextLevel: 1000,
  gamesPlayed: 0,
  totalPlayTime: 0,
  favoriteGenre: '',
  joinDate: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  achievements: [],
  favorites: [],
  recentlyPlayed: [],
  streak: 0,
  lastPlayDate: '',
  friends: [],
  friendRequests: [],
});

const calculateLevel = (xp: number) => Math.floor(xp / 1000) + 1;

const xpForNextLevel = (level: number) => level * 1000;

const recordGamePlay = (profile, gameId: number, gameName: string) => {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const recentlyPlayed = profile.recentlyPlayed ?? [];
  const achievements = [...(profile.achievements ?? [])];
  const nextGamesPlayed = Number(profile.gamesPlayed ?? 0) + 1;
  let xp = Number(profile.xp ?? 0) + 50;
  let streak = Number(profile.streak ?? 0);
  let lastPlayDate = profile.lastPlayDate ?? "";

  const awardAchievement = (achievementId: string) => {
    if (!achievements.includes(achievementId)) {
      achievements.push(achievementId);
      xp += 100;
    }
  };

  if (lastPlayDate !== today) {
    streak = lastPlayDate === yesterday ? streak + 1 : 1;
    lastPlayDate = today;
  }

  if (nextGamesPlayed >= 1) awardAchievement("first_game");
  if (nextGamesPlayed >= 10) awardAchievement("games_10");
  if (nextGamesPlayed >= 50) awardAchievement("games_50");
  if (nextGamesPlayed >= 100) awardAchievement("games_100");
  if (nextGamesPlayed >= 1000) awardAchievement("games_1000");
  if (nextGamesPlayed >= 1000000) awardAchievement("games_1000000");
  if (nextGamesPlayed >= 100000000000) awardAchievement("games_100000000000");

  const level = calculateLevel(xp);
  const newRecent = {
    gameId,
    gameName,
    playedAt: new Date().toISOString(),
    duration: 5,
  };

  return {
    ...profile,
    recentlyPlayed: [newRecent, ...recentlyPlayed.filter((game) => game.gameId !== gameId)].slice(0, 10),
    gamesPlayed: nextGamesPlayed,
    xp,
    level,
    xpToNextLevel: xpForNextLevel(level),
    streak,
    lastPlayDate,
    achievements,
    lastLogin: new Date().toISOString(),
  };
};

const buildGamesContext = (games) =>
  games.map((game) =>
    `${game.name}: ${game.description} Genre=${game.badge}; Difficulty=${game.difficulty}; Players=${game.playerCount}; Duration=${game.duration}; Rating=${game.rating ?? 0}`
  ).join("\n");

const extractGeminiText = (payload) =>
  payload?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join("\n")
    .trim();

const sanitizeChatbotReply = (reply: string) =>
  reply
    .replace(/[*_`~#>|[\]{}]/g, "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "apikey", "x-client-info"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-9f7f41c6/health", (c) => {
  return c.json({ status: "ok" });
});

app.get("/make-server-9f7f41c6/games", async (c) => {
  try {
    return c.json(await gamesList());
  } catch (error) {
    console.log(`Get games exception: ${error}`);
    return c.json({ error: "Failed to get games" }, 500);
  }
});

app.post("/make-server-9f7f41c6/games/seed", async (c) => {
  try {
    const existingGames = await contentList("game:");
    if (existingGames.length > 0) {
      return c.json(await gamesList());
    }

    const { games } = await c.req.json();
    if (!Array.isArray(games)) {
      return c.json({ error: "Games array is required" }, 400);
    }

    await Promise.all(games.map((game) => kv.set(`game:${game.id}`, {
      ...game,
      rating: 0,
      reviewCount: 0,
      reviews: [],
    })));

    return c.json(await gamesList(), 201);
  } catch (error) {
    console.log(`Seed games exception: ${error}`);
    return c.json({ error: "Failed to seed games" }, 500);
  }
});

app.post("/make-server-9f7f41c6/games/:id/reviews", async (c) => {
  try {
    const { user, error } = await getAuthorizedUser(c);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const gameId = Number(c.req.param("id"));
    const game = await kv.get(`game:${gameId}`);
    if (!game) {
      return c.json({ error: "Game not found" }, 404);
    }

    const { rating, comment } = await c.req.json();
    const numericRating = Number(rating);
    const trimmedComment = typeof comment === "string" ? comment.trim() : "";
    if (!Number.isFinite(numericRating) || numericRating < 1 || numericRating > 5) {
      return c.json({ error: "Rating must be between 1 and 5" }, 400);
    }
    if (!trimmedComment) {
      return c.json({ error: "Review comment is required" }, 400);
    }

    const profile = await kv.get(`user-profile:${user.id}`);
    const username = profile?.username ?? user.user_metadata?.username ?? user.email?.split("@")[0] ?? "Player";
    const review = {
      id: crypto.randomUUID(),
      userId: user.id,
      username,
      rating: numericRating,
      comment: trimmedComment,
      helpful: 0,
      notHelpful: 0,
      timestamp: new Date().toISOString(),
    };

    await kv.set(`game-review:${gameId}:${review.timestamp}:${review.id}`, review);
    return c.json(await normalizeGame(game), 201);
  } catch (error) {
    console.log(`Create game review exception: ${error}`);
    return c.json({ error: "Failed to create review" }, 500);
  }
});

app.get("/make-server-9f7f41c6/achievements", async (c) => {
  return c.json(await contentList("achievement:"));
});

app.post("/make-server-9f7f41c6/achievements/seed", async (c) => {
  try {
    const { achievements } = await c.req.json();
    if (!Array.isArray(achievements)) {
      return c.json({ error: "Achievements array is required" }, 400);
    }

    await Promise.all(achievements.map((achievement) => kv.set(`achievement:${achievement.id}`, achievement)));
    return c.json(await contentList("achievement:"), 201);
  } catch (error) {
    console.log(`Seed achievements exception: ${error}`);
    return c.json({ error: "Failed to seed achievements" }, 500);
  }
});

app.get("/make-server-9f7f41c6/daily-challenges", async (c) => {
  return c.json(await contentList("daily-challenge:"));
});

app.post("/make-server-9f7f41c6/chatbot", async (c) => {
  try {
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY") ?? Deno.env.get("VITE_GEMINI_API_KEY");
    const geminiModel = Deno.env.get("GEMINI_MODEL") ?? Deno.env.get("VITE_GEMINI_MODEL") ?? "gemini-3-flash-preview";

    if (!geminiApiKey) {
      return c.json({ error: "Gemini API key is not configured" }, 503);
    }

    const { message, history, games } = await c.req.json();
    const trimmedMessage = typeof message === "string" ? message.trim() : "";
    const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
    const availableGames = Array.isArray(games) ? games : await gamesList();

    if (!trimmedMessage) {
      return c.json({ error: "Message is required" }, 400);
    }

    const prompt = [
      "You are PixelBot, the friendly AI gaming assistant for PixelPop.",
      "Help users pick games, compare games, and understand PixelPop features.",
      "Use the available game data below. If the user asks for an easy game, prioritize difficulty=Easy. If they follow up with a short preference, use the chat history for context.",
      "Keep answers short, helpful, and specific. Recommend at most 3 games unless asked for more.",
      "Always finish your final sentence. Do not end mid-sentence.",
      "Use plain text only. Do not use markdown, bullets, asterisks, backticks, headings, symbols, or decorative characters.",
      "",
      "Available games:",
      buildGamesContext(availableGames),
      "",
      "Recent chat:",
      recentHistory.map((item) => `${item.sender === "bot" ? "PixelBot" : "User"}: ${item.text}`).join("\n"),
      "",
      `User: ${trimmedMessage}`,
    ].join("\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
          },
        }),
      },
    );

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      console.log(`Gemini chatbot error: ${JSON.stringify(payload)}`);
      return c.json({ error: "PixelBot could not reach Gemini" }, 502);
    }

    const reply = extractGeminiText(payload);
    if (!reply) {
      return c.json({ error: "Gemini returned an empty response" }, 502);
    }

    return c.json({ reply: sanitizeChatbotReply(reply) });
  } catch (error) {
    console.log(`Chatbot exception: ${error}`);
    return c.json({ error: "Failed to generate chatbot response" }, 500);
  }
});

app.get("/make-server-9f7f41c6/leaderboard", async (c) => {
  try {
    return c.json(await leaderboardEntries());
  } catch (error) {
    console.log(`Get leaderboard exception: ${error}`);
    return c.json({ error: "Failed to get leaderboard" }, 500);
  }
});

app.get("/make-server-9f7f41c6/community-posts", async (c) => {
  try {
    return c.json(await communityPosts());
  } catch (error) {
    console.log(`Get community posts exception: ${error}`);
    return c.json({ error: `Failed to load community posts: ${error}` }, 500);
  }
});

app.post("/make-server-9f7f41c6/community-posts", async (c) => {
  try {
    const { user, error } = await getAuthorizedUser(c);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { content } = await c.req.json();
    const trimmedContent = typeof content === "string" ? content.trim() : "";
    if (!trimmedContent) {
      return c.json({ error: "Post content is required" }, 400);
    }

    const profile = await kv.get(`user-profile:${user.id}`);
    const username = profile?.username ?? user.user_metadata?.username ?? user.email?.split("@")[0] ?? "Player";
    const timestamp = new Date().toISOString();
    const post = {
      id: crypto.randomUUID(),
      user: username,
      avatar: username.slice(0, 2).toUpperCase(),
      timestamp,
      content: trimmedContent,
      likes: 0,
      likedBy: [],
      replies: 0,
      comments: [],
    };

    await kv.set(`community-post:${timestamp}:${post.id}`, post);
    return c.json(post, 201);
  } catch (error) {
    console.log(`Create community post exception: ${error}`);
    return c.json({ error: "Failed to create community post" }, 500);
  }
});

app.post("/make-server-9f7f41c6/community-posts/:id/like", async (c) => {
  try {
    const { user, error } = await getAuthorizedUser(c);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const postId = c.req.param("id");
    const entry = await findCommunityPost(postId);
    if (!entry) {
      return c.json({ error: "Post not found" }, 404);
    }

    const likedBy = entry.value.likedBy ?? [];
    const updatedLikedBy = likedBy.includes(user.id)
      ? likedBy.filter((id) => id !== user.id)
      : [...likedBy, user.id];
    const updatedPost = {
      ...entry.value,
      likedBy: updatedLikedBy,
      likes: updatedLikedBy.length,
      replies: Number(entry.value.replies ?? entry.value.comments?.length ?? 0),
      comments: entry.value.comments ?? [],
    };

    await kv.set(entry.key, updatedPost);
    return c.json(updatedPost);
  } catch (error) {
    console.log(`Like community post exception: ${error}`);
    return c.json({ error: "Failed to like post" }, 500);
  }
});

app.post("/make-server-9f7f41c6/community-posts/:id/comments", async (c) => {
  try {
    const { user, error } = await getAuthorizedUser(c);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const postId = c.req.param("id");
    const entry = await findCommunityPost(postId);
    if (!entry) {
      return c.json({ error: "Post not found" }, 404);
    }

    const { content } = await c.req.json();
    const trimmedContent = typeof content === "string" ? content.trim() : "";
    if (!trimmedContent) {
      return c.json({ error: "Comment content is required" }, 400);
    }

    const profile = await kv.get(`user-profile:${user.id}`);
    const username = profile?.username ?? user.user_metadata?.username ?? user.email?.split("@")[0] ?? "Player";
    const comments = entry.value.comments ?? [];
    const comment = {
      id: crypto.randomUUID(),
      user: username,
      avatar: username.slice(0, 2).toUpperCase(),
      timestamp: new Date().toISOString(),
      content: trimmedContent,
    };
    const updatedPost = {
      ...entry.value,
      comments: [...comments, comment],
      replies: comments.length + 1,
      likes: Number(entry.value.likes ?? 0),
    };

    await kv.set(entry.key, updatedPost);
    return c.json(updatedPost, 201);
  } catch (error) {
    console.log(`Comment on community post exception: ${error}`);
    return c.json({ error: "Failed to comment on post" }, 500);
  }
});

// Example protected endpoint - requires authentication
app.get("/make-server-9f7f41c6/profile", async (c) => {
  try {
    const { user, error } = await getAuthorizedUser(c);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const key = `user-profile:${user.id}`;
    const profile = await kv.get(key);
    if (profile) {
      return c.json(profile);
    }

    const newProfile = createProfile(user);
    await kv.set(key, newProfile);
    return c.json(newProfile);
  } catch (error) {
    console.log(`Get profile exception: ${error}`);
    return c.json({ error: "Failed to get profile" }, 500);
  }
});

app.put("/make-server-9f7f41c6/profile", async (c) => {
  try {
    const { user, error } = await getAuthorizedUser(c);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await c.req.json();
    const storedProfile = {
      ...profile,
      id: user.id,
      email: user.email ?? profile.email,
      lastLogin: new Date().toISOString(),
    };

    await kv.set(`user-profile:${user.id}`, storedProfile);
    return c.json(storedProfile);
  } catch (error) {
    console.log(`Update profile exception: ${error}`);
    return c.json({ error: "Failed to update profile" }, 500);
  }
});

app.post("/make-server-9f7f41c6/profile/play", async (c) => {
  try {
    const { user, error } = await getAuthorizedUser(c);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { gameId, gameName } = await c.req.json();
    const numericGameId = Number(gameId);
    const trimmedGameName = typeof gameName === "string" ? gameName.trim() : "";

    if (!Number.isFinite(numericGameId) || !trimmedGameName) {
      return c.json({ error: "Game id and name are required" }, 400);
    }

    const key = `user-profile:${user.id}`;
    const profile = await kv.get(key) ?? createProfile(user);
    const updatedProfile = recordGamePlay(profile, numericGameId, trimmedGameName);

    await kv.set(key, updatedProfile);
    return c.json(updatedProfile);
  } catch (error) {
    console.log(`Record game play exception: ${error}`);
    return c.json({ error: "Failed to record game play" }, 500);
  }
});

app.get("/make-server-9f7f41c6/friends", async (c) => {
  try {
    const { user, error } = await getAuthorizedUser(c);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`user-profile:${user.id}`);
    const friendIds = profile?.friends ?? [];
    const friendProfiles = await Promise.all(friendIds.map((friendId) => kv.get(`user-profile:${friendId}`)));
    const friends = await Promise.all(friendProfiles.filter(Boolean).map(async (friendProfile) => {
      const messages = await kv.get(conversationKey(user.id, friendProfile.id)) ?? [];
      const lastReadAt = await kv.get(readReceiptKey(user.id, friendProfile.id));
      const lastReadTime = lastReadAt ? new Date(lastReadAt).getTime() : 0;
      const hasUnreadMessages = messages.some((message) =>
        message.senderId === friendProfile.id &&
        new Date(message.timestamp).getTime() > lastReadTime
      );

      return {
        ...profileToFriend(friendProfile),
        hasUnreadMessages,
      };
    }));
    return c.json(friends);
  } catch (error) {
    console.log(`Get friends exception: ${error}`);
    return c.json({ error: "Failed to get friends" }, 500);
  }
});

app.post("/make-server-9f7f41c6/friends", async (c) => {
  try {
    const { user, error } = await getAuthorizedUser(c);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { username } = await c.req.json();
    const requestedUsername = typeof username === "string" ? username.trim().toLowerCase() : "";
    if (!requestedUsername) {
      return c.json({ error: "Username is required" }, 400);
    }

    const currentProfile = await kv.get(`user-profile:${user.id}`);
    if (!currentProfile) {
      return c.json({ error: "Your profile was not found" }, 404);
    }

    if (currentProfile.username?.toLowerCase() === requestedUsername) {
      return c.json({ error: "You cannot add yourself as a friend" }, 400);
    }

    const profiles = await kv.getByPrefix("user-profile:");
    const friendProfile = profiles.find((profile) => profile.username?.toLowerCase() === requestedUsername);
    if (!friendProfile) {
      return c.json({ error: "No user found with that username" }, 404);
    }

    if ((currentProfile.friends ?? []).includes(friendProfile.id)) {
      return c.json({ error: "You are already friends" }, 409);
    }

    const updatedCurrentProfile = {
      ...currentProfile,
      friends: [...(currentProfile.friends ?? []), friendProfile.id],
    };
    const updatedFriendProfile = {
      ...friendProfile,
      friends: [...new Set([...(friendProfile.friends ?? []), currentProfile.id])],
    };

    await kv.set(`user-profile:${currentProfile.id}`, updatedCurrentProfile);
    await kv.set(`user-profile:${friendProfile.id}`, updatedFriendProfile);

    const currentActivity = userActivity(currentProfile, `became friends with ${friendProfile.username}`);
    const friendActivity = userActivity(friendProfile, `became friends with ${currentProfile.username}`);
    await kv.set(`activity:${currentProfile.id}:${currentActivity.timestamp}:${currentActivity.id}`, currentActivity);
    await kv.set(`activity:${friendProfile.id}:${friendActivity.timestamp}:${friendActivity.id}`, friendActivity);

    return c.json({
      friend: profileToFriend(friendProfile),
      activity: currentActivity,
    }, 201);
  } catch (error) {
    console.log(`Add friend exception: ${error}`);
    return c.json({ error: "Failed to add friend" }, 500);
  }
});

app.get("/make-server-9f7f41c6/activity-feed", async (c) => {
  try {
    const { user, error } = await getAuthorizedUser(c);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }
    const activity = await contentList(`activity:${user.id}:`);
    return c.json(activity.sort((a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()));
  } catch (error) {
    console.log(`Get activity feed exception: ${error}`);
    return c.json({ error: "Failed to get activity feed" }, 500);
  }
});

app.get("/make-server-9f7f41c6/friends/:id/messages", async (c) => {
  try {
    const { user, error } = await getAuthorizedUser(c);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const friendId = c.req.param("id");
    const profile = await kv.get(`user-profile:${user.id}`);
    if (!(profile?.friends ?? []).includes(friendId)) {
      return c.json({ error: "You can only chat with friends" }, 403);
    }

    const messages = await kv.get(conversationKey(user.id, friendId));
    await kv.set(readReceiptKey(user.id, friendId), new Date().toISOString());
    return c.json(messages ?? []);
  } catch (error) {
    console.log(`Get friend messages exception: ${error}`);
    return c.json({ error: "Failed to load messages" }, 500);
  }
});

app.post("/make-server-9f7f41c6/friends/:id/messages", async (c) => {
  try {
    const { user, error } = await getAuthorizedUser(c);
    if (error || !user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const friendId = c.req.param("id");
    const profile = await kv.get(`user-profile:${user.id}`);
    if (!(profile?.friends ?? []).includes(friendId)) {
      return c.json({ error: "You can only chat with friends" }, 403);
    }

    const { content } = await c.req.json();
    const trimmedContent = typeof content === "string" ? content.trim() : "";
    if (!trimmedContent) {
      return c.json({ error: "Message is required" }, 400);
    }

    const key = conversationKey(user.id, friendId);
    const messages = await kv.get(key) ?? [];
    const message = {
      id: crypto.randomUUID(),
      senderId: user.id,
      senderUsername: profile.username,
      content: trimmedContent,
      timestamp: new Date().toISOString(),
    };
    const updatedMessages = [...messages, message];

    await kv.set(key, updatedMessages);
    return c.json(message, 201);
  } catch (error) {
    console.log(`Send friend message exception: ${error}`);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

Deno.serve(app.fetch);
