import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createScan } from '../services/api';

function NewScan() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    url: '',
    scanType: 'both'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.url) {
      setError('Please enter a URL');
      return;
    }

    // Basic URL validation
    try {
      new URL(formData.url);
    } catch (err) {
      setError('Please enter a valid URL (including http:// or https://)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await createScan(formData);
      const scanId = response.data.scanId;
      
      // Navigate to scan details page
      navigate(`/scan/${scanId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create scan');
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">New Accessibility Scan</h1>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="url" className="form-label">
            Website URL *
          </label>
          <input
            type="text"
            id="url"
            name="url"
            className="form-input"
            placeholder="https://example.com"
            value={formData.url}
            onChange={handleChange}
            disabled={loading}
            required
          />
          <small style={{ color: '#7f8c8d', display: 'block', marginTop: '0.5rem' }}>
            Enter the full URL including http:// or https://
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="scanType" className="form-label">
            Scan Type
          </label>
          <select
            id="scanType"
            name="scanType"
            className="form-select"
            value={formData.scanType}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="both">Both (Lighthouse + Axe-core)</option>
            <option value="lighthouse">Lighthouse Only</option>
            <option value="axe">Axe-core Only</option>
          </select>
          <small style={{ color: '#7f8c8d', display: 'block', marginTop: '0.5rem' }}>
            Lighthouse provides an overall accessibility score. Axe-core identifies specific violations.
          </small>
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Starting Scan...' : 'Start Scan'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 className="card-title">About Accessibility Testing</h3>
        <p style={{ marginBottom: '1rem' }}>
          This tool uses industry-standard accessibility testing tools:
        </p>
        <ul style={{ paddingLeft: '2rem', lineHeight: '1.8' }}>
          <li>
            <strong>Lighthouse:</strong> Google's automated tool that provides an overall 
            accessibility score (0-100) based on various accessibility checks.
          </li>
          <li>
            <strong>Axe-core:</strong> Deque's accessibility testing engine that identifies 
            specific WCAG violations and provides detailed information about each issue.
          </li>
        </ul>
        <p style={{ marginTop: '1rem', color: '#7f8c8d' }}>
          Note: Automated testing can only catch about 30-40% of accessibility issues. 
          Manual testing is still essential for comprehensive accessibility compliance.
        </p>
      </div>
    </div>
  );
}

export default NewScan;