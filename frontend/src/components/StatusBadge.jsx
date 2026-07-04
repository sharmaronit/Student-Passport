import React from 'react';
import { CheckCircle, Clock, AlertOctagon, Calendar } from 'lucide-react';

export default function StatusBadge({ status }) {
  switch (status?.toLowerCase()) {
    case 'issued':
      return (
        <span className="badge badge-success">
          <CheckCircle size={12} />
          <span>Issued</span>
        </span>
      );
    case 'pending':
      return (
        <span className="badge badge-pending">
          <Clock size={12} />
          <span>Pending Mint</span>
        </span>
      );
    case 'revoked':
      return (
        <span className="badge badge-danger">
          <AlertOctagon size={12} />
          <span>Revoked</span>
        </span>
      );
    default:
      return (
        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}>
          <Calendar size={12} />
          <span>{status || 'Unknown'}</span>
        </span>
      );
  }
}
