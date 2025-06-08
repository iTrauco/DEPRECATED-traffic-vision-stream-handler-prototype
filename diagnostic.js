const fs = require('fs');
const path = require('path');

console.log('🔍 GDOT Project Diagnostic\n');

// Check directories
const dirs = [
    'server',
    'server/routes',
    'server/controllers',
    'public',
    'public/css',
    'public/js',
    'recordings'
];

console.log('📁 Directories:');
dirs.forEach(dir => {
    const exists = fs.existsSync(dir);
    console.log(`  ${exists ? '✅' : '❌'} ${dir}`);
});

// Check files
const files = [
    'server/server.js',
    'server/routes/index.js',
    'server/routes/proxy.js',
    'server/routes/recording.js',
    'server/controllers/recording.js',
    'public/index.html',
    'public/css/main.css',
    'public/css/controls.css',
    'public/css/video.css',
    'public/css/status.css',
    'public/css/recordings.css',
    'public/js/config.js',
    'public/js/ui.js',
    'public/js/player.js',
    'public/js/recorder.js',
    'public/js/recordings.js',
    'public/js/app.js'
];

console.log('\n📄 Files:');
files.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
});

// Check FFmpeg
const { execSync } = require('child_process');
console.log('\n🎬 FFmpeg:');
try {
    execSync('which ffmpeg');
    console.log('  ✅ FFmpeg installed');
} catch {
    console.log('  ❌ FFmpeg not found - install with: sudo apt install ffmpeg');
}

// Check node modules
console.log('\n📦 Node Modules:');
const requiredModules = ['express', 'cors', 'axios'];
requiredModules.forEach(mod => {
    const exists = fs.existsSync(`node_modules/${mod}`);
    console.log(`  ${exists ? '✅' : '❌'} ${mod}`);
});

// Check routes mounting
if (fs.existsSync('server/routes/index.js')) {
    console.log('\n🔌 Route Mounting:');
    const routeIndex = fs.readFileSync('server/routes/index.js', 'utf8');
    console.log('  Proxy route:', routeIndex.includes("router.use('/proxy'") ? '✅' : '❌');
    console.log('  Recording route:', routeIndex.includes("router.use('/api/recording'") ? '✅' : '❌');
}

console.log('\n💡 To run: node server/server.js');