"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const NAV = [
  { href: "/", label: "Feed", icon: "🏠" },
  { href: "/trending", label: "Trending", icon: "🔥" },
  { href: "/search", label: "Search", icon: "🔍" },
  { href: "/compose", label: "Compose", icon: "✍️" },
  { href: "/scheduled", label: "Scheduled", icon: "📅" },
  { href: "/bookmarks", label: "Bookmarks", icon: "🔖" },
  { href: "/lists", label: "Lists", icon: "📋" },
  { href: "/dm", label: "DMs", icon: "💬" },
  { href: "/profile", label: "Profile", icon: "👤" },
  { href: "/auth", label: "Auth Status", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    api
      .authStatus()
      .then((s) => setAuthed(s.authenticated))
      .catch(() => setAuthed(false));
  }, []);

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-[#0d1526] border-r border-[#1f2937] flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-[#1f2937]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-bold text-white tracking-tight">xrouter</span>
        </div>
        <p className="text-xs text-[#9ca3af] mt-1">powered by clix</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {NAV.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? "bg-[#1d9bf0]/20 text-[#1d9bf0]"
                  : "text-[#9ca3af] hover:bg-[#1f2937] hover:text-white"
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Auth status */}
      <div className="p-4 border-t border-[#1f2937]">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              authed === null
                ? "bg-yellow-400 animate-pulse"
                : authed
                ? "bg-green-400"
                : "bg-red-400"
            }`}
          />
          <span className="text-xs text-[#9ca3af]">
            {authed === null ? "Checking…" : authed ? "Connected" : "Not authenticated"}
          </span>
        </div>
      </div>
    </aside>
  );
}
