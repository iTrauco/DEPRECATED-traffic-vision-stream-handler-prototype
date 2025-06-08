// Main app initialization
const app = {
    init: function() {
        // Set default URL
        document.getElementById('streamUrl').value = config.defaultStreamUrl;
        
        // Bind events
        this.bindEvents();
        
        // Start recordings polling
        recordings.startPolling();
        
        // Auto-load default stream
        setTimeout(() => player.load(config.defaultStreamUrl), 500);
    },
    
    bindEvents: function() {
        window.loadStream = () => {
            const url = document.getElementById('streamUrl').value;
            player.load(url);
        };
        
        window.toggleRecording = () => {
            recorder.toggle();
        };
    }
};

// Initialize on DOM ready
window.addEventListener('DOMContentLoaded', () => app.init());