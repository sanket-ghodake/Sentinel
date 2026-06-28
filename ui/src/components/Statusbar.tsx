import React from 'react';
import { GitBranch, Clock, Sliders, Shield, RefreshCw } from 'lucide-react';

interface StatusbarProps {
  isScanning: boolean;
  branchName?: string;
  lastScanTime?: string;
  activeProfile?: string;
  activeAnalyzerCount?: number;
}

export const Statusbar: React.FC<StatusbarProps> = ({
  isScanning,
  branchName = 'main',
  lastScanTime = 'Just now',
  activeProfile = 'Default',
  activeAnalyzerCount = 3,
}) => {
  return (
    <footer
      style={{
        height: '28px',
        backgroundColor: 'var(--sds-surface)',
        borderTop: '1px solid var(--sds-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--sds-space-16)',
        fontSize: '11px',
        color: 'var(--sds-text-muted)',
        fontFamily: 'var(--sds-font-sans)',
        zIndex: 10,
        userSelect: 'none',
      }}
    >
      {/* 1. Current Branch */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-8)' }}>
        <GitBranch size={11} color="var(--sds-primary)" />
        <span
          style={{
            fontWeight: 600,
            color: 'var(--sds-text-heading)',
            fontFamily: 'var(--sds-font-mono)',
          }}
        >
          {branchName}
        </span>
      </div>

      {/* 2. Last Scan Time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-8)' }}>
        <Clock size={11} />
        <span>Last scan: {lastScanTime}</span>
      </div>

      {/* 3. Active Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-8)' }}>
        <Sliders size={11} />
        <span>
          Profile:{' '}
          <span style={{ fontWeight: 500, color: 'var(--sds-text)' }}>{activeProfile}</span>
        </span>
      </div>

      {/* 4. Active Analyzer Count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-8)' }}>
        <Shield size={11} color="var(--sds-success)" />
        <span>{activeAnalyzerCount} Analyzers Active</span>
      </div>

      {/* 5. Background Scan Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-8)' }}>
        <RefreshCw
          size={11}
          style={{
            animation: isScanning ? 'spin 2s linear infinite' : 'none',
            color: isScanning ? 'var(--sds-primary)' : 'var(--sds-text-muted)',
          }}
        />
        <span>Background Scan: {isScanning ? 'In Progress' : 'Ready'}</span>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </footer>
  );
};
