import React from 'react';
import { ApplicationStatus } from '../../types';

interface StatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
  showDot?: boolean;
  label?: string;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  applied: {
    label: 'Applied',
    bg: '#f1f5f9',
    text: '#475569',
    border: '#cbd5e1',
    dot: '#64748b',
  },
  confirmed: {
    label: 'Confirmed',
    bg: '#f0f9ff',
    text: '#0284c7',
    border: '#bae6fd',
    dot: '#0ea5e9',
  },
  proof_submitted: {
    label: 'Proof Submitted',
    bg: '#fffbeb',
    text: '#b45309',
    border: '#fde68a',
    dot: '#f59e0b',
  },
  verified: {
    label: 'Verified',
    bg: '#ecfdf5',
    text: '#059669',
    border: '#a7f3d0',
    dot: '#10b981',
  },
  hours_reflected: {
    label: 'Hours Reflected',
    bg: '#f0fdf4',
    text: '#15803d',
    border: '#bbf7d0',
    dot: '#16a34a',
  },
  rejected: {
    label: 'Rejected',
    bg: '#fef2f2',
    text: '#7f1d1d',
    border: '#fecaca',
    dot: '#7f1d1d',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  showDot = true,
  label,
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.applied;
  const displayLabel = label || config.label;

  return (
    <span
      className={`status-badge status-badge--${status} ${className}`}
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: config.border,
      }}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: config.dot }}
          aria-hidden="true"
        />
      )}
      <span>{displayLabel}</span>
    </span>
  );
};
