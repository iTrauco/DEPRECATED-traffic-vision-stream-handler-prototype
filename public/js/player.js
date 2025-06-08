// Player module
const player = {
    hls: null,
    currentStreamId: null,
    
    load: function(streamUrl) {
        const video = document.getElementById('video');
        
        if (!streamUrl) {
            ui.updateStatus('Please enter a stream URL', 'error');
            return;
        }
        
        // Clean up previous instance
        if (this.hls) {
            this.hls.destroy();
        }
        
        // Generate unique ID for this stream
        this.currentStreamId = Date.now().toString();
        
        // Create proxy URL
        const proxyUrl = '/proxy/' + streamUrl.replace(/^https?:\/\//, '');
        
        if (Hls.isSupported()) {
            this.hls = new Hls(config.hlsConfig);
            
            this.hls.on(Hls.Events.MANIFEST_PARSED, function() {
                video.play().catch(e => {
                    ui.updateStatus('Stream loaded. Click play to start.', 'info');
                });
                ui.enableRecordButton();
            });
            
            this.hls.on(Hls.Events.ERROR, function(event, data) {
                if (data.fatal) {
                    ui.updateStatus(`Error: ${data.details}`, 'error');
                    ui.disableRecordButton();
                }
            });
            
            this.hls.loadSource(proxyUrl);
            this.hls.attachMedia(video);
            ui.updateStatus('Loading stream...', 'info');
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support
            video.src = proxyUrl;
            video.addEventListener('loadedmetadata', function() {
                video.play().catch(e => {
                    ui.updateStatus('Stream loaded. Click play to start.', 'info');
                });
                ui.enableRecordButton();
            });
            ui.updateStatus('Loading stream (native)...', 'info');
        } else {
            ui.updateStatus('HLS not supported in this browser', 'error');
        }
    }
};