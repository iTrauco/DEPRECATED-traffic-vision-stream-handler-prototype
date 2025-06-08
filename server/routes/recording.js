
const express = require('express');
const router = express.Router();
const recordingController = require('../controllers/recording');

// Start recording
router.post('/start', recordingController.startRecording);

// Stop recording
router.post('/stop', recordingController.stopRecording);

// List active recordings
router.get('/active', recordingController.getActiveRecordings);

module.exports = router;