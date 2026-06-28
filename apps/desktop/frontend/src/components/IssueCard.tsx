import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Cpu, Wrench, Eye, ShieldAlert } from 'lucide-react';
import type { Issue } from '../services/clientApi';

interface IssueCardProps {
  issue: Issue;
  isSelected: boolean;
  onSelect: () => void;
  onApplyFix: (issueId: string) => void;
  isApplying: boolean;
  onNavigateToFix: () => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  isSelected,
  onSelect,
  onApplyFix,
  isApplying,
  onNavigateToFix,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { title, severity, category, location, status, fix } = issue;

  // Severity color maps
  let severityColor = 'var(--sds-info)';
  let badgeClass = 'sds-badge-info';
  if (severity === 'Critical' || severity === 'High') {
    severityColor = 'var(--sds-danger)';
    badgeClass = 'sds-badge-danger';
  } else if (severity === 'Medium') {
    severityColor = 'var(--sds-warning)';
    badgeClass = 'sds-badge-warning';
  } else if (severity === 'Low') {
    severityColor = 'var(--sds-success)';
    badgeClass = 'sds-badge-success';
  }

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      onClick={onSelect}
      className="sds-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sds-space-12)',
        cursor: 'pointer',
        padding: 'var(--sds-space-16)',
        borderLeft: `4px solid ${isSelected ? 'var(--sds-primary)' : severityColor}`,
        borderColor: isSelected ? 'var(--sds-primary)' : 'var(--sds-border)',
        backgroundColor: isSelected ? 'var(--sds-surface-hover)' : 'var(--sds-surface)',
        transition: 'all var(--sds-transition-fast)',
        position: 'relative',
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--sds-space-12)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-8)' }}>
          <span className={`sds-badge ${badgeClass}`}>{severity}</span>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--sds-text-muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            {category}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-12)' }}>
          <span
            className={`sds-badge ${status === 'Resolved' ? 'sds-badge-success' : 'sds-badge-warning'}`}
          >
            {status}
          </span>
          <button
            onClick={handleToggleExpand}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--sds-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: 'var(--sds-radius-sm)',
            }}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Title */}
      <h3
        style={{ fontSize: '15px', fontWeight: 600, color: 'var(--sds-text-heading)', margin: 0 }}
      >
        {title}
      </h3>

      {/* File & Line Info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sds-space-8)',
          fontSize: '12px',
          color: 'var(--sds-text-muted)',
        }}
      >
        <Cpu size={12} />
        <span style={{ fontFamily: 'var(--sds-font-mono)' }}>
          {location.fileId}:{location.line}
        </span>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div
          style={{
            marginTop: 'var(--sds-space-8)',
            paddingTop: 'var(--sds-space-12)',
            borderTop: '1px solid var(--sds-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sds-space-12)',
          }}
          onClick={(e) => e.stopPropagation()} // Prevent selecting card when interacting inside
        >
          <p style={{ fontSize: '13px', lineHeight: '1.4', color: 'var(--sds-text)' }}>
            {issue.description}
          </p>

          {/* Quick Actions if Autofix is present and issue is open */}
          {fix && status === 'Open' && (
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.15)',
                border: '1px solid var(--sds-border)',
                borderRadius: 'var(--sds-radius-md)',
                padding: 'var(--sds-space-12)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--sds-space-8)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--sds-space-8)',
                  fontSize: '12px',
                  color: 'var(--sds-success)',
                  fontWeight: 500,
                }}
              >
                <ShieldAlert size={14} />
                <span>Autofix Available</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--sds-text-muted)', margin: 0 }}>
                {fix.description}
              </p>
              <div style={{ display: 'flex', gap: 'var(--sds-space-12)', marginTop: '4px' }}>
                <button
                  onClick={onNavigateToFix}
                  className="sds-btn sds-btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  <Eye size={12} />
                  Preview Fix
                </button>
                <button
                  onClick={() => onApplyFix(issue.id)}
                  disabled={isApplying}
                  className="sds-btn sds-btn-primary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  <Wrench size={12} />
                  {isApplying ? 'Applying...' : 'Apply Fix'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
