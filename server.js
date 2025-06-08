const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/static', express.static('static'));

// Default stream URL
const DEFAULT_STREAM_URL = 'https://sfs-msc-pub-lq-01.navigator.dot.ga.gov/rtplive/ATL-CCTV-0092/playlist.m3u8';

// Serve index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// Proxy route for HLS streams
app.use('/proxy', async (req, res) => {
    let url = req.path.substring(1); // Remove leading /
    
    // Reconstruct full URL if needed
    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }
    
    try {
        const headers = { 'User-Agent': 'Mozilla/5.0 (compatible; GDOT-Viewer)' };
        const response = await axios.get(url, {
            headers,
            timeout: 10000,
            responseType: url.endsWith('.ts') ? 'arraybuffer' : 'text'
        });
        
        // Handle m3u8 playlists
        if (url.endsWith('.m3u8')) {
            let content = response.data;
            const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
            
            // Rewrite URLs in playlist to use proxy
            content = content.replace(/([^\s]+\.m3u8)/g, (match) => {
                if (match.startsWith('http')) {
                    return `/proxy/${match}`;
                } else {
                    return `/proxy/${baseUrl}${match}`;
                }
            });
            
            content = content.replace(/([^\s]+\.ts)/g, (match) => {
                if (match.startsWith('http')) {
                    return `/proxy/${match}`;
                } else {
                    return `/proxy/${baseUrl}${match}`;
                }
            });
            
            res.set({
                'Content-Type': 'application/vnd.apple.mpegurl',
                'Cache-Control': 'no-cache'
            });
            res.send(content);
        }
        // Handle TS segments
        else if (url.endsWith('.ts')) {
            res.set('Content-Type', 'video/mp2t');
            res.send(Buffer.from(response.data));
        }
        // Default response
        else {
            res.send(response.data);
        }
        
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).send(`Proxy error: ${error.message}`);
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});