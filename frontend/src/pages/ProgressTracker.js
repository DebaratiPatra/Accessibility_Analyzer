import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';
import { getAllScans, getProgressTimeline } from '../services/api';

function ProgressTracker() {
  const [allUrls, setAllUrls] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const fetchTimeline = useCallback(async (url) => {
    if (!url) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await getProgressTimeline(url);
      const timelineData = response.data.timeline;
      
      setTimeline(timelineData);
      
      if (timelineData.length > 0) {
        const scores = timelineData.map(d => d.score);
        const issues = timelineData.map(d => d.totalIssues);
        
        const firstScore = scores[0];
        const lastScore = scores[scores.length - 1];
        const improvement = lastScore - firstScore;
        const improvementPercent = firstScore > 0 ? ((improvement / firstScore) * 100).toFixed(1) : 0;
        
        const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
        
        setStats({
          totalScans: timelineData.length,
          firstScore,
          lastScore,
          improvement,
          improvementPercent,
          avgScore,
          firstIssues: issues[0],
          lastIssues: issues[issues.length - 1],
          issuesReduced: issues[0] - issues[issues.length - 1]
        });
      }
      
    } catch (err) {
      console.error('Error fetching timeline:', err);
      setError('Failed to load timeline data');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllUrls = useCallback(async () => {
    try {
      const response = await getAllScans({ page: 1, limit: 100 });
      const scans = response.data.scans;
      
      const uniqueUrls = [...new Set(scans.map(scan => scan.url))];
      setAllUrls(uniqueUrls);
      
      if (uniqueUrls.length > 0) {
        setSelectedUrl(uniqueUrls[0]);
        fetchTimeline(uniqueUrls[0]);
      }
    } catch (err) {
      console.error('Error fetching URLs:', err);
      setError('Failed to load URLs');
    }
  }, [fetchTimeline]);

  useEffect(() => {
    fetchAllUrls();
  }, [fetchAllUrls]);

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setSelectedUrl(url);
    fetchTimeline(url);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <BarChart3 size={40} color="#3498db" />
        <h1 className="page-title" style={{ marginBottom: 0 }}>Accessibility Progress Tracker</h1>
      </div>

      <div className="card">
        <h3 className="card-title">Select Website to Track</h3>
        <div className="form-group">
          <label htmlFor="url-select" className="form-label">Choose URL:</label>
          <select
            id="url-select"
            className="form-select"
            value={selectedUrl}
            onChange={handleUrlChange}
            disabled={allUrls.length === 0}
          >
            {allUrls.length === 0 && <option>No scans available</option>}
            {allUrls.map((url, index) => (
              <option key={index} value={url}>{url}</option>
            ))}
          </select>
          <small style={{ color: '#7f8c8d', display: 'block', marginTop: '0.5rem' }}>
            {allUrls.length} website(s) available for tracking
          </small>
        </div>
      </div>

      {loading && <div className="loading">Loading timeline data...</div>}
      {error && <div className="error">{error}</div>}

      {stats && !loading && (
        <div className="stats-grid">
          <div className="stat-card" style={{ backgroundColor: '#e3f2fd' }}>
            <Calendar size={28} color="#3498db" style={{ marginBottom: '0.5rem' }} />
            <div className="stat-value" style={{ color: '#3498db' }}>{stats.totalScans}</div>
            <div className="stat-label">Total Scans</div>
          </div>

          <div className="stat-card" style={{ 
            backgroundColor: stats.improvement >= 0 ? '#e8f5e9' : '#ffebee'
          }}>
            {stats.improvement >= 0 ? 
              <TrendingUp size={28} color="#2ecc71" style={{ marginBottom: '0.5rem' }} /> :
              <TrendingDown size={28} color="#e74c3c" style={{ marginBottom: '0.5rem' }} />
            }
            <div className="stat-value" style={{ 
              color: stats.improvement >= 0 ? '#2ecc71' : '#e74c3c' 
            }}>
              {stats.improvement > 0 ? '+' : ''}{stats.improvement.toFixed(1)}
            </div>
            <div className="stat-label">Score Change</div>
          </div>

          <div className="stat-card" style={{ backgroundColor: '#fff3e0' }}>
            <div className="stat-value" style={{ color: '#f39c12' }}>{stats.avgScore}</div>
            <div className="stat-label">Average Score</div>
          </div>

          <div className="stat-card" style={{ backgroundColor: '#fce4ec' }}>
            <div className="stat-value" style={{ color: '#e91e63' }}>
              {stats.issuesReduced > 0 ? '-' : '+'}{Math.abs(stats.issuesReduced)}
            </div>
            <div className="stat-label">Issues Change</div>
          </div>
        </div>
      )}

      {stats && !loading && (
        <div className="card" style={{ 
          backgroundColor: stats.improvement >= 0 ? '#e8f5e9' : '#ffebee',
          borderLeft: `4px solid ${stats.improvement >= 0 ? '#2ecc71' : '#e74c3c'}`
        }}>
          <h3 className="card-title" style={{ 
            color: stats.improvement >= 0 ? '#155724' : '#721c24' 
          }}>
            📊 Progress Summary
          </h3>
          <div style={{ fontSize: '1.1rem', lineHeight: '2' }}>
            <p>
              <strong>First Scan:</strong> Score {stats.firstScore.toFixed(0)} with {stats.firstIssues} issues
            </p>
            <p>
              <strong>Latest Scan:</strong> Score {stats.lastScore.toFixed(0)} with {stats.lastIssues} issues
            </p>
            <p style={{ 
              fontSize: '1.3rem', 
              fontWeight: 'bold',
              color: stats.improvement >= 0 ? '#155724' : '#721c24'
            }}>
              {stats.improvement >= 0 ? '✅ Improvement: ' : '⚠️ Regression: '}
              {stats.improvementPercent > 0 ? '+' : ''}{stats.improvementPercent}%
            </p>
          </div>
        </div>
      )}

      {timeline.length > 0 && !loading && (
        <div className="card">
          <h2 className="card-title">📈 Accessibility Score Timeline</h2>
          <p style={{ color: '#7f8c8d', marginBottom: '1rem' }}>
            Track how your accessibility score has improved over time
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2ecc71" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#2ecc71" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                style={{ fontSize: '0.85rem' }}
              />
              <YAxis 
                domain={[0, 100]}
                label={{ value: 'Score', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={formatDate}
                formatter={(value) => [value.toFixed(1), 'Score']}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#2ecc71" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorScore)"
                name="Accessibility Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {timeline.length > 0 && !loading && (
        <div className="card">
          <h2 className="card-title">🐛 Issues Count Timeline</h2>
          <p style={{ color: '#7f8c8d', marginBottom: '1rem' }}>
            Track the number of accessibility issues over time
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={timeline} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                style={{ fontSize: '0.85rem' }}
              />
              <YAxis 
                label={{ value: 'Issues Count', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                labelFormatter={formatDate}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalIssues" 
                stroke="#e74c3c" 
                strokeWidth={3}
                name="Total Issues"
                dot={{ fill: '#e74c3c', r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="criticalIssues" 
                stroke="#c0392b" 
                strokeWidth={2}
                name="Critical Issues"
                dot={{ fill: '#c0392b', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {timeline.length > 0 && !loading && (
        <div className="card">
          <h2 className="card-title">📅 Detailed Scan History</h2>
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Score</th>
                <th>Total Issues</th>
                <th>Critical Issues</th>
                <th>Change from Previous</th>
              </tr>
            </thead>
            <tbody>
              {timeline.map((scan, index) => {
                const prevScan = index > 0 ? timeline[index - 1] : null;
                const scoreChange = prevScan ? scan.score - prevScan.score : 0;
                const issueChange = prevScan ? scan.totalIssues - prevScan.totalIssues : 0;
                
                return (
                  <tr key={index}>
                    <td>{timeline.length - index}</td>
                    <td>{formatDate(scan.date)}</td>
                    <td>
                      <span className={`score-badge ${
                        scan.score >= 90 ? 'score-excellent' :
                        scan.score >= 50 ? 'score-good' : 'score-poor'
                      }`}>
                        {scan.score.toFixed(0)}
                      </span>
                    </td>
                    <td>{scan.totalIssues}</td>
                    <td>
                      <span style={{ 
                        color: scan.criticalIssues > 0 ? '#e74c3c' : '#2ecc71',
                        fontWeight: 'bold'
                      }}>
                        {scan.criticalIssues}
                      </span>
                    </td>
                    <td>
                      {prevScan ? (
                        <div>
                          <span style={{ 
                            color: scoreChange >= 0 ? '#2ecc71' : '#e74c3c',
                            fontWeight: 'bold'
                          }}>
                            Score: {scoreChange > 0 ? '+' : ''}{scoreChange.toFixed(1)}
                          </span>
                          <br />
                          <span style={{ 
                            color: issueChange <= 0 ? '#2ecc71' : '#e74c3c',
                            fontSize: '0.9rem'
                          }}>
                            Issues: {issueChange > 0 ? '+' : ''}{issueChange}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: '#7f8c8d' }}>First scan</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {timeline.length === 0 && !loading && !error && selectedUrl && (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
            No scan history available for this URL yet. Run multiple scans to see progress tracking!
          </p>
        </div>
      )}

      {allUrls.length === 0 && !loading && (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '2rem' }}>
            No scans available yet. Create your first scan to start tracking progress!
          </p>
        </div>
      )}
    </div>
  );
}

export default ProgressTracker;