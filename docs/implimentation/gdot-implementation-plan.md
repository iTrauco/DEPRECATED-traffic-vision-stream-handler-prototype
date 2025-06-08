# GDOT Live Stream Viewer - Implementation Plan

## Project Structure

```
gdot-viewer/
├── server.py           # Main HTTP server with HLS proxy
├── static/
│   ├── index.html      # UI with video player
│   ├── viewer.js       # HLS.js player logic
│   └── style.css       # Basic styling
├── requirements.txt    # Python dependencies
├── .gitignore         
└── README.md          # Setup instructions
```

## Environment Setup

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install required packages
pip install flask flask-cors requests

# Export requirements
pip freeze > requirements.txt
```

## Implementation Files

### server.py

```python
#!/usr/bin/env python3
"""
Simple Flask server with HLS proxy for GDOT camera streams
"""

from flask import Flask, Response, request, send_from_directory
from flask_cors import CORS
import requests
import re
from urllib.parse import urljoin, urlparse

app = Flask(__name__, static_folder='static')
CORS(app)

# Configuration
DEFAULT_STREAM_URL = 'https://sfs-msc-pub-lq-01.navigator.dot.ga.gov/rtplive/ATL-CCTV-0092/playlist.m3u8'

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

@app.route('/proxy/<path:url>')
def proxy(url):
    """Proxy HLS streams to handle CORS"""
    # Reconstruct full URL
    if not url.startswith('http'):
        url = 'https://' + url
    
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (compatible; GDOT-Viewer)'}
        response = requests.get(url, headers=headers, timeout=10)
        
        # Handle m3u8 playlists
        if url.endswith('.m3u8'):
            content = response.text
            base_url = '/'.join(url.split('/')[:-1]) + '/'
            
            # Rewrite URLs in playlist to use proxy
            def rewrite_url(match):
                segment_url = match.group(0)
                if segment_url.startswith('http'):
                    return f'/proxy/{segment_url}'
                else:
                    full_url = urljoin(base_url, segment_url)
                    return f'/proxy/{full_url}'
            
            # Replace all .m3u8 and .ts references with better pattern
            # Match URLs that are either full URLs or relative paths
            content = re.sub(r'(?:https?://[^\s]+\.m3u8|[\w\-./]+\.m3u8)', rewrite_url, content)
            content = re.sub(r'(?:https?://[^\s]+\.ts|[\w\-./]+\.ts)', rewrite_url, content)
            
            print(f"Proxying playlist: {url}")
            print(f"First 500 chars:\n{content[:500]}")
            
            return Response(content, mimetype='application/vnd.apple.mpegurl',
                          headers={'Cache-Control': 'no-cache'})
        
        # Handle TS segments
        elif url.endswith('.ts'):
            return Response(response.content, mimetype='video/mp2t')
        
        # Default binary response
        return Response(response.content)
        
    except Exception as e:
        return f"Proxy error: {str(e)}", 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
```

### static/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GDOT Camera Viewer</title>
    <link rel="stylesheet" href="/static/style.css">
    <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>
</head>
<body>
    <div class="container">
        <h1>GDOT Camera Viewer</h1>
        
        <div class="controls">
            <input type="text" id="streamUrl" 
                   placeholder="Enter GDOT stream URL" 
                   value="https://sfs-msc-pub-lq-01.navigator.dot.ga.gov/rtplive/ATL-CCTV-0092/playlist.m3u8">
            <button onclick="loadStream()">Load Stream</button>
        </div>
        
        <div class="video-container">
            <video id="video" controls></video>
        </div>
        
        <div id="status"></div>
    </div>
    
    <script src="/static/viewer.js"></script>
</body>
</html>
```

### static/viewer.js

```javascript
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
```

### static/style.css

```css
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
}

.container {
    max-width: 900px;
    margin: 20px auto;
    padding: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

h1 {
    text-align: center;
    color: #333;
    margin-top: 0;
}

.controls {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

#streamUrl {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
}

button:hover {
    background-color: #0056b3;
}

.video-container {
    background-color: black;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 20px;
}

video {
    width: 100%;
    display: block;
}

#status {
    padding: 10px;
    border-radius: 4px;
    text-align: center;
    font-size: 14px;
}

#status.info {
    background-color: #d1ecf1;
    color: #0c5460;
}

#status.error {
    background-color: #f8d7da;
    color: #721c24;
}

#status.success {
    background-color: #d4edda;
    color: #155724;
}
```

### requirements.txt

```
blinker==1.9.0
certifi==2025.4.26
charset-normalizer==3.4.2
click==8.2.1
Flask==3.1.1
flask-cors==6.0.0
idna==3.10
itsdangerous==2.2.0
Jinja2==3.1.6
MarkupSafe==3.0.2
requests==2.32.3
urllib3==2.4.0
Werkzeug==3.1.3
```