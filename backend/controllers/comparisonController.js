const Scan = require('../models/Scan');

// Compare two scans
function compareScans(currentScan, previousScan) {
  const comparison = {
    scoreChange: 0,
    issuesFixed: 0,
    newIssues: 0,
    stillPresent: 0,
    improvementPercentage: 0,
    fixedViolations: [],
    newViolations: [],
    persistentViolations: [],
  };

  // Compare accessibility scores
  const currentScore = currentScan.summary?.accessibilityScore || 0;
  const previousScore = previousScan.summary?.accessibilityScore || 0;
  comparison.scoreChange = currentScore - previousScore;

  // Get violation IDs from both scans
  const currentViolationIds = new Set(
    (currentScan.axeResults?.violations || []).map(v => v.id)
  );
  const previousViolationIds = new Set(
    (previousScan.axeResults?.violations || []).map(v => v.id)
  );

  // Find fixed violations (in previous but not in current)
  previousScan.axeResults?.violations?.forEach(violation => {
    if (!currentViolationIds.has(violation.id)) {
      comparison.fixedViolations.push({
        id: violation.id,
        description: violation.description,
        impact: violation.impact,
      });
      comparison.issuesFixed++;
    }
  });

  // Find new violations (in current but not in previous)
  currentScan.axeResults?.violations?.forEach(violation => {
    if (!previousViolationIds.has(violation.id)) {
      comparison.newViolations.push({
        id: violation.id,
        description: violation.description,
        impact: violation.impact,
      });
      comparison.newIssues++;
    }
  });

  // Find persistent violations (in both)
  currentScan.axeResults?.violations?.forEach(violation => {
    if (previousViolationIds.has(violation.id)) {
      comparison.persistentViolations.push({
        id: violation.id,
        description: violation.description,
        impact: violation.impact,
      });
      comparison.stillPresent++;
    }
  });

  // Calculate improvement percentage
  const totalPreviousIssues = previousScan.summary?.totalIssues || 0;
  if (totalPreviousIssues > 0) {
    comparison.improvementPercentage = 
      ((comparison.issuesFixed / totalPreviousIssues) * 100).toFixed(2);
  }

  return comparison;
}

// Get comparison between two specific scans
exports.compareTwoScans = async (req, res) => {
  try {
    const { currentId, previousId } = req.params;

    const [currentScan, previousScan] = await Promise.all([
      Scan.findById(currentId),
      Scan.findById(previousId)
    ]);

    if (!currentScan || !previousScan) {
      return res.status(404).json({ error: 'One or both scans not found' });
    }

    if (currentScan.url !== previousScan.url) {
      return res.status(400).json({ error: 'Scans must be of the same URL' });
    }

    const comparison = compareScans(currentScan, previousScan);

    res.json({
      currentScan: {
        id: currentScan._id,
        url: currentScan.url,
        date: currentScan.createdAt,
        score: currentScan.summary?.accessibilityScore,
        totalIssues: currentScan.summary?.totalIssues,
      },
      previousScan: {
        id: previousScan._id,
        url: previousScan.url,
        date: previousScan.createdAt,
        score: previousScan.summary?.accessibilityScore,
        totalIssues: previousScan.summary?.totalIssues,
      },
      comparison
    });
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get comparison with automatic previous scan
exports.compareWithPrevious = async (req, res) => {
  try {
    const { scanId } = req.params;
    const currentScan = await Scan.findById(scanId);

    if (!currentScan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    if (currentScan.status !== 'completed') {
      return res.status(400).json({ error: 'Scan must be completed for comparison' });
    }

    // Find previous scan of same URL
    const previousScan = await Scan.findOne({
      url: currentScan.url,
      status: 'completed',
      _id: { $ne: currentScan._id },
      createdAt: { $lt: currentScan.createdAt }
    }).sort({ createdAt: -1 });

    if (!previousScan) {
      return res.status(404).json({ 
        error: 'No previous scan found for this URL',
        message: 'This is the first scan for this URL'
      });
    }

    const comparison = compareScans(currentScan, previousScan);

    res.json({
      currentScan: {
        id: currentScan._id,
        url: currentScan.url,
        date: currentScan.createdAt,
        score: currentScan.summary?.accessibilityScore,
        totalIssues: currentScan.summary?.totalIssues,
      },
      previousScan: {
        id: previousScan._id,
        url: previousScan.url,
        date: previousScan.createdAt,
        score: previousScan.summary?.accessibilityScore,
        totalIssues: previousScan.summary?.totalIssues,
      },
      comparison
    });
  } catch (error) {
    console.error('Comparison error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get scan history for a URL (for dropdown selection)
exports.getScanHistoryByUrl = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' });
    }

    const scans = await Scan.find({
      url: url,
      status: 'completed'
    })
    .sort({ createdAt: -1 })
    .select('_id url createdAt summary.accessibilityScore summary.totalIssues')
    .limit(20);

    res.json({ scans, total: scans.length });
  } catch (error) {
    console.error('Get scan history error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get progress timeline for a URL
exports.getProgressTimeline = async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'URL parameter required' });
    }

    const scans = await Scan.find({
      url: url,
      status: 'completed'
    })
    .sort({ createdAt: 1 })
    .select('createdAt summary');

    const timeline = scans.map(scan => ({
      date: scan.createdAt,
      score: scan.summary?.accessibilityScore || 0,
      totalIssues: scan.summary?.totalIssues || 0,
      criticalIssues: scan.summary?.criticalIssues || 0,
    }));

    res.json({ url, timeline });
  } catch (error) {
    console.error('Timeline error:', error);
    res.status(500).json({ error: error.message });
  }
};