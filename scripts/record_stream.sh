#!/bin/bash

# Usage: ./record_stream.sh <stream_url> <output_filename>

URL=$1
OUTPUT=$2
RECORDINGS_DIR="$(dirname "$0")/../recordings"

# Create recordings dir if it doesn't exist
mkdir -p "$RECORDINGS_DIR"

# Run FFmpeg in background
nohup ffmpeg \
    -user_agent "Mozilla/5.0 (compatible; GDOT-Viewer)" \
    -i "$URL" \
    -c copy \
    -f mp4 \
    "$RECORDINGS_DIR/$OUTPUT" \
    > "$RECORDINGS_DIR/$OUTPUT.log" 2>&1 &

# Save PID for stopping later
echo $! > "$RECORDINGS_DIR/$OUTPUT.pid"

echo "Recording started with PID: $!"