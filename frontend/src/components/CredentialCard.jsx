import React from 'react';
import { Trophy, Award, Briefcase, FileCode } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function CredentialCard({ credential, onClick }) {
  const { title, credential_type, status, issued_at, metadata } = credential;

  // Helper to resolve card icon and colored border based on type
  const getTypeConfig = (type) => {
    switch (type?.toLowerCase()) {
      case 'hackathon':
        return {
          icon: <Trophy size={24} style={{ color: '#f59e0b' }} />,
          gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(0,0,0,0) 100%)',
          borderColor: 'rgba(245, 158, 11, 0.2)'
        };
      case 'certification':
        return {
          icon: <Award size={24} style={{ color: '#9d4edd' }} />,
          gradient: 'linear-gradient(135deg, rgba(157, 78, 221, 0.1) 0%, rgba(0,0,0,0) 100%)',
          borderColor: 'rgba(157, 78, 221, 0.2)'
        };
      case 'internship':
        return {
          icon: <Briefcase size={24} style={{ color: '#3b82f6' }} />,
          gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(0,0,0,0) 100%)',
          borderColor: 'rgba(59, 130, 246, 0.2)'
        };
      default: // project
        return {
          icon: <FileCode size={24} style={{ color: '#00f2fe' }} />,
          gradient: 'linear-gradient(135deg, rgba(0, 242, 254, 0.1) 0%, rgba(0,0,0,0) 100%)',
          borderColor: 'rgba(0, 242, 254, 0.2)'
        };
    }
  };

  const config = getTypeConfig(credential_type);
  const formattedDate = issued_at 
    ? new Date(issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Pending Mint';

  const getIssuerDisplay = () => {
    if (credential_type === 'project') return 'Self-Attested Project';
    if (credential_type === 'internship') return metadata?.company || 'Company';
    if (credential_type === 'certification') return metadata?.platform || 'Certification Body';
    if (credential_type === 'hackathon') return metadata?.event_name || 'Organizer';
    return 'Authorized Issuer';
  };

  return (
    <div 
      className="glass-panel" 
      onClick={onClick}
      style={{
        background: `var(--glass-bg)`,
        backgroundImage: config.gradient,
        border: `1px solid ${config.borderColor}`,
        borderRadius: '16px',
        padding: '24px',
        cursor: 'pointer',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '200px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--glass-border)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {config.icon}
          </div>
          <StatusBadge status={status} />
        </div>

        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', lineHeight: 1.3, fontWeight: 600 }}>
          {title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
          {getIssuerDisplay()}
        </p>
      </div>

      {/* Bottom Section */}
      <div style={{
        marginTop: '24px',
        paddingTop: '12px',
        borderTop: '1px solid rgba(255,255,255,0.04)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <span>Issued: {formattedDate}</span>
        <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {credential_type}
        </span>
      </div>
    </div>
  );
}
