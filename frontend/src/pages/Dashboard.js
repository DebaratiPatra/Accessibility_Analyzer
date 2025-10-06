import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats, getAllScans } from '../services/api';
import { Activity, CheckCircle, XCircle, TrendingUp } from 'lucide-react';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, scansResponse] = await Promise.all([
        getStats(),
        getAllScans({ page: 1, limit: 5 })
      ]);
      
      setStats(statsResponse.data);
      setRecentScans(scansResponse.data.scans);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <Activity size={32} color="#3498db" style={{ marginBottom: '0.5rem' }} />
          <div className="stat-value">{stats?.totalScans || 0}</div>
          <div className="stat-label">Total Scans</div>
        </div>

        <div className="stat-card">
          <CheckCircle size={32} color="#2ecc71" style={{ marginBottom: '0.5rem' }} />
          <div className="stat-value">{stats?.completedScans || 0}</div>
          <div className="stat-label">Completed</div>
        </div>

        <div className="stat-card">
          <XCircle size={32} color="#e74c3c" style={{ marginBottom: '0.5rem' }} />
          <div className="stat-value">{stats?.failedScans || 0}</div>
          <div className="stat-label">Failed</div>
        </div>

        <div className="stat-card">
          <TrendingUp size={32} color="#f39c12" style={{ marginBottom: '0.5rem' }} />
          <div className="stat-value">{stats?.averageAccessibilityScore || 0}</div>
          <div className="stat-label">Average Score</div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Recent Scans</h2>
        {recentScans.length === 0 ? (
          <p>No scans yet. <Link to="/new-scan">Create your first scan</Link></p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>URL</th>
                <th>Status</th>
                <th>Score</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentScans.map((scan) => (
                <tr key={scan._id}>
                  <td>{scan.url}</td>
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
                  <td>{new Date(scan.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/scan/${scan._id}`} className="btn btn-secondary">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <Link to="/new-scan" className="btn btn-primary">
          Start New Scan
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;