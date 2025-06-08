#!/bin/bash

# Usage: ./stop_recording.sh <output_filename>

OUTPUT=$1
PROJECT_ROOT="$(dirname "$0")/.."
RECORDINGS_DIR="$PROJECT_ROOT/recordings"
PID_FILE="$RECORDINGS_DIR/$OUTPUT.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    kill $PID 2>/dev/null
    rm "$PID_FILE"
    echo "Stopped recording PID: $PID"
else
    echo "No PID file found for $OUTPUT"
fi