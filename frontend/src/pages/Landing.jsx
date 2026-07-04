import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ShieldCheck, Briefcase, Award, ArrowRight, UserPlus, LogIn } from 'lucide-react';

const GithubIcon = ({ size = 20, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);


export default function Landing() {
  const { user, isConnected, address, loginWithWallet, register } = useAuth();
  const navigate = useNavigate();

  const [registering, setRegistering] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: 'student',
    university: '',
    graduationYear: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    orgName: '',
    orgType: 'university',
    orgWebsite: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'issuer') {
        navigate('/issuer');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWalletSignIn = async () => {
    if (isConnected && address) {
      try {
        setError('');
        await loginWithWallet(address);
      } catch (err) {
        setError(err.message || 'Signature request failed.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Construct request DTO matching Go struct
    const payload = {
      wallet_address: address?.toLowerCase() || '',
      role: formData.role,
      full_name: formData.fullName,
      email: formData.email,
      university: formData.role === 'student' ? formData.university : '',
      graduation_year: formData.role === 'student' ? parseInt(formData.graduationYear) || 0 : 0,
      github_url: formData.role === 'student' ? formData.githubUrl : '',
      linkedin_url: formData.role === 'student' ? formData.linkedinUrl : '',
      portfolio_url: formData.role === 'student' ? formData.portfolioUrl : '',
      org_name: formData.role === 'issuer' ? formData.orgName : '',
      org_type: formData.role === 'issuer' ? formData.orgType : '',
      org_website: formData.role === 'issuer' ? formData.orgWebsite : ''
    };

    try {
      await register(payload);
      setSuccess(true);
      setTimeout(() => {
        // Authenticate immediately after registration
        handleWalletSignIn();
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '60px auto',
      padding: '0 24px',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '64px',
      alignItems: 'center',
      textAlign: 'left'
    }}>
      {/* Left Column: Product vision */}
      <div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0, 242, 254, 0.08)',
          border: '1px solid rgba(0, 242, 254, 0.2)',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--accent-cyan)',
          marginBottom: '24px'
        }}>
          <ShieldCheck size={14} />
          <span>Web3 Verifiable Credentials Standard</span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '3.6rem',
          fontWeight: 700,
          lineHeight: 1.15,
          marginBottom: '20px',
          letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #fff 40%, var(--text-secondary))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Your Verified Skills.<br />
          On-Chain.<br />
          <span style={{ background: 'linear-gradient(135deg, #00f2fe, #9d4edd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Permanent.
          </span>
        </h1>

        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '1.15rem',
          marginBottom: '40px',
          maxWidth: '480px',
          lineHeight: 1.5
        }}>
          Replace easily-faked resumes with non-transferable Soulbound Tokens issued directly by institutions to your digital passport.
        </p>

        {/* Mini Features List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(157, 78, 221, 0.1)', padding: '8px', borderRadius: '10px', color: '#9d4edd' }}>
              <Award size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Soulbound Tokens (SBTs)</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Credentials are cryptographically locked to your wallet, making them non-transferable.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(0, 242, 254, 0.1)', padding: '8px', borderRadius: '10px', color: '#00f2fe' }}>
              <GithubIcon size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>GitHub Contributions</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Direct integration validates your open-source repositories and green activities calendar.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '10px', color: '#3b82f6' }}>
              <Briefcase size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>Trustless Recruiter Check</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Generate single share links allowing recruiters to confirm details on-chain in one click.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Connect & Authentication Cards */}
      <div className="glass-panel" style={{ padding: '40px', borderRadius: '24px' }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', fontWeight: 600 }}>
          {registering ? 'Create Digital Passport' : 'Access Passport'}
        </h3>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '12px 16px',
            borderRadius: '10px',
            color: '#ef4444',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            padding: '12px 16px',
            borderRadius: '10px',
            color: '#10b981',
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            Registration successful! Signing in...
          </div>
        )}

        {!registering ? (
          /* Login View */
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '32px' }}>
              Connect your Web3 crypto wallet to sign the cryptographical challenge and retrieve your profile.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {isConnected ? (
                <button onClick={handleWalletSignIn} className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <LogIn size={18} />
                  <span>Verify and Sign In</span>
                </button>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <w3m-button balance="show" size="md" label="Connect Wallet" />
                </div>
              )}

              <button 
                onClick={() => setRegistering(true)} 
                className="btn-secondary" 
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <UserPlus size={18} />
                <span>Create New Passport Account</span>
              </button>
            </div>
          </div>
        ) : (
          /* Register View */
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Are you registering as a Student or Issuer?</label>
              <select className="form-control" name="role" value={formData.role} onChange={handleChange}>
                <option value="student">Student (Holder)</option>
                <option value="issuer">Organization / University (Issuer)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Full Name / Administrator Name</label>
              <input 
                type="text" 
                className="form-control" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange} 
                placeholder="Alex Developer" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Email Address</label>
              <input 
                type="email" 
                className="form-control" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="alex@gmail.com" 
                required 
              />
            </div>

            {/* Student Specific Fields */}
            {formData.role === 'student' && (
              <>
                <div className="form-group">
                  <label className="form-label">University / School</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="university" 
                    value={formData.university} 
                    onChange={handleChange} 
                    placeholder="Massachusetts Institute of Technology" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Graduation Year</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    name="graduationYear" 
                    value={formData.graduationYear} 
                    onChange={handleChange} 
                    placeholder="2026" 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GitHub Username</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="githubUrl" 
                    value={formData.githubUrl} 
                    onChange={handleChange} 
                    placeholder="octocat" 
                  />
                </div>
              </>
            )}

            {/* Issuer Specific Fields */}
            {formData.role === 'issuer' && (
              <>
                <div className="form-group">
                  <label className="form-label">Organization Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    name="orgName" 
                    value={formData.orgName} 
                    onChange={handleChange} 
                    placeholder="MIT Department of Computer Science" 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Organization Type</label>
                  <select className="form-control" name="orgType" value={formData.orgType} onChange={handleChange}>
                    <option value="university">University / College</option>
                    <option value="company">Corporate Enterprise</option>
                    <option value="hackathon_org">Hackathon Organizer</option>
                    <option value="cert_platform">Certification Platform</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Organization Website</label>
                  <input 
                    type="url" 
                    className="form-control" 
                    name="orgWebsite" 
                    value={formData.orgWebsite} 
                    onChange={handleChange} 
                    placeholder="https://cs.mit.edu" 
                  />
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                <span>Create Profile</span>
                <ArrowRight size={16} />
              </button>
              <button 
                type="button" 
                onClick={() => setRegistering(false)} 
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>

            {!isConnected && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '16px', textAlign: 'center' }}>
                Note: You must connect your wallet to submit registration.
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
