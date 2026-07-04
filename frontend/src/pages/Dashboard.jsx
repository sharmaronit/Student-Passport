import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import GitHubWidget from '../components/GitHubWidget';
import CredentialCard from '../components/CredentialCard';
import CredentialModal from '../components/CredentialModal';
import PullCredentialModal from '../components/PullCredentialModal';
import { Mail, GraduationCap, MapPin, ExternalLink, Calendar, Search, Award, RefreshCw, Zap } from 'lucide-react';

export default function Dashboard() {
  const { user, token, isOfflineMode, logout } = useAuth();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedCred, setSelectedCred] = useState(null);
  const [pullOpen, setPullOpen] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user]);

  const fetchCredentials = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/wallet/credentials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCredentials(data.data.credentials || []);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('API error, falling back to mock credentials');
    }

    // Offline mock credentials
    setTimeout(() => {
      const mockCreds = [
        {
          id: '11111111-1111-1111-1111-111111111111',
          token_id: 1,
          tx_hash: '0x1c3a6b7e8d9c0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b',
          ipfs_cid: 'QmPvC8L71nSwpU1M2z7H4T8x9y3D5e7F9G8H1J2K3L4M5N',
          title: '1st Place — Web3 Innovation Track',
          description: 'Awarded for building a decentralized identity protocol using zero-knowledge verification techniques.',
          credential_type: 'hackathon',
          status: 'issued',
          issued_at: '2024-10-18T12:00:00Z',
          content_hash: '3f5e9d8c0b7a6e5f4d3c2b1a0e9f8d7c6b5a4e3f2d1c0b9a8e7f6d5c4b3a2e1f',
          metadata: {
            event_name: 'ETHGlobal Hackathon',
            placement: '1st Place',
            team_name: 'ZKP Pioneers',
            tracks: ['Identity', 'Zero-Knowledge', 'Polygon Track']
          }
        },
        {
          id: '22222222-2222-2222-2222-222222222222',
          token_id: 2,
          tx_hash: '0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b',
          ipfs_cid: 'QmYwAPJzv5CZ1gtVd423YzWx215nSM2gTde9d36b28Y1nS',
          title: 'AWS Certified Solutions Architect',
          description: 'Validation of expertise in designing distributed systems on AWS, incorporating cloud security and high-performance networks.',
          credential_type: 'certification',
          status: 'issued',
          issued_at: '2024-12-05T08:30:00Z',
          content_hash: '8f7e6d5c4b3a2e1f0d9c8b7a6e5f4d3c2b1a0e9f8d7c6b5a4e3f2d1c0b9a8e7f',
          metadata: {
            platform: 'Amazon Web Services',
            cert_id: 'AWS-SAA-8004',
            level: 'associate',
            cert_url: 'https://aws.amazon.com/verification'
          }
        },
        {
          id: '33333333-3333-3333-3333-333333333333',
          token_id: null,
          tx_hash: null,
          ipfs_cid: null,
          title: 'Software Engineer Intern',
          description: 'Internship completed within the Core Platform team, designing microservices in Go and improving PostgreSQL query times.',
          credential_type: 'internship',
          status: 'pending',
          issued_at: null,
          content_hash: 'e5f4d3c2b1a0e9f8d7c6b5a4e3f2d1c0b9a8e7f6d5c4b3a2e1f0d9c8b7a6e5f4',
          metadata: {
            company: 'Stripe',
            role: 'SWE Intern',
            tech_stack: ['Go', 'Ruby', 'PostgreSQL', 'Redis'],
            start_date: '2025-06-01',
            end_date: '2025-08-31'
          }
        },
        {
          id: '44444444-4444-4444-4444-444444444444',
          token_id: 3,
          tx_hash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d',
          ipfs_cid: 'QmZpC8L71nSwpU1M2z7H4T8x9y3D5e7F9G8H1J2K3L4M6P',
          title: 'Soulbound Credential Registry',
          description: 'A decentralized repository allowing institutions to register credentials using soulbound NFT smart contracts.',
          credential_type: 'project',
          status: 'issued',
          issued_at: '2025-01-20T17:15:00Z',
          content_hash: 'd7c6b5a4e3f2d1c0b9a8e7f6d5c4b3a2e1f0d9c8b7a6e5f4d3c2b1a0e9f8d7c6',
          metadata: {
            repo_url: 'https://github.com/octocat/soulbound-registry',
            live_url: 'https://soulbound-passport.dev',
            tech_stack: ['Solidity', 'React', 'Ethers.js', 'Vite']
          }
        }
      ];
      setCredentials(mockCreds);
      setLoading(false);
    }, 400);
  };

  useEffect(() => {
    fetchCredentials();
  }, [user]);

  if (!user) return null;

  // Filters logic
  const filteredCredentials = credentials.filter((cred) => {
    const matchesSearch = cred.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          cred.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || cred.credential_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '40px auto',
      padding: '0 24px',
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      gap: '40px',
      textAlign: 'left'
    }}>
      
      {/* Sidebar: Student Profile Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '30px', textAlign: 'center' }}>
          {/* Mock Avatar */}
          <div style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
            margin: '0 auto 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            fontWeight: 700,
            color: '#fff',
            boxShadow: '0 0 20px rgba(0, 242, 254, 0.3)'
          }}>
            {user.full_name ? user.full_name.charAt(0) : 'S'}
          </div>

          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>{user.full_name}</h3>
          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', marginBottom: '24px', border: '1px solid var(--glass-border)' }}>
            Digital Passport Holder
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{user.email}</span>
            </div>

            {user.university && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GraduationCap size={16} style={{ color: 'var(--text-muted)' }} />
                <span>{user.university}</span>
              </div>
            )}

            {user.graduation_year && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
                <span>Class of {user.graduation_year}</span>
              </div>
            )}

            {user.wallet_address && (
              <div style={{ 
                marginTop: '12px',
                background: 'rgba(0,0,0,0.2)', 
                border: '1px solid var(--glass-border)',
                padding: '10px', 
                borderRadius: '8px', 
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--text-muted)'
              }}>
                <span>{user.wallet_address.slice(0, 6)}...{user.wallet_address.slice(-6)}</span>
                <a 
                  href={`https://amoy.polygonscan.com/address/${user.wallet_address}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#00f2fe' }}
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* GitHub Contribution widget link */}
        <GitHubWidget username={user.github_url} isConnected={!!user.github_url} />
      </div>

      {/* Main Content Area */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Credentials Header Search & Filter */}
        <div className="glass-panel" style={{ padding: '24px 32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
            <h2 style={{ fontSize: '1.6rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award style={{ color: '#00f2fe' }} />
              <span>Verifiable Credentials (SBTs)</span>
            </h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setPullOpen(true)}
                className="btn-primary"
                style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
              >
                <Zap size={14} />
                <span>Pull Credential</span>
              </button>
              <button 
                onClick={fetchCredentials}
                className="btn-secondary"
                style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                style={{ paddingLeft: '44px' }}
                placeholder="Search credential title, details, stacks..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {['all', 'hackathon', 'certification', 'internship', 'project'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  style={{
                    background: filterType === type ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))' : 'rgba(255,255,255,0.03)',
                    border: '1px solid',
                    borderColor: filterType === type ? 'transparent' : 'var(--glass-border)',
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  {type === 'all' ? 'All' : type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
            <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 16px', color: '#00f2fe' }} />
            <p>Scanning Polygon Blockchain for SBT Assets...</p>
          </div>
        ) : filteredCredentials.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {filteredCredentials.map((cred) => (
              <CredentialCard 
                key={cred.id} 
                credential={cred} 
                onClick={() => setSelectedCred(cred)}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '60px' }}>
            <Award size={40} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Credentials Found</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
              We couldn't find any credentials matching your search parameters. Once an institution issues an SBT to your wallet, it will automatically populate here.
            </p>
          </div>
        )}
      </div>

      {/* Detail View Modal */}
      {selectedCred && (
        <CredentialModal 
          credential={selectedCred} 
          onClose={() => setSelectedCred(null)}
        />
      )}

      {/* Pull Verification Modal */}
      <PullCredentialModal 
        isOpen={pullOpen}
        onClose={() => setPullOpen(false)}
        onRefresh={fetchCredentials}
        token={token}
      />
    </div>
  );
}
