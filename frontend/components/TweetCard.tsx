"use client";

import Image from "next/image";
import { useState } from "react";
import { Tweet } from "@/lib/api";
import { timeAgo, formatCount, getInitials, linkifyText } from "@/lib/utils";
import { api } from "@/lib/api";

interface TweetCardProps {
  tweet: Tweet;
  onDelete?: (id: string) => void;
}

export default function TweetCard({ tweet, onDelete }: TweetCardProps) {
  const [liked, setLiked] = useState(false);
  const [retweeted, setRetweeted] = useState(false);
  const [likeCount, setLikeCount] = useState(tweet.engagement?.likes ?? 0);

  const handleLike = async () => {
    try {
      if (liked) {
        await api.unlikeTweet(tweet.id);
        setLikeCount((c) => Math.max(0, c - 1));
      } else {
        await api.likeTweet(tweet.id);
        setLikeCount((c) => c + 1);
      }
      setLiked(!liked);
    } catch {}
  };

  const handleRetweet = async () => {
    try {
      if (!retweeted) await api.retweet(tweet.id);
      setRetweeted(!retweeted);
    } catch {}
  };

  const handleDelete = async () => {
    if (!confirm("Delete this tweet?")) return;
    try {
      await api.deleteTweet(tweet.id);
      onDelete?.(tweet.id);
    } catch {}
  };

  const avatarUrl = tweet.author_id
    ? `https://unavatar.io/twitter/${tweet.author_handle}`
    : null;

  return (
    <article className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 hover:border-[#374151] transition-colors">
      {tweet.is_retweet && tweet.retweeted_by && (
        <p className="text-xs text-[#9ca3af] mb-2 flex items-center gap-1">
          <span>🔁</span> {tweet.retweeted_by} retweeted
        </p>
      )}

      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1f2937] flex items-center justify-center text-sm font-bold text-[#9ca3af]">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={tweet.author_name}
                width={40}
                height={40}
                className="object-cover"
                unoptimized
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              getInitials(tweet.author_name || "U")
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-semibold text-white text-sm truncate">
              {tweet.author_name}
            </span>
            {tweet.author_verified && (
              <span className="text-[#1d9bf0] text-sm" title="Verified">✓</span>
            )}
            <span className="text-[#9ca3af] text-sm truncate">
              @{tweet.author_handle}
            </span>
            <span className="text-[#9ca3af] text-xs">·</span>
            <span className="text-[#9ca3af] text-xs flex-shrink-0">
              {timeAgo(tweet.created_at)}
            </span>
          </div>

          {/* Reply indicator */}
          {tweet.reply_to_handle && (
            <p className="text-xs text-[#9ca3af] mt-0.5">
              Replying to <span className="text-[#1d9bf0]">@{tweet.reply_to_handle}</span>
            </p>
          )}

          {/* Text */}
          <p
            className="mt-2 text-sm text-[#e5e7eb] leading-relaxed whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: linkifyText(tweet.text || "") }}
          />

          {/* Media */}
          {tweet.media && tweet.media.length > 0 && (
            <div className={`mt-3 grid gap-2 ${tweet.media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {tweet.media.slice(0, 4).map((m, i) => (
                <div key={i} className="rounded-lg overflow-hidden bg-[#1f2937] aspect-video">
                  {m.type === "photo" && (
                    <Image
                      src={m.url || m.preview_url || ""}
                      alt="media"
                      width={500}
                      height={280}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  )}
                  {(m.type === "video" || m.type === "gif") && (
                    <div className="w-full h-full flex items-center justify-center text-[#9ca3af]">
                      🎬 {m.type === "gif" ? "GIF" : "Video"}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quoted tweet */}
          {tweet.quoted_tweet && (
            <div className="mt-3 border border-[#1f2937] rounded-lg p-3 bg-[#0d1526]">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-sm font-semibold text-white">
                  {tweet.quoted_tweet.author_name}
                </span>
                <span className="text-xs text-[#9ca3af]">
                  @{tweet.quoted_tweet.author_handle}
                </span>
              </div>
              <p className="text-xs text-[#e5e7eb]">{tweet.quoted_tweet.text}</p>
            </div>
          )}

          {/* Engagement */}
          <div className="flex items-center gap-5 mt-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                liked ? "text-pink-500" : "text-[#9ca3af] hover:text-pink-400"
              }`}
            >
              <span>{liked ? "❤️" : "🤍"}</span>
              <span>{formatCount(likeCount)}</span>
            </button>

            <button
              onClick={handleRetweet}
              className={`flex items-center gap-1.5 text-xs transition-colors ${
                retweeted ? "text-green-400" : "text-[#9ca3af] hover:text-green-400"
              }`}
            >
              <span>🔁</span>
              <span>{formatCount(tweet.engagement?.retweets ?? 0)}</span>
            </button>

            <span className="flex items-center gap-1.5 text-xs text-[#9ca3af]">
              <span>💬</span>
              <span>{formatCount(tweet.engagement?.replies ?? 0)}</span>
            </span>

            {(tweet.engagement?.views ?? 0) > 0 && (
              <span className="flex items-center gap-1.5 text-xs text-[#9ca3af]">
                <span>👁️</span>
                <span>{formatCount(tweet.engagement?.views ?? 0)}</span>
              </span>
            )}

            <a
              href={tweet.tweet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-xs text-[#9ca3af] hover:text-[#1d9bf0] transition-colors"
              title="Open on X"
            >
              ↗
            </a>

            {onDelete && (
              <button
                onClick={handleDelete}
                className="text-xs text-[#9ca3af] hover:text-red-400 transition-colors"
                title="Delete"
              >
                🗑
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
