"use client";

import { useEffect, useState } from "react";
import { api, Tweet } from "@/lib/api";
import TweetCard from "@/components/TweetCard";

export default function BookmarksPage() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .bookmarks()
      .then((t) => setTweets(Array.isArray(t) ? t : []))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">🔖 Bookmarks</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 animate-pulse h-24" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-[#111827] border border-red-900/50 rounded-xl p-6 text-center">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
        </div>
      ) : tweets.length === 0 ? (
        <div className="text-center py-12 text-[#9ca3af]">
          <p className="text-4xl mb-3">🔖</p>
          <p>No bookmarks yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tweets.map((tweet) => (
            <TweetCard key={tweet.id} tweet={tweet} />
          ))}
        </div>
      )}
    </div>
  );
}
