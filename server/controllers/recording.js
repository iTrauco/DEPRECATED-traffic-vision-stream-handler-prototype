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
    
    const timestamp = new Date().toISOString().replace(/:/g, '_').replace(/-/g, '_').replace(/\./g, '_');
    const filename = `recording_${id}_${timestamp}.mp4`;
    const scriptPath = path.join(__dirname, '../../scripts/record_stream.sh');
    
    // Execute recording script
    const recordProcess = spawn('bash', [scriptPath, url, filename], {
        detached: true,
        stdio: 'ignore'
    });
    
    recordProcess.unref();
    
    activeRecordings.set(id, {
        filename,
        url,
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
    }
    
    const scriptPath = path.join(__dirname, '../../scripts/stop_recording.sh');
    const stopProcess = spawn('bash', [scriptPath, recording.filename], {
        detached: true,
        stdio: 'ignore'
    });
    
    stopProcess.unref();
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