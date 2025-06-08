// Recorder module
const recorder = {
    isRecording: false,
    
    toggle: async function() {
        const streamUrl = document.getElementById('streamUrl').value;
        
        if (!this.isRecording) {
            await this.start(streamUrl);
        } else {
            await this.stop();
        }
    },
    
    start: async function(streamUrl) {
        try {
            const response = await fetch('/api/recording/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: streamUrl,  // This should be the original URL, not proxy
                    id: player.currentStreamId
                })
            });
            
            const data = await response.json();
            if (response.ok) {
                this.isRecording = true;
                ui.setRecordingState(true);
                ui.updateStatus(`Recording started: ${data.filename}`, 'success');
                recordings.fetch();
            } else {
                ui.updateStatus(`Error: ${data.error}`, 'error');
            }
        } catch (error) {
            ui.updateStatus(`Error: ${error.message}`, 'error');
        }
    },
    
    stop: async function() {
        try {
            const response = await fetch('/api/recording/stop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: player.currentStreamId })
            });
            
            const data = await response.json();
            if (response.ok) {
                this.isRecording = false;
                ui.setRecordingState(false);
                ui.updateStatus(`Recording stopped: ${data.filename}`, 'success');
                recordings.fetch();
            } else {
                ui.updateStatus(`Error: ${data.error}`, 'error');
            }
        } catch (error) {
            ui.updateStatus(`Error: ${error.message}`, 'error');
        }
    }
};