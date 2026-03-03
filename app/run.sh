#!/bin/bash

cd "$(dirname "$0")"

# Start backend on port 8000
cd backend
uvicorn main:app --reload --port 8000 &
BACK_PID=$!
cd ..

# Start frontend on port 5500
cd frontend
python3 -m http.server 5500 &
FRONT_PID=$!
cd ..

# Give servers a moment to start
sleep 2

FRONT_URL="http://localhost:5500/front_page/index.html"

# Open browser (cross-platform)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$FRONT_URL"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$FRONT_URL"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    start "$FRONT_URL"
fi

echo "Backend:  http://localhost:8000/docs"
echo "Frontend: $FRONT_URL"
echo "Press Ctrl+C to stop both"

trap "kill $BACK_PID $FRONT_PID 2>/dev/null" EXIT
wait