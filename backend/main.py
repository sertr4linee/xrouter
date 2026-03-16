import asyncio
import json
import shutil
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="xrouter API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLIX_BIN = shutil.which("clix") or "clix"


async def run_clix(*args: str) -> Any:
    cmd = [CLIX_BIN, *args, "--json"]
    try:
        proc = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=60)
    except asyncio.TimeoutError:
        raise HTTPException(status_code=504, detail="clix command timed out")
    except FileNotFoundError:
        raise HTTPException(
            status_code=503,
            detail=f"clix not found at '{CLIX_BIN}'. Install with: pip install clix0",
        )

    if proc.returncode != 0:
        err = stderr.decode("utf-8", errors="replace").strip()
        raise HTTPException(
            status_code=502,
            detail=f"clix error (exit {proc.returncode}): {err or 'unknown error'}",
        )

    raw = stdout.decode("utf-8", errors="replace").strip()
    if not raw:
        return []

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail=f"clix returned non-JSON: {raw[:200]}")


# ── Feed ──────────────────────────────────────────────────────────────────────

@app.get("/api/feed")
async def get_feed(
    type: str = Query(default="for-you", regex="^(for-you|following)$"),
    count: int = Query(default=20, ge=1, le=100),
):
    return await run_clix("feed", "--type", type, "--count", str(count))


# ── Trending ──────────────────────────────────────────────────────────────────

@app.get("/api/trending")
async def get_trending():
    return await run_clix("trending")


# ── Search ────────────────────────────────────────────────────────────────────

@app.get("/api/search")
async def search(
    q: str = Query(..., min_length=1),
    type: str = Query(default="top", regex="^(top|latest|photos|videos)$"),
):
    return await run_clix("search", q, "--type", type)


# ── Single tweet ──────────────────────────────────────────────────────────────

@app.get("/api/tweet/{tweet_id}")
async def get_tweet(tweet_id: str):
    return await run_clix("tweet", tweet_id)


# ── User profile ──────────────────────────────────────────────────────────────

@app.get("/api/user/{handle}")
async def get_user(handle: str):
    return await run_clix("user", handle)


# ── Bookmarks ─────────────────────────────────────────────────────────────────

@app.get("/api/bookmarks")
async def get_bookmarks():
    return await run_clix("bookmarks")


# ── Scheduled tweets ──────────────────────────────────────────────────────────

@app.get("/api/scheduled")
async def get_scheduled():
    return await run_clix("scheduled")


# ── Lists ─────────────────────────────────────────────────────────────────────

@app.get("/api/lists")
async def get_lists():
    return await run_clix("lists")


@app.get("/api/lists/{list_id}/timeline")
async def get_list_timeline(list_id: str):
    return await run_clix("lists", "view", list_id)


# ── DMs ───────────────────────────────────────────────────────────────────────

@app.get("/api/dm/inbox")
async def get_dm_inbox():
    return await run_clix("dm", "inbox")


# ── Auth ──────────────────────────────────────────────────────────────────────

@app.get("/api/auth/status")
async def get_auth_status():
    try:
        result = await run_clix("auth", "status")
        return result
    except HTTPException as exc:
        return {"authenticated": False, "error": exc.detail}


# ── Post tweet ────────────────────────────────────────────────────────────────

class PostTweetBody(BaseModel):
    text: str
    reply_to: Optional[str] = None
    image_path: Optional[str] = None


@app.post("/api/tweet")
async def post_tweet(body: PostTweetBody):
    args = ["post", body.text]
    if body.reply_to:
        args += ["--reply-to", body.reply_to]
    if body.image_path:
        args += ["--image", body.image_path]
    return await run_clix(*args)


# ── Delete tweet ──────────────────────────────────────────────────────────────

@app.delete("/api/tweet/{tweet_id}")
async def delete_tweet(tweet_id: str):
    return await run_clix("delete", tweet_id, "--force")


# ── Like / Unlike ─────────────────────────────────────────────────────────────

@app.post("/api/tweet/{tweet_id}/like")
async def like_tweet(tweet_id: str):
    return await run_clix("like", tweet_id)


@app.delete("/api/tweet/{tweet_id}/like")
async def unlike_tweet(tweet_id: str):
    return await run_clix("unlike", tweet_id)


# ── Retweet ───────────────────────────────────────────────────────────────────

@app.post("/api/tweet/{tweet_id}/retweet")
async def retweet(tweet_id: str):
    return await run_clix("retweet", tweet_id)


# ── Schedule tweet ────────────────────────────────────────────────────────────

class ScheduleTweetBody(BaseModel):
    text: str
    at: str  # ISO datetime string


@app.post("/api/schedule")
async def schedule_tweet(body: ScheduleTweetBody):
    return await run_clix("schedule", body.text, "--at", body.at)


@app.delete("/api/schedule/{tweet_id}")
async def unschedule_tweet(tweet_id: str):
    return await run_clix("unschedule", tweet_id)


# ── Send DM ───────────────────────────────────────────────────────────────────

class SendDMBody(BaseModel):
    handle: str
    text: str


@app.post("/api/dm/send")
async def send_dm(body: SendDMBody):
    return await run_clix("dm", "send", body.handle, body.text)


# ── Follow / Unfollow ─────────────────────────────────────────────────────────

@app.post("/api/user/{handle}/follow")
async def follow_user(handle: str):
    return await run_clix("follow", handle)


@app.delete("/api/user/{handle}/follow")
async def unfollow_user(handle: str):
    return await run_clix("unfollow", handle)
