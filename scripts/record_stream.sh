#!/bin/bash

# Usage: ./record_stream.sh <stream_url> <output_filename>

URL=$1
OUTPUT=$2
PROJECT_ROOT="$(dirname "$0")/.."
RECORDINGS_DIR="$PROJECT_ROOT/recordings"

# Create recordings dir if it doesn't exist
mkdir -p "$RECORDINGS_DIR"

# Run streamlink in background
nohup streamlink \
    "$URL" \
    best \
    -o "$RECORDINGS_DIR/$OUTPUT" \
    > "$RECORDINGS_DIR/$OUTPUT.log" 2>&1 &

# Save PID for stopping later
echo $! > "$RECORDINGS_DIR/$OUTPUT.pid"

echo "Recording started with PID: $!"