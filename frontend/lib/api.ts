export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Engagement {
  likes: number;
  retweets: number;
  replies: number;
  quotes: number;
  bookmarks: number;
  views: number;
}

export interface Media {
  type: "photo" | "video" | "gif";
  url: string;
  preview_url?: string;
}

export interface Tweet {
  id: string;
  text: string;
  author_id: string;
  author_name: string;
  author_handle: string;
  author_verified: boolean;
  created_at: string;
  engagement: Engagement;
  media: Media[];
  quoted_tweet?: Tweet;
  reply_to_id?: string;
  reply_to_handle?: string;
  is_retweet: boolean;
  retweeted_by?: string;
  tweet_url: string;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  bio?: string;
  location?: string;
  website?: string;
  verified: boolean;
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
  created_at: string;
  profile_image_url?: string;
  profile_banner_url?: string;
}

export interface TrendingTopic {
  name: string;
  tweet_count?: string;
  category?: string;
  url?: string;
}

export interface DMConversation {
  id: string;
  participant: string;
  last_message?: string;
  last_message_time?: string;
  unread?: boolean;
}

export interface TwitterList {
  id: string;
  name: string;
  description?: string;
  member_count?: number;
  subscriber_count?: number;
  owner?: string;
  is_private?: boolean;
}

export interface ScheduledTweet {
  id: string;
  text: string;
  scheduled_at: string;
}

export interface AuthStatus {
  authenticated: boolean;
  handle?: string;
  name?: string;
  error?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json();
}

// ── API calls ─────────────────────────────────────────────────────────────────

export const api = {
  feed: (type = "for-you", count = 20) =>
    apiFetch<Tweet[]>(`/api/feed?type=${encodeURIComponent(type)}&count=${count}`),

  trending: () => apiFetch<TrendingTopic[]>("/api/trending"),

  search: (q: string, type = "top") =>
    apiFetch<Tweet[]>(`/api/search?q=${encodeURIComponent(q)}&type=${encodeURIComponent(type)}`),

  tweet: (id: string) => apiFetch<Tweet>(`/api/tweet/${id}`),

  user: (handle: string) => apiFetch<User>(`/api/user/${handle}`),

  bookmarks: () => apiFetch<Tweet[]>("/api/bookmarks"),

  scheduled: () => apiFetch<ScheduledTweet[]>("/api/scheduled"),

  lists: () => apiFetch<TwitterList[]>("/api/lists"),

  listTimeline: (id: string) => apiFetch<Tweet[]>(`/api/lists/${id}/timeline`),

  dmInbox: () => apiFetch<DMConversation[]>("/api/dm/inbox"),

  authStatus: () => apiFetch<AuthStatus>("/api/auth/status"),

  postTweet: (text: string, reply_to?: string, image_path?: string) =>
    apiFetch<Tweet>("/api/tweet", {
      method: "POST",
      body: JSON.stringify({ text, reply_to, image_path }),
    }),

  deleteTweet: (id: string) =>
    apiFetch<unknown>(`/api/tweet/${id}`, { method: "DELETE" }),

  likeTweet: (id: string) =>
    apiFetch<unknown>(`/api/tweet/${id}/like`, { method: "POST" }),

  unlikeTweet: (id: string) =>
    apiFetch<unknown>(`/api/tweet/${id}/like`, { method: "DELETE" }),

  retweet: (id: string) =>
    apiFetch<unknown>(`/api/tweet/${id}/retweet`, { method: "POST" }),

  scheduleTweet: (text: string, at: string) =>
    apiFetch<ScheduledTweet>("/api/schedule", {
      method: "POST",
      body: JSON.stringify({ text, at }),
    }),

  unschedule: (id: string) =>
    apiFetch<unknown>(`/api/schedule/${id}`, { method: "DELETE" }),

  sendDM: (handle: string, text: string) =>
    apiFetch<unknown>("/api/dm/send", {
      method: "POST",
      body: JSON.stringify({ handle, text }),
    }),

  followUser: (handle: string) =>
    apiFetch<unknown>(`/api/user/${handle}/follow`, { method: "POST" }),

  unfollowUser: (handle: string) =>
    apiFetch<unknown>(`/api/user/${handle}/follow`, { method: "DELETE" }),
};
