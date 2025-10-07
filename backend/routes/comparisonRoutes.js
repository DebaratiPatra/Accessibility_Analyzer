const express = require('express');
const router = express.Router();
const comparisonController = require('../controllers/comparisonController');

// Compare current scan with automatic previous scan
router.get('/auto/:scanId', comparisonController.compareWithPrevious);

// Compare two specific scans
router.get('/:currentId/:previousId', comparisonController.compareTwoScans);

// Get scan history for a URL
router.get('/history', comparisonController.getScanHistoryByUrl);

// Get progress timeline for a URL
router.get('/timeline', comparisonController.getProgressTimeline);

module.exports = router;