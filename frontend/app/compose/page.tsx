"use client";

import { useEffect, useState } from "react";
import { api, ScheduledTweet } from "@/lib/api";
import Composer from "@/components/Composer";

export default function ComposePage() {
  const [scheduled, setScheduled] = useState<ScheduledTweet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadScheduled = () => {
    api
      .scheduled()
      .then((s) => setScheduled(Array.isArray(s) ? s : []))
      .catch(() => setScheduled([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadScheduled();
  }, []);

  const handleCancel = async (id: string) => {
    try {
      await api.unschedule(id);
      setScheduled((prev) => prev.filter((s) => s.id !== id));
    } catch {}
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">✍️ Compose</h1>

      <Composer onPosted={loadScheduled} />

      {/* Scheduled tweets */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          📅 Scheduled Tweets
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 animate-pulse h-16" />
            ))}
          </div>
        ) : scheduled.length === 0 ? (
          <p className="text-[#9ca3af] text-sm">No scheduled tweets</p>
        ) : (
          <div className="space-y-3">
            {scheduled.map((s) => (
              <div
                key={s.id}
                className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 flex items-start gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{s.text}</p>
                  <p className="text-xs text-[#9ca3af] mt-1">
                    📅 {new Date(s.scheduled_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleCancel(s.id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors flex-shrink-0"
                >
                  Cancel
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
