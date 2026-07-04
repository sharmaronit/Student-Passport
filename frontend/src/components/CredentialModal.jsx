import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, ShieldCheck, Database, FileKey, Share2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function CredentialModal({ credential, onClose }) {
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  
  if (!credential) return null;

  const {
    id,
    token_id,
    tx_hash,
    ipfs_cid,
    title,
    description,
    credential_type,
    status,
    issued_at,
    metadata,
    content_hash
  } = credential;

  const copyToClipboard = (text, setFn) => {
    navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  };

  const getShareLink = () => {
    return `${window.location.origin}/verify/${id}`;
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(3, 2, 6, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '32px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <StatusBadge status={status} />
          <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {credential_type}
          </span>
        </div>

        <h2 style={{ fontSize: '1.8rem', marginBottom: '12px', textAlign: 'left', lineHeight: 1.2 }}>
          {title}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', textAlign: 'left' }}>
          {description}
        </p>

        {/* Metadata Details depending on Type */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
            Credential Metadata
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.85rem' }}>
            {credential_type === 'hackathon' && (
              <>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Event:</span>
                  <div style={{ fontWeight: 500 }}>{metadata?.event_name}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Placement:</span>
                  <div style={{ fontWeight: 600, color: '#f59e0b' }}>{metadata?.placement || 'Participant'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Team Name:</span>
                  <div style={{ fontWeight: 500 }}>{metadata?.team_name || 'Individual'}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Tracks:</span>
                  <div style={{ fontWeight: 500 }}>{metadata?.tracks?.join(', ') || 'General'}</div>
                </div>
              </>
            )}

            {credential_type === 'certification' && (
              <>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Platform / Issuer:</span>
                  <div style={{ fontWeight: 600, color: '#9d4edd' }}>{metadata?.platform}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Certificate ID:</span>
                  <div style={{ fontWeight: 500 }}>{metadata?.cert_id}</div>
                </div>
                {metadata?.level && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Level:</span>
                    <div style={{ fontWeight: 500, textTransform: 'capitalize' }}>{metadata?.level}</div>
                  </div>
                )}
                {metadata?.cert_url && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Official Link:</span>
                    <div>
                      <a href={metadata.cert_url} target="_blank" rel="noopener noreferrer" style={{ color: '#00f2fe', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>Verify Platform</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
              </>
            )}

            {credential_type === 'internship' && (
              <>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Company:</span>
                  <div style={{ fontWeight: 600, color: '#3b82f6' }}>{metadata?.company}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Role:</span>
                  <div style={{ fontWeight: 500 }}>{metadata?.role}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Tech Stack:</span>
                  <div style={{ fontWeight: 500 }}>{metadata?.tech_stack?.join(', ')}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
                  <div style={{ fontWeight: 500 }}>
                    {metadata?.start_date} - {metadata?.end_date || 'Present'}
                  </div>
                </div>
              </>
            )}

            {credential_type === 'project' && (
              <>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>GitHub Repository:</span>
                  <div>
                    <a href={metadata?.repo_url} target="_blank" rel="noopener noreferrer" style={{ color: '#00f2fe', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span>View Code</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
                {metadata?.live_url && (
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Live App:</span>
                    <div>
                      <a href={metadata.live_url} target="_blank" rel="noopener noreferrer" style={{ color: '#00f2fe', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>Visit App</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>
                )}
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Tech Stack:</span>
                  <div style={{ fontWeight: 500 }}>{metadata?.tech_stack?.join(', ')}</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Cryptographic Proof Section */}
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={18} style={{ color: '#00f2fe' }} />
            <span>Cryptographic Verification Proof</span>
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Database size={12} /> SBT Token ID:
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>{token_id || 'Generating on-chain...'}</span>
            </div>

            {tx_hash && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tx Hash:</span>
                <a 
                  href={`https://amoy.polygonscan.com/tx/${tx_hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>{tx_hash.slice(0, 10)}...{tx_hash.slice(-8)}</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            {ipfs_cid && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>IPFS CID:</span>
                <a 
                  href={`https://gateway.pinata.cloud/ipfs/${ipfs_cid}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>{ipfs_cid.slice(0, 12)}...</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            )}

            {content_hash && (
              <div>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FileKey size={12} /> Content SHA-256 Digest:
                </div>
                <div style={{ 
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  wordBreak: 'break-all',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.75rem'
                }}>
                  <span>{content_hash}</span>
                  <button 
                    onClick={() => copyToClipboard(content_hash, setCopied)}
                    style={{ background: 'none', border: 'none', color: '#00f2fe', cursor: 'pointer', marginLeft: '10px' }}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buttons / Actions */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            className="btn-primary" 
            onClick={() => copyToClipboard(getShareLink(), setShareCopied)}
            style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            <Share2 size={18} />
            <span>{shareCopied ? 'Link Copied!' : 'Copy Recruiter Link'}</span>
          </button>
          
          <button 
            className="btn-secondary" 
            onClick={onClose}
            style={{ padding: '12px 24px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
