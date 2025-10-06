import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Dashboard from './pages/Dashboard';
import NewScan from './pages/NewScan';
import ScanDetails from './pages/ScanDetails';
import ScanHistory from './pages/ScanHistory';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-brand">
              🔍 Accessibility Analyzer
            </Link>
            <ul className="nav-menu">
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/new-scan">New Scan</Link></li>
              <li><Link to="/history">History</Link></li>
              <li><Link to="/reports">Reports</Link></li>
            </ul>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-scan" element={<NewScan />} />
            <Route path="/scan/:id" element={<ScanDetails />} />
            <Route path="/history" element={<ScanHistory />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;