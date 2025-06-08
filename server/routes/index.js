const express = require('express');
const router = express.Router();

// Import route modules
const proxyRoutes = require('./proxy');
const recordingRoutes = require('./recording');

// Mount routes
router.use('/proxy', proxyRoutes);
router.use('/api/recording', recordingRoutes);

module.exports = router;