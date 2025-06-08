#!/bin/bash

# Usage: ./stop_recording.sh <output_filename>

OUTPUT=$1
RECORDINGS_DIR="$(dirname "$0")/../recordings"
PID_FILE="$RECORDINGS_DIR/$OUTPUT.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    kill $PID 2>/dev/null
    rm "$PID_FILE"
    echo "Stopped recording PID: $PID"
else
    echo "No PID file found for $OUTPUT"
fi