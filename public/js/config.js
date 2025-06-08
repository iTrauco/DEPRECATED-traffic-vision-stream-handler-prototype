// Configuration
const config = {
    defaultStreamUrl: 'https://sfs-msc-pub-lq-01.navigator.dot.ga.gov/rtplive/ATL-CCTV-0092/playlist.m3u8',
    hlsConfig: {
        debug: true,
        enableWorker: true,
        lowLatencyMode: true
    },
    recordingPollInterval: 5000
};