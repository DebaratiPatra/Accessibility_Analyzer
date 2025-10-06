import React, { useState, useEffect } from 'react';
import { getStats, getTopViolations } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function Reports() {
  const [stats, setStats] = useState(null);
  const [topViolations, setTopViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [statsResponse, violationsResponse] = await Promise.all([
        getStats(),
        getTopViolations()
      ]);
      
      setStats(statsResponse.data);
      setTopViolations(violationsResponse.data);
      setError(null);
    } catch (err) {
      setError('Failed to load report data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading reports...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  const scanStatusData = [
    { name: 'Completed', value: stats?.completedScans || 0, color: '#2ecc71' },
    { name: 'Failed', value: stats?.failedScans || 0, color: '#e74c3c' },
  ];

  const violationChartData = topViolations.slice(0, 10).map(v => ({
    name: v.id.substring(0, 30) + (v.id.length > 30 ? '...' : ''),
    count: v.count,
    impact: v.impact
  }));

  return (
    <div className="page-container">
      <h1 className="page-title">Reports & Analytics</h1>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalScans || 0}</div>
          <div className="stat-label">Total Scans</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.completedScans || 0}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.failedScans || 0}</div>
          <div className="stat-label">Failed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.averageAccessibilityScore || 0}</div>
          <div className="stat-label">Avg. Score</div>
        </div>
      </div>

      {/* Scan Status Distribution */}
      {stats && stats.totalScans > 0 && (
        <div className="card">
          <h2 className="card-title">Scan Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={scanStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {scanStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Violations */}
      {topViolations.length > 0 && (
        <div className="card">
          <h2 className="card-title">Top 10 Accessibility Violations</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={violationChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#e74c3c" name="Occurrences" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Violation Details Table */}
      {topViolations.length > 0 && (
        <div className="card">
          <h2 className="card-title">Violation Details</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Violation ID</th>
                <th>Description</th>
                <th>Impact</th>
                <th>Occurrences</th>
              </tr>
            </thead>
            <tbody>
              {topViolations.map((violation, index) => (
                <tr key={index}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    {violation.id}
                  </td>
                  <td>{violation.description}</td>
                  <td>
                    <span className={`violation-impact impact-${violation.impact}`}>
                      {violation.impact}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: '#e74c3c' }}>{violation.count}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {topViolations.length === 0 && stats?.totalScans > 0 && (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
            No violation data available yet. Run some scans with Axe-core to see violation reports.
          </p>
        </div>
      )}

      {stats?.totalScans === 0 && (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#7f8c8d' }}>
            No data available. Start running scans to see analytics.
          </p>
        </div>
      )}
    </div>
  );
}

export default Reports;