async function runDiagnostics() {
    console.log('=== RECORDING DIAGNOSTICS ===');
    
    // 1. Check if record endpoint responds
    console.log('Testing /record endpoint...');
    try {
        const response = await fetch('/record', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({url: 'test', duration: 1})
        });
        const data = await response.json();
        console.log('Record endpoint response:', data);
    } catch (e) {
        console.error('Record endpoint failed:', e);
    }
    
    // 2. Check server diagnostics
    console.log('\nFetching server diagnostics...');
    try {
        const response = await fetch('/diagnostics');
        const data = await response.json();
        console.log('Server diagnostics:', data);
        
        // Display in UI
        const div = document.createElement('div');
        div.style.cssText = 'position:fixed;top:10px;right:10px;background:white;border:2px solid red;padding:20px;z-index:9999;max-width:400px';
        div.innerHTML = `
            <h3>Diagnostics</h3>
            <p><b>FFmpeg:</b> ${data.ffmpeg_installed ? '✅ Installed' : '❌ NOT INSTALLED'}</p>
            <p><b>FFmpeg Path:</b> ${data.ffmpeg_path || 'Not found'}</p>
            <p><b>Recordings Dir:</b> ${data.recordings_dir_exists ? '✅ Exists' : '❌ Missing'}</p>
            <p><b>Writable:</b> ${data.recordings_writable ? '✅ Yes' : '❌ No'}</p>
            <p><b>Test Recording:</b> ${data.test_recording_success ? '✅ Success' : '❌ Failed'}</p>
            <p><b>Error:</b> ${data.error || 'None'}</p>
            <button onclick="this.parentElement.remove()">Close</button>
        `;
        document.body.appendChild(div);
    } catch (e) {
        console.error('Diagnostics failed:', e);
    }
}

// Add diagnostic button
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.createElement('button');
    btn.textContent = '🔧 Diagnostics';
    btn.onclick = runDiagnostics;
    btn.style.cssText = 'position:fixed;bottom:10px;right:10px;z-index:9999';
    document.body.appendChild(btn);
});