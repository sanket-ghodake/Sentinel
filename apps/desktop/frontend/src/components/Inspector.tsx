import React from 'react';
import { ShieldAlert, Cpu, Wrench, Eye, Info, Clock, AlertTriangle } from 'lucide-react';
import type { Issue } from '../services/clientApi';

interface InspectorProps {
  selectedIssue: Issue | null;
  onApplyFix: (issueId: string) => void;
  isApplying: boolean;
  onNavigateToFix: () => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  selectedIssue,
  onApplyFix,
  isApplying,
  onNavigateToFix,
}) => {
  if (!selectedIssue) {
    return (
      <aside
        style={{
          backgroundColor: 'var(--sds-surface)',
          borderLeft: '1px solid var(--sds-border)',
          padding: 'var(--sds-space-32) var(--sds-space-24)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          height: '100%',
          color: 'var(--sds-text-muted)',
        }}
      >
        <Info size={32} style={{ marginBottom: 'var(--sds-space-16)', opacity: 0.5 }} />
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: 'var(--sds-text-heading)',
            marginBottom: 'var(--sds-space-8)',
          }}
        >
          No Context Selected
        </h3>
        <p style={{ fontSize: '13px', lineHeight: '1.4' }}>
          Select an issue, recommendation, or file node to view detailed diagnostics here.
        </p>
      </aside>
    );
  }

  const { title, description, severity, category, analyzerId, location, impact, fix, status } =
    selectedIssue;

  // Determine severity badges
  let badgeClass = 'sds-badge-info';
  if (severity === 'Critical' || severity === 'High') badgeClass = 'sds-badge-danger';
  else if (severity === 'Medium') badgeClass = 'sds-badge-warning';
  else if (severity === 'Low') badgeClass = 'sds-badge-success';

  return (
    <aside
      style={{
        backgroundColor: 'var(--sds-surface)',
        borderLeft: '1px solid var(--sds-border)',
        padding: 'var(--sds-space-24)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        gap: 'var(--sds-space-24)',
      }}
    >
      {/* Title & Status */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 'var(--sds-space-12)',
          }}
        >
          <span className={`sds-badge ${badgeClass}`}>{severity}</span>
          <span
            className={`sds-badge ${status === 'Resolved' ? 'sds-badge-success' : 'sds-badge-warning'}`}
          >
            {status}
          </span>
        </div>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--sds-text-heading)',
            lineHeight: '1.4',
            marginBottom: 'var(--sds-space-8)',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: '12px',
            color: 'var(--sds-text-muted)',
            fontFamily: 'var(--sds-font-mono)',
          }}
        >
          ID: {selectedIssue.id}
        </p>
      </div>

      {/* Location Card */}
      <div
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--sds-border)',
          borderRadius: 'var(--sds-radius-md)',
          padding: 'var(--sds-space-12) var(--sds-space-16)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sds-space-8)',
            marginBottom: '4px',
            fontSize: '11px',
            color: 'var(--sds-text-muted)',
          }}
        >
          <Cpu size={12} />
          <span>FILE LOCATION</span>
        </div>
        <div
          style={{
            fontFamily: 'var(--sds-font-mono)',
            fontSize: '13px',
            color: 'var(--sds-text-heading)',
            wordBreak: 'break-all',
          }}
        >
          {location.fileId}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--sds-text-muted)', marginTop: '4px' }}>
          Line {location.line}, Column {location.column}
        </div>
      </div>

      {/* Description */}
      <div>
        <h4
          style={{
            fontSize: '12px',
            color: 'var(--sds-text-muted)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: 'var(--sds-space-8)',
          }}
        >
          Diagnostic Detail
        </h4>
        <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--sds-text)' }}>
          {description}
        </p>
      </div>

      {/* Impact */}
      {impact && (
        <div>
          <h4
            style={{
              fontSize: '12px',
              color: 'var(--sds-text-muted)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: 'var(--sds-space-8)',
            }}
          >
            System Impact
          </h4>
          <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--sds-text)' }}>{impact}</p>
        </div>
      )}

      {/* Rule Metadata */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--sds-space-12)',
          borderTop: '1px solid var(--sds-border)',
          paddingTop: 'var(--sds-space-16)',
        }}
      >
        <div>
          <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>Analyzer</span>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--sds-text-heading)',
              marginTop: '2px',
            }}
          >
            {analyzerId}
          </div>
        </div>
        <div>
          <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>Category</span>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--sds-text-heading)',
              marginTop: '2px',
            }}
          >
            {category}
          </div>
        </div>
      </div>

      {/* Quick Actions / Fixes */}
      {fix && status === 'Open' && (
        <div
          style={{
            marginTop: 'auto',
            borderTop: '1px solid var(--sds-border)',
            paddingTop: 'var(--sds-space-24)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--sds-space-12)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sds-space-8)',
              fontSize: '12px',
              color: 'var(--sds-success)',
            }}
          >
            <ShieldAlert size={14} />
            <span>Autofix Available</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--sds-text-muted)', lineHeight: '1.4' }}>
            {fix.description}
          </p>
          {fix.actions[0] && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--sds-space-12)',
                fontSize: '12px',
                color: 'var(--sds-text-muted)',
              }}
            >
              <Clock size={12} />
              <span>Est. time: ~{fix.actions[0].estimatedTime}m</span>
              <AlertTriangle size={12} />
              <span>Risk: {fix.actions[0].risk}</span>
            </div>
          )}
          <div
            style={{ display: 'flex', gap: 'var(--sds-space-12)', marginTop: 'var(--sds-space-8)' }}
          >
            <button
              onClick={onNavigateToFix}
              className="sds-btn sds-btn-secondary"
              style={{ flex: 1, fontSize: '13px', padding: '10px 0' }}
            >
              <Eye size={14} />
              Preview
            </button>
            <button
              onClick={() => onApplyFix(selectedIssue.id)}
              disabled={isApplying}
              className="sds-btn sds-btn-primary"
              style={{ flex: 1, fontSize: '13px', padding: '10px 0' }}
            >
              <Wrench size={14} />
              {isApplying ? 'Applying...' : 'Apply Fix'}
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};
