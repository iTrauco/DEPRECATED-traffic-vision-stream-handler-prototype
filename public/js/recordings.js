// Recordings module
const recordings = {
    pollInterval: null,
    
    fetch: async function() {
        try {
            const response = await fetch('/api/recording/active');
            const data = await response.json();
            this.render(data.recordings);
        } catch (error) {
            console.error('Error fetching recordings:', error);
        }
    },
    
    render: function(recordingsList) {
        const list = document.getElementById('recordingsList');
        list.innerHTML = '';
        
        if (recordingsList.length === 0) {
            list.innerHTML = '<li>No active recordings</li>';
        } else {
            recordingsList.forEach(rec => {
                const li = document.createElement('li');
                li.textContent = `${rec.filename} - Started: ${new Date(rec.startTime).toLocaleTimeString()}`;
                list.appendChild(li);
            });
        }
    },
    
    startPolling: function() {
        this.fetch();
        this.pollInterval = setInterval(() => this.fetch(), config.recordingPollInterval);
    },
    
    stopPolling: function() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
        }
    }
};