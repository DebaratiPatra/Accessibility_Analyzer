import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllScans, deleteScan } from '../services/api';
import { Trash2 } from 'lucide-react';

function ScanHistory() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalScans: 0
  });

  useEffect(() => {
    fetchScans(1);
  }, []);

  const fetchScans = async (page) => {
    try {
      setLoading(true);
      const response = await getAllScans({ page, limit: 10 });
      setScans(response.data.scans);
      setPagination({
        currentPage: parseInt(response.data.currentPage),
        totalPages: response.data.totalPages,
        totalScans: response.data.totalScans
      });
      setError(null);
    } catch (err) {
      setError('Failed to load scans');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this scan?')) {
      try {
        await deleteScan(id);
        fetchScans(pagination.currentPage);
      } catch (err) {
        alert('Failed to delete scan');
      }
    }
  };

  const handlePageChange = (newPage) => {
    fetchScans(newPage);
  };

  if (loading) {
    return <div className="loading">Loading scan history...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>Scan History</h1>
        <Link to="/new-scan" className="btn btn-primary">
          New Scan
        </Link>
      </div>

      {scans.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
            No scans found. <Link to="/new-scan">Create your first scan</Link>
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Score</th>
                  <th>Issues</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((scan) => (
                  <tr key={scan._id}>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {scan.url}
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{scan.scanType}</td>
                    <td>
                      <span className={`status-badge status-${scan.status}`}>
                        {scan.status}
                      </span>
                    </td>
                    <td>
                      {scan.summary?.accessibilityScore ? (
                        <span className={`score-badge ${
                          scan.summary.accessibilityScore >= 90 ? 'score-excellent' :
                          scan.summary.accessibilityScore >= 50 ? 'score-good' : 'score-poor'
                        }`}>
                          {scan.summary.accessibilityScore.toFixed(0)}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      {scan.summary?.totalIssues !== undefined ? (
                        <span style={{ 
                          color: scan.summary.totalIssues > 0 ? '#e74c3c' : '#2ecc71',
                          fontWeight: 'bold'
                        }}>
                          {scan.summary.totalIssues}
                        </span>
                      ) : '-'}
                    </td>
                    <td>{new Date(scan.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/scan/${scan._id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                          View
                        </Link>
                        <button 
                          onClick={() => handleDelete(scan._id)} 
                          className="btn btn-danger"
                          style={{ padding: '0.5rem 1rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                className="btn btn-secondary"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1rem', color: '#7f8c8d' }}>
            Total Scans: {pagination.totalScans}
          </div>
        </>
      )}
    </div>
  );
}

export default ScanHistory;