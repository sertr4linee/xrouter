"use client";

import { useState } from "react";
import Image from "next/image";
import { api, User } from "@/lib/api";
import { formatCount } from "@/lib/utils";

export default function ProfilePage() {
  const [handle, setHandle] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [followStatus, setFollowStatus] = useState("");

  const lookup = async (h: string) => {
    if (!h.trim()) return;
    setLoading(true);
    setError("");
    setUser(null);
    try {
      const data = await api.user(h.replace(/^@/, ""));
      setUser(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "User not found");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!user) return;
    try {
      await api.followUser(user.handle);
      setFollowStatus("Following!");
    } catch (e: unknown) {
      setFollowStatus(e instanceof Error ? e.message : "Failed");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">👤 Profile</h1>

      {/* Search */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && lookup(handle)}
          placeholder="@username"
          className="flex-1 bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-3 text-white placeholder-[#9ca3af] focus:outline-none focus:border-[#1d9bf0]"
        />
        <button
          onClick={() => lookup(handle)}
          className="px-5 py-3 bg-[#1d9bf0] text-white font-semibold rounded-xl hover:bg-[#1a8cd8] transition-colors"
        >
          Look up
        </button>
      </div>

      {loading && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl animate-pulse h-48" />
      )}

      {error && (
        <div className="bg-[#111827] border border-red-900/50 rounded-xl p-6 text-center">
          <p className="text-red-400 text-sm">⚠️ {error}</p>
        </div>
      )}

      {user && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-[#1d9bf0]/30 to-[#0d1526] relative">
            {user.profile_banner_url && (
              <Image
                src={user.profile_banner_url}
                alt="banner"
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </div>

          <div className="p-5">
            <div className="flex items-end justify-between -mt-12 mb-3">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full border-4 border-[#111827] bg-[#1f2937] overflow-hidden">
                {user.profile_image_url ? (
                  <Image
                    src={user.profile_image_url}
                    alt={user.name}
                    width={80}
                    height={80}
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white">
                    {user.name?.[0] ?? "?"}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleFollow}
                  className="px-4 py-1.5 bg-[#1d9bf0] text-white text-sm font-semibold rounded-full hover:bg-[#1a8cd8] transition-colors"
                >
                  Follow
                </button>
                {followStatus && (
                  <span className="text-xs text-green-400 self-center">{followStatus}</span>
                )}
              </div>
            </div>

            <h2 className="text-lg font-bold text-white flex items-center gap-1">
              {user.name}
              {user.verified && <span className="text-[#1d9bf0] text-sm" title="Verified">✓</span>}
            </h2>
            <p className="text-sm text-[#9ca3af]">@{user.handle}</p>

            {user.bio && (
              <p className="mt-3 text-sm text-[#e5e7eb] leading-relaxed">{user.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 mt-3 text-xs text-[#9ca3af]">
              {user.location && <span>📍 {user.location}</span>}
              {user.website && (
                <a href={user.website} target="_blank" rel="noopener" className="text-[#1d9bf0] hover:underline">
                  🔗 {user.website}
                </a>
              )}
              {user.created_at && (
                <span>
                  📅 Joined {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-4 pt-4 border-t border-[#1f2937]">
              <div>
                <p className="text-sm font-bold text-white">{formatCount(user.following_count)}</p>
                <p className="text-xs text-[#9ca3af]">Following</p>
              </div>
              <div>
                <p className="text-sm font-bold text-white">{formatCount(user.followers_count)}</p>
                <p className="text-xs text-[#9ca3af]">Followers</p>
              </div>
              <div>
                <p className="text-sm font-bold text-white">{formatCount(user.tweet_count)}</p>
                <p className="text-xs text-[#9ca3af]">Tweets</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
