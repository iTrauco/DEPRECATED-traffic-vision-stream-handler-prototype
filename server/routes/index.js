const express = require('express');
const router = express.Router();

console.log('Loading routes...');

// Import route modules
const proxyRoutes = require('./proxy');
const recordingRoutes = require('./recording');

// Mount routes
router.use('/proxy', proxyRoutes);
router.use('/api/recording', recordingRoutes);

console.log('Routes loaded');

module.exports = router;