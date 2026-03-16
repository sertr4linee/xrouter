"use client";

import { useEffect, useState } from "react";
import { api, ScheduledTweet } from "@/lib/api";

export default function ScheduledPage() {
  const [tweets, setTweets] = useState<ScheduledTweet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    api
      .scheduled()
      .then((s) => setTweets(Array.isArray(s) ? s : []))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this scheduled tweet?")) return;
    try {
      await api.unschedule(id);
      setTweets((prev) => prev.filter((t) => t.id !== id));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to cancel");
    }
  };

  const sorted = [...tweets].sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  );

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">📅 Scheduled</h1>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : error ? (
        <div className="bg-[#111827] border border-red-900/50 rounded-xl p-6 text-center">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12 text-[#9ca3af]">
          <p className="text-4xl mb-3">📅</p>
          <p>No scheduled tweets</p>
          <a href="/compose" className="mt-3 inline-block text-sm text-[#1d9bf0] hover:underline">
            Schedule one →
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((t) => {
            const d = new Date(t.scheduled_at);
            return (
              <div
                key={t.id}
                className="bg-[#111827] border border-[#1f2937] rounded-xl p-5 flex gap-4"
              >
                {/* Date column */}
                <div className="w-16 flex-shrink-0 text-center">
                  <p className="text-xs text-[#9ca3af]">{d.toLocaleDateString("en-US", { month: "short" })}</p>
                  <p className="text-2xl font-bold text-white">{d.getDate()}</p>
                  <p className="text-xs text-[#9ca3af]">{d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white leading-relaxed">{t.text}</p>
                </div>

                <button
                  onClick={() => handleCancel(t.id)}
                  className="flex-shrink-0 self-start px-3 py-1 text-xs border border-red-900/50 text-red-400 rounded-lg hover:bg-red-900/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
