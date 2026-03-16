"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, TrendingTopic } from "@/lib/api";

export default function TrendingWidget() {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api
      .trending()
      .then((t) => setTopics(Array.isArray(t) ? t.slice(0, 5) : []))
      .catch(() => setTopics([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        🔥 Trending
      </h3>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-[#1f2937] rounded animate-pulse" />
          ))}
        </div>
      ) : topics.length === 0 ? (
        <p className="text-xs text-[#9ca3af]">No trends available</p>
      ) : (
        <ul className="space-y-2">
          {topics.map((t, i) => (
            <li key={i}>
              <button
                onClick={() => router.push(`/search?q=${encodeURIComponent(t.name)}`)}
                className="w-full text-left group"
              >
                <p className="text-sm text-white group-hover:text-[#1d9bf0] transition-colors truncate">
                  {t.name}
                </p>
                {t.tweet_count && (
                  <p className="text-xs text-[#9ca3af]">{t.tweet_count}</p>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => router.push("/trending")}
        className="mt-3 text-xs text-[#1d9bf0] hover:underline"
      >
        Show more →
      </button>
    </div>
  );
}
