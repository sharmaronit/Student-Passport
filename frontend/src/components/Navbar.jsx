import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, LogOut, Wallet, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const { user, isConnected, address, loginWithWallet, logout, isOfflineMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleWalletAuth = async () => {
    if (isConnected && address) {
      try {
        await loginWithWallet(address);
        navigate('/dashboard');
      } catch (err) {
        alert(err.message || 'Verification signature failed');
      }
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-panel" style={{
      margin: '20px auto',
      width: '100%',
      maxWidth: '1200px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      borderRadius: '20px',
      position: 'relative',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <GraduationCap size={32} className="text-primary" style={{ color: '#00f2fe' }} />
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: '1.4rem',
            fontWeight: 700,
            fontFamily: 'var(--font-heading)',
            background: 'linear-gradient(135deg, #00f2fe, #9d4edd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            SkillPassport
          </span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link 
          to="/dashboard" 
          style={{ 
            textDecoration: 'none', 
            color: isActive('/dashboard') ? '#00f2fe' : 'var(--text-secondary)',
            fontWeight: isActive('/dashboard') ? 600 : 500,
            transition: 'var(--transition-smooth)'
          }}
        >
          Dashboard
        </Link>
        
        {user?.role === 'issuer' && (
          <Link 
            to="/issuer" 
            style={{ 
              textDecoration: 'none', 
              color: isActive('/issuer') ? '#9d4edd' : 'var(--text-secondary)',
              fontWeight: isActive('/issuer') ? 600 : 500,
              transition: 'var(--transition-smooth)'
            }}
          >
            Issuer Portal
          </Link>
        )}
        
        <Link 
          to="/verify" 
          style={{ 
            textDecoration: 'none', 
            color: isActive('/verify') ? '#00f2fe' : 'var(--text-secondary)',
            fontWeight: isActive('/verify') ? 600 : 500,
            transition: 'var(--transition-smooth)'
          }}
        >
          Verify Credentials
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {isOfflineMode && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: '#ef4444'
          }}>
            <ShieldAlert size={14} />
            <span>Demo Fallback Mode</span>
          </div>
        )}

        {isConnected ? (
          user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user.full_name.split(' ')[0]}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                  {user.role}
                </div>
              </div>
              <button 
                onClick={logout}
                className="btn-secondary"
                style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={handleWalletAuth}
              className="btn-primary"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Wallet size={16} />
              <span>Verify & Sign In</span>
            </button>
          )
        ) : (
          <w3m-button balance="show" size="sm" label="Connect Wallet" />
        )}
      </div>
    </nav>
  );
}
