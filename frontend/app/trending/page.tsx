"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, TrendingTopic } from "@/lib/api";

export default function TrendingPage() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    api
      .trending()
      .then((t) => setTopics(Array.isArray(t) ? t : []))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        🔥 Trending
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-[#111827] border border-red-900/50 rounded-xl p-6 text-center">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
        </div>
      ) : topics.length === 0 ? (
        <p className="text-[#9ca3af]">No trending topics available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topics.map((topic, i) => (
            <button
              key={i}
              onClick={() => router.push(`/search?q=${encodeURIComponent(topic.name)}`)}
              className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 text-left hover:border-[#1d9bf0] transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {topic.category && (
                    <p className="text-xs text-[#9ca3af] mb-1">{topic.category}</p>
                  )}
                  <p className="font-semibold text-white group-hover:text-[#1d9bf0] transition-colors truncate">
                    {topic.name}
                  </p>
                  {topic.tweet_count && (
                    <p className="text-xs text-[#9ca3af] mt-1">{topic.tweet_count} posts</p>
                  )}
                </div>
                <span className="text-[#9ca3af] text-lg ml-2 group-hover:text-[#1d9bf0]">→</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
