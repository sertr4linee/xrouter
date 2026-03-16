"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, Tweet } from "@/lib/api";
import TweetCard from "@/components/TweetCard";

const TYPES = ["top", "latest", "photos", "videos"] as const;
type SearchType = typeof TYPES[number];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [type, setType] = useState<SearchType>("top");
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const doSearch = async (q: string, t: SearchType) => {
    if (!q.trim()) return;
    setLoading(true);
    setError("");
    try {
      const data = await api.search(q, t);
      setTweets(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      doSearch(q, type);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSearch = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
    doSearch(query, type);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">🔍 Search</h1>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Search tweets…"
          className="flex-1 bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-3 text-white placeholder-[#9ca3af] focus:outline-none focus:border-[#1d9bf0]"
        />
        <button
          onClick={handleSearch}
          className="px-5 py-3 bg-[#1d9bf0] text-white font-semibold rounded-xl hover:bg-[#1a8cd8] transition-colors"
        >
          Search
        </button>
      </div>

      {/* Type selector */}
      <div className="flex gap-2 mb-6">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => {
              setType(t);
              if (query) doSearch(query, t);
            }}
            className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
              type === t
                ? "bg-[#1d9bf0] text-white"
                : "bg-[#111827] border border-[#1f2937] text-[#9ca3af] hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Results */}
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
      ) : tweets.length === 0 && query ? (
        <p className="text-center text-[#9ca3af] py-12">No results for "{query}"</p>
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto p-6 text-[#9ca3af]">Loading…</div>}>
      <SearchContent />
    </Suspense>
  );
}
