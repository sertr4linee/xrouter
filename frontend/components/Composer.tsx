"use client";

import { useState } from "react";
import { api } from "@/lib/api";

interface ComposerProps {
  onPosted?: () => void;
}

export default function Composer({ onPosted }: ComposerProps) {
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [scheduled, setScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const MAX = 280;
  const remaining = MAX - text.length;
  const overLimit = remaining < 0;

  const handleSubmit = async () => {
    if (!text.trim() || overLimit) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (scheduled && scheduledAt) {
        await api.scheduleTweet(text, scheduledAt);
        setSuccess("Tweet scheduled!");
      } else {
        await api.postTweet(text, replyTo || undefined);
        setSuccess("Tweet posted!");
      }
      setText("");
      setReplyTo("");
      setScheduledAt("");
      setScheduled(false);
      onPosted?.();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="What's happening?"
        rows={4}
        className="w-full bg-transparent text-white placeholder-[#9ca3af] resize-none focus:outline-none text-sm leading-relaxed"
      />

      <div className="h-px bg-[#1f2937] my-3" />

      {/* Reply-to */}
      <div className="mb-3">
        <input
          type="text"
          value={replyTo}
          onChange={(e) => setReplyTo(e.target.value)}
          placeholder="Reply to tweet ID (optional)"
          className="w-full bg-[#0a0f1e] border border-[#1f2937] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1d9bf0]"
        />
      </div>

      {/* Schedule toggle */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => setScheduled(!scheduled)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            scheduled
              ? "border-[#1d9bf0] text-[#1d9bf0] bg-[#1d9bf0]/10"
              : "border-[#1f2937] text-[#9ca3af] hover:border-[#374151]"
          }`}
        >
          📅 Schedule
        </button>
        {scheduled && (
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="flex-1 bg-[#0a0f1e] border border-[#1f2937] rounded-lg px-3 py-1 text-xs text-white focus:outline-none focus:border-[#1d9bf0]"
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span
          className={`text-sm font-mono ${
            overLimit
              ? "text-red-400"
              : remaining <= 20
              ? "text-yellow-400"
              : "text-[#9ca3af]"
          }`}
        >
          {remaining}
        </span>

        <button
          onClick={handleSubmit}
          disabled={loading || !text.trim() || overLimit}
          className="px-5 py-1.5 bg-[#1d9bf0] text-white text-sm font-semibold rounded-full hover:bg-[#1a8cd8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "…" : scheduled ? "Schedule" : "Post Now"}
        </button>
      </div>

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
      {success && <p className="mt-2 text-xs text-green-400">{success}</p>}
    </div>
  );
}
