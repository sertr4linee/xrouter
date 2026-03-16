"use client";

import { useState, useEffect } from "react";
import { api, Tweet } from "@/lib/api";
import TweetCard from "@/components/TweetCard";
import TrendingWidget from "@/components/TrendingWidget";
import Composer from "@/components/Composer";

export default function FeedPage() {
  const [tab, setTab] = useState<"for-you" | "following">("for-you");
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFeed = async (feedType: "for-you" | "following") => {
    setLoading(true);
    setError("");
    try {
      const data = await api.feed(feedType, 20);
      setTweets(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed(tab);
  }, [tab]);

  const handleDelete = (id: string) => {
    setTweets((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="flex gap-6 max-w-5xl mx-auto p-6">
      {/* Main feed */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <Composer onPosted={() => loadFeed(tab)} />
        </div>

        <div className="flex border-b border-[#1f2937] mb-4">
          {(["for-you", "following"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-3 text-sm font-medium capitalize transition-colors border-b-2 ${
                tab === t
                  ? "border-[#1d9bf0] text-[#1d9bf0]"
                  : "border-transparent text-[#9ca3af] hover:text-white"
              }`}
            >
              {t === "for-you" ? "For You" : "Following"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1f2937]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-[#1f2937] rounded w-1/3" />
                    <div className="h-3 bg-[#1f2937] rounded w-full" />
                    <div className="h-3 bg-[#1f2937] rounded w-4/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-[#111827] border border-red-900/50 rounded-xl p-6 text-center">
            <p className="text-red-400 text-sm mb-2">⚠️ {error}</p>
            <p className="text-xs text-[#9ca3af]">
              Start the backend: <code className="text-[#1d9bf0]">cd backend && uvicorn main:app --reload</code>
            </p>
            <button
              onClick={() => loadFeed(tab)}
              className="mt-3 px-4 py-1.5 bg-[#1d9bf0] text-white text-sm rounded-full hover:bg-[#1a8cd8]"
            >
              Retry
            </button>
          </div>
        ) : tweets.length === 0 ? (
          <div className="text-center py-12 text-[#9ca3af]">
            <p className="text-4xl mb-3">🐦</p>
            <p>No tweets in your feed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tweets.map((tweet) => (
              <TweetCard key={tweet.id} tweet={tweet} onDelete={handleDelete} />
            ))}
            <button
              onClick={() => loadFeed(tab)}
              className="w-full py-3 text-sm text-[#1d9bf0] hover:bg-[#111827] rounded-xl transition-colors"
            >
              Load more
            </button>
          </div>
        )}
      </div>

      <div className="w-72 flex-shrink-0 hidden lg:block">
        <TrendingWidget />
      </div>
    </div>
  );
}
