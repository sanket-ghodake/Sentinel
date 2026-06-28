import React from 'react';
import { Terminal, Shield, RefreshCw } from 'lucide-react';

interface StatusbarProps {
  isScanning: boolean;
  status: string;
  compilerStatus?: string;
}

export const Statusbar: React.FC<StatusbarProps> = ({
  isScanning,
  status,
  compilerStatus = 'C++20 GCC 13 (Docker Enabled)',
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
      }}
    >
      {/* Left side: Scan state */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-8)' }}>
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isScanning
              ? 'var(--sds-primary)'
              : status === 'error'
                ? 'var(--sds-danger)'
                : 'var(--sds-success)',
            boxShadow: isScanning
              ? '0 0 8px var(--sds-primary)'
              : status === 'error'
                ? '0 0 8px var(--sds-danger)'
                : '0 0 8px var(--sds-success)',
          }}
        />
        <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>
          System:{' '}
          {isScanning ? 'running scan' : status === 'error' ? 'errors detected' : 'idle / clean'}
        </span>
      </div>

      {/* Center: Running background Tasks */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-4)' }}>
        <RefreshCw
          size={11}
          style={{ animation: isScanning ? 'spin 2s linear infinite' : 'none' }}
        />
        <span>{isScanning ? '1 running analysis thread' : '0 active threads'}</span>
      </div>

      {/* Right side: Compiler status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-8)' }}>
        <Terminal size={11} color="var(--sds-text-muted)" />
        <span style={{ fontFamily: 'var(--sds-font-mono)' }}>{compilerStatus}</span>
        <Shield size={11} color="var(--sds-success)" />
      </div>
    </footer>
  );
};
