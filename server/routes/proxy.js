const express = require('express');
const axios = require('axios');
const router = express.Router();

// Proxy route for HLS streams
router.use('/', async (req, res) => {
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

module.exports = router;