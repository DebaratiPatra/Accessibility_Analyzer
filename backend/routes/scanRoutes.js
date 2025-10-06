const express = require('express');
const router = express.Router();
const scanController = require('../controllers/scanController');

// Create new scan
router.post('/', scanController.createScan);

// Get all scans
router.get('/', scanController.getAllScans);

// Get scan by ID
router.get('/:id', scanController.getScan);

// Delete scan
router.delete('/:id', scanController.deleteScan);

module.exports = router;