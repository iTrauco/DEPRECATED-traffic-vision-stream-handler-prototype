let hls = null;

function loadStream() {
    const video = document.getElementById('video');
    const streamUrl = document.getElementById('streamUrl').value;
    const status = document.getElementById('status');
    
    if (!streamUrl) {
        updateStatus('Please enter a stream URL', 'error');
        return;
    }
    
    // Clean up previous instance
    if (hls) {
        hls.destroy();
    }
    
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
        });
        
        hls.on(Hls.Events.ERROR, function(event, data) {
            if (data.fatal) {
                updateStatus(`Error: ${data.details}`, 'error');
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
        });
        updateStatus('Loading stream (native)...', 'info');
    } else {
        updateStatus('HLS not supported in this browser', 'error');
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
});