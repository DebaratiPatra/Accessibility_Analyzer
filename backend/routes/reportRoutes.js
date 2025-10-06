const express = require('express');
const router = express.Router();
const Scan = require('../models/Scan');

// Get report statistics
router.get('/stats', async (req, res) => {
  try {
    const totalScans = await Scan.countDocuments();
    const completedScans = await Scan.countDocuments({ status: 'completed' });
    const failedScans = await Scan.countDocuments({ status: 'failed' });
    
    const avgScoreResult = await Scan.aggregate([
      { $match: { status: 'completed', 'summary.accessibilityScore': { $exists: true } } },
      { $group: { _id: null, avgScore: { $avg: '$summary.accessibilityScore' } } }
    ]);

    const avgScore = avgScoreResult.length > 0 ? avgScoreResult[0].avgScore : 0;

    res.json({
      totalScans,
      completedScans,
      failedScans,
      averageAccessibilityScore: avgScore.toFixed(2),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top violations
router.get('/top-violations', async (req, res) => {
  try {
    const scans = await Scan.find({ status: 'completed', 'axeResults.violations': { $exists: true } });
    
    const violationMap = {};
    
    scans.forEach(scan => {
      if (scan.axeResults && scan.axeResults.violations) {
        scan.axeResults.violations.forEach(violation => {
          if (!violationMap[violation.id]) {
            violationMap[violation.id] = {
              id: violation.id,
              description: violation.description,
              impact: violation.impact,
              count: 0,
            };
          }
          violationMap[violation.id].count++;
        });
      }
    });

    const topViolations = Object.values(violationMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    res.json(topViolations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;