#!/bin/bash
set -e

echo "🚀 Starting xrouter..."

# Start backend
cd "$(dirname "$0")/backend"
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
echo "✓ Backend started (PID $BACKEND_PID) on http://localhost:8000"

# Start frontend
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!
echo "✓ Frontend started (PID $FRONTEND_PID) on http://localhost:3000"

echo ""
echo "⚡ xrouter running at http://localhost:3000"
echo "   Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT INT TERM
wait
