# xrouter — X Dashboard powered by clix

OpenTweet-style dashboard using [clix](https://github.com/spideystreet/clix) — cookie-based X access, no API keys.

## Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- `clix` installed and authenticated

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### clix Authentication
```bash
pip install clix0
clix auth login   # extracts cookies from your browser
```

## Features
- 🏠 **Feed** — For You / Following tabs with live tweets
- 🔥 **Trending** — Trending topics grid
- 🔍 **Search** — Top / Latest / Photos / Videos
- ✍️ **Compose** — Post tweets or schedule them
- 📅 **Scheduled** — Manage scheduled tweets
- 🔖 **Bookmarks** — Your saved tweets
- 📋 **Lists** — View list timelines
- 💬 **DMs** — Direct message inbox + send
- 👤 **Profile** — Look up any user
- ⚙️ **Auth Status** — Check clix authentication

## Architecture
```
xrouter/
├── backend/          FastAPI backend calling clix via subprocess
│   ├── main.py
│   └── requirements.txt
└── frontend/         Next.js 14 App Router
    ├── app/          Pages
    ├── components/   TweetCard, Sidebar, Composer, TrendingWidget
    └── lib/          API client + utilities
```
