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
            
            # Replace all .m3u8 and .ts references
            content = re.sub(r'[^\s]+\.m3u8', rewrite_url, content)
            content = re.sub(r'[^\s]+\.ts', rewrite_url, content)
            
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