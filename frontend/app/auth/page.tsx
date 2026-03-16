"use client";

import { useEffect, useState } from "react";
import { api, AuthStatus } from "@/lib/api";

export default function AuthPage() {
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const check = () => {
    setLoading(true);
    api
      .authStatus()
      .then((s) => setStatus(s))
      .catch(() => setStatus({ authenticated: false, error: "Backend unreachable" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    check();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">⚙️ Auth Status</h1>

      {loading ? (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-6 animate-pulse h-40" />
      ) : (
        <div className="space-y-4">
          {/* Status card */}
          <div
            className={`bg-[#111827] border rounded-xl p-6 ${
              status?.authenticated ? "border-green-900/50" : "border-red-900/50"
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-4 h-4 rounded-full ${
                  status?.authenticated ? "bg-green-400" : "bg-red-400"
                }`}
              />
              <h2 className="text-lg font-semibold text-white">
                {status?.authenticated ? "✅ Authenticated" : "❌ Not authenticated"}
              </h2>
            </div>

            {status?.authenticated && (
              <div className="space-y-1">
                {status.name && (
                  <p className="text-sm text-[#e5e7eb]">
                    <span className="text-[#9ca3af]">Name: </span>{status.name}
                  </p>
                )}
                {status.handle && (
                  <p className="text-sm text-[#e5e7eb]">
                    <span className="text-[#9ca3af]">Handle: </span>
                    <span className="text-[#1d9bf0]">@{status.handle}</span>
                  </p>
                )}
              </div>
            )}

            {status?.error && (
              <p className="text-sm text-red-400 mt-2">{status.error}</p>
            )}
          </div>

          {/* Instructions */}
          {!status?.authenticated && (
            <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-white mb-3">How to authenticate:</h3>
              <ol className="space-y-2 text-sm text-[#9ca3af]">
                <li className="flex gap-2">
                  <span className="text-[#1d9bf0] font-mono">1.</span>
                  Install clix: <code className="bg-[#0a0f1e] px-2 py-0.5 rounded text-[#1d9bf0] text-xs">pip install clix0</code>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#1d9bf0] font-mono">2.</span>
                  Log in to X.com in your browser
                </li>
                <li className="flex gap-2">
                  <span className="text-[#1d9bf0] font-mono">3.</span>
                  Run: <code className="bg-[#0a0f1e] px-2 py-0.5 rounded text-[#1d9bf0] text-xs">clix auth login</code>
                </li>
                <li className="flex gap-2">
                  <span className="text-[#1d9bf0] font-mono">4.</span>
                  Come back and refresh
                </li>
              </ol>
            </div>
          )}

          {/* Backend status */}
          <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Backend</h3>
            <p className="text-xs text-[#9ca3af] mb-2">
              API URL: <code className="text-[#1d9bf0]">{process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}</code>
            </p>
            <p className="text-xs text-[#9ca3af]">
              Start backend: <code className="bg-[#0a0f1e] px-2 py-0.5 rounded text-[#1d9bf0]">cd backend && uvicorn main:app --reload</code>
            </p>
          </div>

          <button
            onClick={check}
            className="px-4 py-2 bg-[#1d9bf0] text-white text-sm font-semibold rounded-full hover:bg-[#1a8cd8] transition-colors"
          >
            Refresh Status
          </button>
        </div>
      )}
    </div>
  );
}
