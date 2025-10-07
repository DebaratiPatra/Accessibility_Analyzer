import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getScan, deleteScan } from '../services/api';
import { AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';

function ScanDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [scan, setScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch scan
    const fetchScan = async () => {
      try {
        const response = await getScan(id);
        setScan(response.data);
        setError(null);
        setLoading(false);
      } catch (err) {
        setError('Failed to load scan details');
        setLoading(false);
        console.error(err);
      }
    };

    fetchScan();

    // Auto-refresh if scan is pending
    const interval = setInterval(async () => {
      try {
        const latestScan = await getScan(id);
        setScan(latestScan.data);
        if (latestScan.data.status !== 'pending') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this scan?')) {
      try {
        await deleteScan(id);
        navigate('/history');
      } catch (err) {
        alert('Failed to delete scan');
      }
    }
  };

  if (loading) return <div className="loading">Loading scan details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!scan) return <div className="error">Scan not found</div>;

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Scan Details</h1>
        <button onClick={handleDelete} className="btn btn-danger">
          Delete Scan
        </button>
      </div>

      {/* Basic Info */}
      <div className="card">
        <h2 className="card-title">Scan Information</h2>
        <div style={{ lineHeight: '2' }}>
          <p><strong>URL:</strong> <a href={scan.url} target="_blank" rel="noopener noreferrer">{scan.url}</a></p>
          <p><strong>Scan Type:</strong> {scan.scanType}</p>
          <p><strong>Status:</strong> <span className={`status-badge status-${scan.status}`}>{scan.status}</span></p>
          <p><strong>Created:</strong> {new Date(scan.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {scan.status === 'pending' && (
        <div className="card" style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #f39c12' }}>
          <p style={{ margin: 0 }}>
            <strong>Scan in progress...</strong> This page will automatically refresh when the scan is complete.
          </p>
        </div>
      )}

      {scan.status === 'failed' && (
        <div className="error">
          <strong>Scan failed:</strong> {scan.error || 'Unknown error occurred'}
        </div>
      )}

      {scan.status === 'completed' && (
        <>
          {/* Summary */}
          {scan.summary && (
            <div className="card">
              <h2 className="card-title">Summary</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{scan.summary.accessibilityScore?.toFixed(0) || 0}</div>
                  <div className="stat-label">Accessibility Score</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value" style={{ color: '#e74c3c' }}>{scan.summary.totalIssues || 0}</div>
                  <div className="stat-label">Total Issues</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value" style={{ color: '#c0392b' }}>{scan.summary.criticalIssues || 0}</div>
                  <div className="stat-label">Critical</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value" style={{ color: '#f39c12' }}>{scan.summary.moderateIssues || 0}</div>
                  <div className="stat-label">Moderate</div>
                </div>
              </div>
            </div>
          )}

          {/* Lighthouse Results */}
          {scan.lighthouseResults && (
            <div className="card">
              <h2 className="card-title">Lighthouse Results</h2>
              <div style={{ marginBottom: '1rem' }}>
                <span className={`score-badge ${
                  scan.lighthouseResults.score >= 90 ? 'score-excellent' :
                  scan.lighthouseResults.score >= 50 ? 'score-good' : 'score-poor'
                }`}>
                  Score: {scan.lighthouseResults.score?.toFixed(0)}
                </span>
              </div>
              <p style={{ color: '#7f8c8d' }}>
                Lighthouse evaluates accessibility based on automated checks. 
                A score of 90+ is excellent, 50-89 needs improvement, below 50 needs significant work.
              </p>
            </div>
          )}

          {/* Axe Violations */}
          {scan.axeResults && scan.axeResults.violations && scan.axeResults.violations.length > 0 && (
            <div className="card">
              <h2 className="card-title">Accessibility Violations ({scan.axeResults.violations.length})</h2>
              {scan.axeResults.violations.map((violation, index) => (
                <div key={index} className={`violation-card ${violation.impact}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                    <div className="violation-title">
                      {violation.impact === 'critical' && <AlertCircle size={16} color="#e74c3c" style={{ marginRight: '0.5rem', display: 'inline' }} />}
                      {violation.impact === 'serious' && <AlertTriangle size={16} color="#f39c12" style={{ marginRight: '0.5rem', display: 'inline' }} />}
                      {violation.impact === 'moderate' && <AlertTriangle size={16} color="#f39c12" style={{ marginRight: '0.5rem', display: 'inline' }} />}
                      {violation.impact === 'minor' && <Info size={16} color="#3498db" style={{ marginRight: '0.5rem', display: 'inline' }} />}
                      {violation.id}
                    </div>
                    <span className={`violation-impact impact-${violation.impact}`}>
                      {violation.impact}
                    </span>
                  </div>
                  <p style={{ marginBottom: '0.5rem' }}>{violation.description}</p>
                  <p style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                    <strong>Affected elements:</strong> {violation.nodes?.length || 0}
                  </p>
                  {violation.help && (
                    <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.5rem' }}>
                      <strong>Help:</strong> {violation.help}
                    </p>
                  )}
                  {violation.helpUrl && (
                    <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                      <a href={violation.helpUrl} target="_blank" rel="noopener noreferrer">
                        Learn more →
                      </a>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {scan.axeResults && scan.axeResults.violations && scan.axeResults.violations.length === 0 && (
            <div className="success">
              <CheckCircle size={20} style={{ marginRight: '0.5rem', display: 'inline' }} />
              <strong>Great!</strong> No accessibility violations found by Axe-core.
            </div>
          )}
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button onClick={() => navigate('/history')} className="btn btn-secondary">
          Back to History
        </button>
      </div>
    </div>
  );
}

export default ScanDetails;