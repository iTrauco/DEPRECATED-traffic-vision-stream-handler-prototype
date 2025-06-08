let hls = null;
let isRecording = false;
let currentStreamId = null;

function loadStream() {
    const video = document.getElementById('video');
    const streamUrl = document.getElementById('streamUrl').value;
    const status = document.getElementById('status');
    const recordBtn = document.getElementById('recordBtn');
    
    if (!streamUrl) {
        updateStatus('Please enter a stream URL', 'error');
        return;
    }
    
    // Clean up previous instance
    if (hls) {
        hls.destroy();
    }
    
    // Generate unique ID for this stream
    currentStreamId = Date.now().toString();
    
    // Create proxy URL
    const proxyUrl = '/proxy/' + streamUrl.replace(/^https?:\/\//, '');
    
    if (Hls.isSupported()) {
        hls = new Hls({
            debug: true,
            enableWorker: true,
            lowLatencyMode: true
        });
        
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            video.play().catch(e => {
                updateStatus('Stream loaded. Click play to start.', 'info');
            });
            recordBtn.disabled = false;
        });
        
        hls.on(Hls.Events.ERROR, function(event, data) {
            if (data.fatal) {
                updateStatus(`Error: ${data.details}`, 'error');
                recordBtn.disabled = true;
            }
        });
        
        hls.loadSource(proxyUrl);
        hls.attachMedia(video);
        updateStatus('Loading stream...', 'info');
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support
        video.src = proxyUrl;
        video.addEventListener('loadedmetadata', function() {
            video.play().catch(e => {
                updateStatus('Stream loaded. Click play to start.', 'info');
            });
            recordBtn.disabled = false;
        });
        updateStatus('Loading stream (native)...', 'info');
    } else {
        updateStatus('HLS not supported in this browser', 'error');
    }
}

async function toggleRecording() {
    const recordBtn = document.getElementById('recordBtn');
    const streamUrl = document.getElementById('streamUrl').value;
    
    if (!isRecording) {
        // Start recording
        try {
            const response = await fetch('/api/recording/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: streamUrl,
                    id: currentStreamId
                })
            });
            
            const data = await response.json();
            if (response.ok) {
                isRecording = true;
                recordBtn.textContent = 'Stop Recording';
                recordBtn.classList.add('recording');
                updateStatus(`Recording started: ${data.filename}`, 'success');
                fetchActiveRecordings();
            } else {
                updateStatus(`Error: ${data.error}`, 'error');
            }
        } catch (error) {
            updateStatus(`Error: ${error.message}`, 'error');
        }
    } else {
        // Stop recording
        try {
            const response = await fetch('/api/recording/stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: currentStreamId })
            });
            
            const data = await response.json();
            if (response.ok) {
                isRecording = false;
                recordBtn.textContent = 'Start Recording';
                recordBtn.classList.remove('recording');
                updateStatus(`Recording stopped: ${data.filename}`, 'success');
                fetchActiveRecordings();
            } else {
                updateStatus(`Error: ${data.error}`, 'error');
            }
        } catch (error) {
            updateStatus(`Error: ${error.message}`, 'error');
        }
    }
}

async function fetchActiveRecordings() {
    try {
        const response = await fetch('/api/recording/active');
        const data = await response.json();
        
        const list = document.getElementById('recordingsList');
        list.innerHTML = '';
        
        if (data.recordings.length === 0) {
            list.innerHTML = '<li>No active recordings</li>';
        } else {
            data.recordings.forEach(rec => {
                const li = document.createElement('li');
                li.textContent = `${rec.filename} - Started: ${new Date(rec.startTime).toLocaleTimeString()}`;
                list.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Error fetching recordings:', error);
    }
}

function updateStatus(message, type = 'info') {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = type;
}

// Load default stream on page load
window.addEventListener('DOMContentLoaded', function() {
    setTimeout(loadStream, 500);
    fetchActiveRecordings();
    setInterval(fetchActiveRecordings, 5000); // Update every 5 seconds
});