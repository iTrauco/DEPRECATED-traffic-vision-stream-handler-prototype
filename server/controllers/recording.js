const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Active recordings tracker
const activeRecordings = new Map();

// Start recording a stream
exports.startRecording = (req, res) => {
    const { url, id } = req.body;
    
    if (!url || !id) {
        return res.status(400).json({ error: 'URL and ID required' });
    }
    
    if (activeRecordings.has(id)) {
        return res.status(400).json({ error: 'Recording already active for this ID' });
    }
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const filename = `recording_${id}_${timestamp}.mp4`;
    const filepath = path.join(__dirname, '../../recordings', filename);
    
    // FFmpeg command to record HLS stream
    const ffmpeg = spawn('ffmpeg', [
        '-i', url,
        '-c', 'copy',
        '-bsf:a', 'aac_adtstoasc',
        '-f', 'mp4',
        '-movflags', 'frag_keyframe+empty_moov',
        filepath
    ], {
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
    });
    
    ffmpeg.stdout.on('data', (data) => {
        console.log(`FFmpeg stdout ${id}: ${data}`);
    });
    
    ffmpeg.stderr.on('data', (data) => {
        console.error(`FFmpeg stderr ${id}: ${data}`);
    });
    
    ffmpeg.on('error', (error) => {
        console.error(`FFmpeg spawn error for ${id}:`, error);
        activeRecordings.delete(id);
    });
    
    ffmpeg.on('exit', (code, signal) => {
        console.log(`FFmpeg ${id} exited with code ${code} signal ${signal}`);
        activeRecordings.delete(id);
    });
    
    activeRecordings.set(id, {
        process: ffmpeg,
        url,
        filename,
        startTime: new Date()
    });
    
    res.json({ 
        message: 'Recording started',
        id,
        filename 
    });
};

// Stop recording
exports.stopRecording = (req, res) => {
    const { id } = req.body;
    
    if (!id) {
        return res.status(400).json({ error: 'ID required' });
    }
    
    console.log('Stopping recording:', id);
    console.log('Active recordings:', Array.from(activeRecordings.keys()));
    
    const recording = activeRecordings.get(id);
    if (!recording) {
        return res.status(404).json({ error: 'Recording not found' });
    }(id);
    if (!recording) {
        return res.status(404).json({ error: 'Recording not found' });
    }
    
    recording.process.kill('SIGINT');
    activeRecordings.delete(id);
    
    res.json({ 
        message: 'Recording stopped',
        id,
        filename: recording.filename 
    });
};

// Get active recordings
exports.getActiveRecordings = (req, res) => {
    const recordings = Array.from(activeRecordings.entries()).map(([id, data]) => ({
        id,
        url: data.url,
        filename: data.filename,
        startTime: data.startTime
    }));
    
    res.json({ recordings });
};