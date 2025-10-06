const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const puppeteer = require('puppeteer');
const { AxePuppeteer } = require('@axe-core/puppeteer');
const Scan = require('../models/Scan');

// Run Lighthouse audit
async function runLighthouse(url) {
  let chrome;
  try {
    chrome = await chromeLauncher.launch({ 
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'] 
    });
    
    const options = {
      logLevel: 'error',
      output: 'json',
      onlyCategories: ['accessibility'],
      port: chrome.port,
    };

    const runnerResult = await lighthouse(url, options);
    await chrome.kill();

    const { lhr } = runnerResult;
    
    return {
      score: lhr.categories.accessibility.score * 100,
      categories: lhr.categories,
      audits: lhr.audits,
    };
  } catch (error) {
    if (chrome) await chrome.kill();
    console.error('Lighthouse error:', error);
    throw new Error(`Lighthouse scan failed: ${error.message}`);
  }
}

// Run Axe-core audit
async function runAxe(url) {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    await page.setBypassCSP(true);
    
    // Set a reasonable timeout
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    const results = await new AxePuppeteer(page).analyze();
    await browser.close();

    return {
      violations: results.violations,
      passes: results.passes,
      incomplete: results.incomplete,
      inapplicable: results.inapplicable,
    };
  } catch (error) {
    if (browser) await browser.close();
    console.error('Axe-core error:', error);
    throw new Error(`Axe-core scan failed: ${error.message}`);
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

// Perform the actual scan
async function performScan(scanId) {
  try {
    const scan = await Scan.findById(scanId);
    if (!scan) {
      console.error('Scan not found:', scanId);
      return;
    }

    console.log(`Starting scan for: ${scan.url}`);

    let lighthouseResults = null;
    let axeResults = null;

    if (scan.scanType === 'lighthouse' || scan.scanType === 'both') {
      console.log('Running Lighthouse...');
      lighthouseResults = await runLighthouse(scan.url);
      console.log('Lighthouse completed');
    }

    if (scan.scanType === 'axe' || scan.scanType === 'both') {
      console.log('Running Axe-core...');
      axeResults = await runAxe(scan.url);
      console.log('Axe-core completed');
    }

    const summary = calculateSummary(lighthouseResults, axeResults);

    scan.lighthouseResults = lighthouseResults;
    scan.axeResults = axeResults;
    scan.summary = summary;
    scan.status = 'completed';

    await scan.save();
    console.log(`Scan completed for: ${scan.url}`);
  } catch (error) {
    console.error('Scan error:', error);
    try {
      const scan = await Scan.findById(scanId);
      if (scan) {
        scan.status = 'failed';
        scan.error = error.message;
        await scan.save();
      }
    } catch (saveError) {
      console.error('Error saving failed status:', saveError);
    }
  }
}

// Create new scan
exports.createScan = async (req, res) => {
  try {
    const { url, scanType = 'both' } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }

    // Create initial scan record
    const scan = new Scan({
      url,
      scanType,
      status: 'pending',
    });

    await scan.save();
    console.log('Scan created:', scan._id);

    // Start scan in background
    setImmediate(() => {
      performScan(scan._id.toString());
    });

    res.status(201).json({
      message: 'Scan started',
      scanId: scan._id,
      scan,
    });
  } catch (error) {
    console.error('Create scan error:', error);
    res.status(500).json({ 
      error: 'Failed to create scan',
      message: error.message 
    });
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
    console.error('Get scan error:', error);
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
      .skip((page - 1) * limit)
      .exec();

    const count = await Scan.countDocuments();

    res.json({
      scans,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalScans: count,
    });
  } catch (error) {
    console.error('Get all scans error:', error);
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
    console.error('Delete scan error:', error);
    res.status(500).json({ error: error.message });
  }
};