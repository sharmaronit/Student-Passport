import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Issuer from './pages/Issuer';
import Verify from './pages/Verify';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px 40px'
        }}>
          <div>
            <Navbar />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/issuer" element={<Issuer />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/verify/:shareToken" element={<Verify />} />
            </Routes>
          </div>
          
          <footer style={{
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginTop: '80px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            paddingTop: '20px'
          }}>
            <p>© 2026 Student Skill Passport Protocol. Built on Polygon Amoy. All rights reserved.</p>
          </footer>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
