"use client";

import { useEffect, useState } from "react";
import { api, TwitterList, Tweet } from "@/lib/api";
import TweetCard from "@/components/TweetCard";

export default function ListsPage() {
  const [lists, setLists] = useState<TwitterList[]>([]);
  const [selected, setSelected] = useState<TwitterList | null>(null);
  const [timeline, setTimeline] = useState<Tweet[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .lists()
      .then((l) => setLists(Array.isArray(l) ? l : []))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoadingLists(false));
  }, []);

  const viewList = async (list: TwitterList) => {
    setSelected(list);
    setLoadingTimeline(true);
    try {
      const data = await api.listTimeline(list.id);
      setTimeline(Array.isArray(data) ? data : []);
    } catch {
      setTimeline([]);
    } finally {
      setLoadingTimeline(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">📋 Lists</h1>

      <div className="flex gap-6">
        {/* Lists sidebar */}
        <div className="w-72 flex-shrink-0">
          {loadingLists ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 animate-pulse h-16" />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-400 text-sm">⚠️ {error}</p>
          ) : lists.length === 0 ? (
            <p className="text-[#9ca3af]">No lists found</p>
          ) : (
            <div className="space-y-2">
              {lists.map((list) => (
                <button
                  key={list.id}
                  onClick={() => viewList(list)}
                  className={`w-full text-left bg-[#111827] border rounded-xl p-4 transition-colors ${
                    selected?.id === list.id
                      ? "border-[#1d9bf0]"
                      : "border-[#1f2937] hover:border-[#374151]"
                  }`}
                >
                  <p className="font-medium text-white text-sm">{list.name}</p>
                  {list.description && (
                    <p className="text-xs text-[#9ca3af] mt-0.5 truncate">{list.description}</p>
                  )}
                  {list.member_count !== undefined && (
                    <p className="text-xs text-[#9ca3af] mt-0.5">{list.member_count} members</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="flex-1 min-w-0">
          {!selected ? (
            <div className="text-center py-12 text-[#9ca3af]">
              <p className="text-4xl mb-3">📋</p>
              <p>Select a list to view its timeline</p>
            </div>
          ) : loadingTimeline ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 animate-pulse h-24" />
              ))}
            </div>
          ) : timeline.length === 0 ? (
            <p className="text-[#9ca3af]">No tweets in this list</p>
          ) : (
            <div className="space-y-3">
              {timeline.map((tweet) => (
                <TweetCard key={tweet.id} tweet={tweet} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
