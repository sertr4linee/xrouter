"use client";

import { useEffect, useState } from "react";
import { api, DMConversation } from "@/lib/api";

export default function DMPage() {
  const [conversations, setConversations] = useState<DMConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<DMConversation | null>(null);
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState("");

  useEffect(() => {
    api
      .dmInbox()
      .then((c) => setConversations(Array.isArray(c) ? c : []))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed"))
      .finally(() => setLoading(false));
  }, []);

  const handleSend = async () => {
    const handle = selected?.participant || recipient;
    if (!handle || !message.trim()) return;
    setSending(true);
    setSendStatus("");
    try {
      await api.sendDM(handle, message);
      setSendStatus("✓ Sent!");
      setMessage("");
    } catch (e: unknown) {
      setSendStatus(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">💬 Direct Messages</h1>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Conversation list */}
        <div className="w-72 flex-shrink-0 overflow-y-auto">
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 animate-pulse h-16" />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-400 text-sm">⚠️ {error}</p>
          ) : conversations.length === 0 ? (
            <p className="text-[#9ca3af] text-sm">No conversations</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={`w-full text-left bg-[#111827] border rounded-xl p-3 transition-colors ${
                    selected?.id === conv.id
                      ? "border-[#1d9bf0]"
                      : "border-[#1f2937] hover:border-[#374151]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#1f2937] flex items-center justify-center text-xs font-bold text-white">
                      {conv.participant?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">@{conv.participant}</p>
                      {conv.last_message && (
                        <p className="text-xs text-[#9ca3af] truncate">{conv.last_message}</p>
                      )}
                    </div>
                    {conv.unread && (
                      <div className="w-2 h-2 rounded-full bg-[#1d9bf0] flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Message panel */}
        <div className="flex-1 bg-[#111827] border border-[#1f2937] rounded-xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#1f2937]">
            {selected ? (
              <p className="font-medium text-white">@{selected.participant}</p>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#9ca3af]">To:</span>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="@handle"
                  className="flex-1 bg-transparent text-white placeholder-[#9ca3af] focus:outline-none text-sm"
                />
              </div>
            )}
          </div>

          {/* Placeholder for thread */}
          <div className="flex-1 flex items-center justify-center text-[#9ca3af]">
            <div className="text-center">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-sm">
                {selected ? `Conversation with @${selected.participant}` : "Select a conversation or start a new one"}
              </p>
            </div>
          </div>

          {/* Send form */}
          <div className="p-4 border-t border-[#1f2937] flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Write a message…"
              className="flex-1 bg-[#0a0f1e] border border-[#1f2937] rounded-xl px-4 py-2 text-sm text-white placeholder-[#9ca3af] focus:outline-none focus:border-[#1d9bf0]"
            />
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="px-4 py-2 bg-[#1d9bf0] text-white text-sm rounded-xl hover:bg-[#1a8cd8] disabled:opacity-40 transition-colors"
            >
              {sending ? "…" : "Send"}
            </button>
          </div>
          {sendStatus && (
            <p className={`px-4 pb-3 text-xs ${sendStatus.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>
              {sendStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
