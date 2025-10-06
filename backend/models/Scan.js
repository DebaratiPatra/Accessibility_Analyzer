const mongoose = require('mongoose');

const scanSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  scanType: {
    type: String,
    enum: ['lighthouse', 'axe', 'both'],
    default: 'both'
  },
  lighthouseResults: {
    score: Number,
    categories: Object,
    audits: Object,
  },
  axeResults: {
    violations: Array,
    passes: Array,
    incomplete: Array,
    inapplicable: Array,
  },
  summary: {
    totalIssues: Number,
    criticalIssues: Number,
    moderateIssues: Number,
    minorIssues: Number,
    accessibilityScore: Number,
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  error: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Scan', scanSchema);