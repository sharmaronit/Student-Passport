import React, { useState } from 'react';
import { X, Award, GitBranch, Shield, Zap, RefreshCw, CheckCircle, ExternalLink } from 'lucide-react';

export default function PullCredentialModal({ isOpen, onClose, onRefresh, token }) {
  const [type, setType] = useState('project');
  
  // Input fields state
  const [githubUser, setGithubUser] = useState('');
  const [repoOwner, setRepoOwner] = useState('');
  const [repoName, setRepoName] = useState('');
  const [certID, setCertID] = useState('');
  const [platform, setPlatform] = useState('credly');
  const [devfolioUser, setDevfolioUser] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [managerEmail, setManagerEmail] = useState('');

  // Wizard state
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [step, setStep] = useState(0); // 0: input, 1: verifying, 2: minting, 3: completed
  const [errorMsg, setErrorMsg] = useState('');
  const [resultCred, setResultCred] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setStep(1);
    setErrorMsg('');

    // Prepare parameters based on type
    const pullParameters = {};
    if (type === 'project') {
      pullParameters.github_username = githubUser;
      pullParameters.repository_owner = repoOwner;
      pullParameters.repository_name = repoName;
    } else if (type === 'certification') {
      pullParameters.cert_id = certID;
      pullParameters.platform = platform;
    } else if (type === 'hackathon') {
      pullParameters.devfolio_username = devfolioUser;
      pullParameters.event_slug = eventSlug;
    } else if (type === 'internship') {
      pullParameters.company = company;
      pullParameters.role = role;
      pullParameters.manager_email = managerEmail;
    }

    try {
      // Step 1: Pull & Verify
      const response = await fetch('/api/v1/credentials/pull', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          credential_type: type,
          pull_parameters: pullParameters
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to verify achievement details');
      }

      const credentialData = await response.json();
      
      // Step 2: Minting completed on-chain
      setStep(2);
      
      // Wait for a brief cosmetic transition to simulate ledger write confirmation
      setTimeout(() => {
        setResultCred(credentialData.data);
        setStatus('success');
        setStep(3);
        if (onRefresh) onRefresh();
      }, 1500);

    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Verification failed. Please check inputs.');
      setStatus('error');
      setStep(0);
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setStep(0);
    setResultCred(null);
    setErrorMsg('');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '560px',
        width: '100%',
        padding: '32px',
        position: 'relative',
        animation: 'fadeIn 0.3s ease-out'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '24px',
            top: '24px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={20} />
        </button>

        {status === 'idle' && (
          <>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award style={{ color: '#00f2fe' }} />
              <span>Digilocker Pull Desk</span>
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Select a verification provider and input credentials to pull achievement proof directly to your student wallet.
            </p>

            <form onSubmit={handleSubmit}>
              {/* Provider Selection */}
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                Select Achievement Type
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
                marginBottom: '20px'
              }}>
                {[
                  { id: 'project', label: 'GitHub' },
                  { id: 'certification', label: 'Certificate' },
                  { id: 'hackathon', label: 'Hackathon' },
                  { id: 'internship', label: 'Internship' }
                ].map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => { setType(p.id); resetForm(); }}
                    style={{
                      background: type === p.id ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255,255,255,0.02)',
                      border: '1px solid',
                      borderColor: type === p.id ? 'var(--accent-cyan)' : 'var(--glass-border)',
                      borderRadius: '8px',
                      color: type === p.id ? 'var(--accent-cyan)' : '#fff',
                      padding: '10px 4px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Form Fields */}
              {type === 'project' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div>
                    <label className="form-label">GitHub Username</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. sharmaronit"
                      value={githubUser}
                      onChange={(e) => setGithubUser(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label">Repository Owner</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. facebook"
                        value={repoOwner}
                        onChange={(e) => setRepoOwner(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Repository Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. react"
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {type === 'certification' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div>
                    <label className="form-label">Certification Platform</label>
                    <select 
                      className="form-control"
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      style={{ background: '#0e1118', color: '#fff' }}
                    >
                      <option value="credly">Credly</option>
                      <option value="coursera">Coursera</option>
                      <option value="udemy">Udemy</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Certificate Verification ID</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. AWS-SAA-8004"
                      value={certID}
                      onChange={(e) => setCertID(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {type === 'hackathon' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div>
                    <label className="form-label">Devfolio Username</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. hacker101"
                      value={devfolioUser}
                      onChange={(e) => setDevfolioUser(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label">Hackathon Event Slug</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. ethglobal-bangkok"
                      value={eventSlug}
                      onChange={(e) => setEventSlug(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {type === 'internship' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="form-label">Company Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. Stripe"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Role Title</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. SWE Intern"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Manager's Corporate Email</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="manager@company.com"
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} />
                <span>Pull & Verify Achievement</span>
              </button>
            </form>
          </>
        )}

        {/* Loading Wizard View */}
        {status === 'loading' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <RefreshCw size={40} className="animate-spin" style={{ color: 'var(--accent-cyan)', marginBottom: '24px' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '300px', margin: '0 auto', textAlign: 'left' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: step >= 1 ? 1 : 0.4 }}>
                <GitBranch size={16} style={{ color: step >= 2 ? '#00e676' : 'var(--accent-cyan)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>1. Querying External APIs...</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: step >= 2 ? 1 : 0.4 }}>
                <Shield size={16} style={{ color: step >= 3 ? '#00e676' : 'var(--accent-cyan)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>2. Validating Proof of Work...</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', opacity: step >= 2 ? 1 : 0.4 }}>
                <Zap size={16} style={{ color: 'var(--accent-cyan)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>3. Minting Soulbound Token...</span>
              </div>
            </div>
          </div>
        )}

        {/* Success View */}
        {status === 'success' && resultCred && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle size={48} style={{ color: '#00e676', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px' }}>Credential Issued!</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '24px' }}>
              Your achievement has been verified and registered on the blockchain.
            </p>

            <div style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'left',
              marginBottom: '24px',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Token ID:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>#{resultCred.token_id || 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Transaction:</span>
                <a 
                  href={`https://amoy.polygonscan.com/tx/${resultCred.tx_hash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace' }}
                >
                  {resultCred.tx_hash ? `${resultCred.tx_hash.slice(0, 8)}...${resultCred.tx_hash.slice(-8)}` : '0x...'}
                  <ExternalLink size={12} />
                </a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>IPFS CID:</span>
                <a 
                  href={`https://gateway.pinata.cloud/ipfs/${resultCred.ipfs_cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace' }}
                >
                  {resultCred.ipfs_cid ? `${resultCred.ipfs_cid.slice(0, 8)}...${resultCred.ipfs_cid.slice(-8)}` : 'Qm...'}
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <button onClick={onClose} className="btn-primary" style={{ width: '100%' }}>
              Return to Dashboard
            </button>
          </div>
        )}

        {/* Error View */}
        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 23, 68, 0.1)',
              border: '1px solid #ff1744',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#ff1744',
              fontSize: '1.5rem',
              fontWeight: 700
            }}>
              !
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '6px' }}>Verification Failed</h3>
            <p style={{ color: '#ff1744', fontSize: '0.85rem', marginBottom: '24px' }}>
              {errorMsg}
            </p>

            <button onClick={resetForm} className="btn-secondary" style={{ width: '100%' }}>
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
