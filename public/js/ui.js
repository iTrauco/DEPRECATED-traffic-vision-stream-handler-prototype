// UI module
const ui = {
    updateStatus: function(message, type = 'info') {
        const status = document.getElementById('status');
        status.textContent = message;
        status.className = type;
    },
    
    setRecordingState: function(isRecording) {
        const btn = document.getElementById('recordBtn');
        if (isRecording) {
            btn.textContent = 'Stop Recording';
            btn.classList.add('recording');
        } else {
            btn.textContent = 'Start Recording';
            btn.classList.remove('recording');
        }
    },
    
    enableRecordButton: function() {
        document.getElementById('recordBtn').disabled = false;
    },
    
    disableRecordButton: function() {
        document.getElementById('recordBtn').disabled = true;
    }
};