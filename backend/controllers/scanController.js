const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');
const Scan = require('../models/Scan');

// Run Lighthouse audit
async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['accessibility'],
    port: chrome.port,
  };

  try {
    const runnerResult = await lighthouse(url, options);
    await chrome.kill();

    const { lhr } = runnerResult;
    
    return {
      score: lhr.categories.accessibility.score * 100,
      categories: lhr.categories,
      audits: lhr.audits,
    };
  } catch (error) {
    await chrome.kill();
    throw error;
  }
}

// Run Axe-core audit
async function runAxe(url) {
  const browser = await puppeteer.launch({ 
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu'
  ],
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || null
});
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    const results = await new AxePuppeteer(page).analyze();
    await browser.close();

    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      inapplicable: results.inapplicable,
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

// Calculate summary
function calculateSummary(lighthouseResults, axeResults) {
  let totalIssues = 0;
  let criticalIssues = 0;
  let moderateIssues = 0;
  let minorIssues = 0;

  if (axeResults && axeResults.violations) {
    totalIssues = axeResults.violations.length;
    
    axeResults.violations.forEach(violation => {
      if (violation.impact === 'critical') criticalIssues++;
      else if (violation.impact === 'serious' || violation.impact === 'moderate') moderateIssues++;
      else if (violation.impact === 'minor') minorIssues++;
    });
  }

  const accessibilityScore = lighthouseResults ? lighthouseResults.score : 0;

  return {
    totalIssues,
    criticalIssues,
    moderateIssues,
    minorIssues,
    accessibilityScore,
  };
}

// Create new scan
exports.createScan = async (req, res) => {
  try {
    const { url, scanType = 'both' } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Create initial scan record
    const scan = new Scan({
      url,
      scanType,
      status: 'pending',
    });

    await scan.save();

    // Run scans asynchronously
    (async () => {
      try {
        let lighthouseResults = null;
        let axeResults = null;

        if (scanType === 'lighthouse' || scanType === 'both') {
          lighthouseResults = await runLighthouse(url);
        }

        if (scanType === 'axe' || scanType === 'both') {
          axeResults = await runAxe(url);
        }

        const summary = calculateSummary(lighthouseResults, axeResults);

        scan.lighthouseResults = lighthouseResults;
        scan.axeResults = axeResults;
        scan.summary = summary;
        scan.status = 'completed';

        await scan.save();
      } catch (error) {
        scan.status = 'failed';
        scan.error = error.message;
        await scan.save();
      }
    })();

    res.status(201).json({
      message: 'Scan started',
      scanId: scan._id,
      scan,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get scan by ID
exports.getScan = async (req, res) => {
  try {
    const scan = await Scan.findById(req.params.id);

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    res.json(scan);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all scans
exports.getAllScans = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const scans = await Scan.find()
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Scan.countDocuments();

    res.json({
      scans,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalScans: count,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete scan
exports.deleteScan = async (req, res) => {
  try {
    const scan = await Scan.findByIdAndDelete(req.params.id);

    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    res.json({ message: 'Scan deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};