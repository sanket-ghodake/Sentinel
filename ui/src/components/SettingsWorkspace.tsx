import React, { useState } from 'react';
import { ToggleLeft, ToggleRight } from 'lucide-react';

interface SettingsWorkspaceProps {
  theme: 'dark' | 'light';
  onThemeToggle: () => void;
}

export const SettingsWorkspace: React.FC<SettingsWorkspaceProps> = ({ theme, onThemeToggle }) => {
  const [autoScan, setAutoScan] = useState(false);
  const [sandboxMode, setSandboxMode] = useState(true);
  const [profile, setProfile] = useState('Default (Security & Style)');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sds-space-24)',
        maxWidth: '600px',
      }}
    >
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--sds-text-heading)' }}>
          Configuration Preferences
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--sds-text-muted)', marginTop: '4px' }}>
          Configure static checks daemon triggers, container isolation, and compiler arguments.
        </p>
      </div>

      {/* Main Settings Card */}
      <div
        className="sds-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sds-space-20)',
          padding: 'var(--sds-space-24)',
        }}
      >
        {/* Active Analysis Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sds-text-heading)' }}>
            Active Analysis Profile
          </label>
          <select
            value={profile}
            onChange={(e) => setProfile(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--sds-bg)',
              border: '1px solid var(--sds-border)',
              borderRadius: 'var(--sds-radius-md)',
              padding: '10px 12px',
              color: 'var(--sds-text-heading)',
              fontFamily: 'var(--sds-font-sans)',
              fontSize: '13px',
              outline: 'none',
            }}
          >
            <option>Default (Security & Style)</option>
            <option>Strict (Compile Warnings & All checks)</option>
            <option>MISRA C++ Conformant Profile</option>
            <option>Fast Audit (Security Checks only)</option>
          </select>
        </div>

        <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--sds-border)' }} />

        {/* Setting: Auto Scan */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sds-text-heading)' }}>
              Auto-scan on file save
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--sds-text-muted)', lineHeight: '1.4' }}>
              Automatically trigger docker linting checkers when files are modified on disk.
            </span>
          </div>
          <button
            onClick={() => setAutoScan(!autoScan)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: autoScan ? 'var(--sds-primary)' : 'var(--sds-text-muted)',
            }}
          >
            {autoScan ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
          </button>
        </div>

        <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--sds-border)' }} />

        {/* Setting: Docker Isolation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sds-text-heading)' }}>
              Enforce Docker Container Sandbox
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--sds-text-muted)', lineHeight: '1.4' }}>
              Isolates static analyzer binaries inside the workspace container to protect the host.
            </span>
          </div>
          <button
            onClick={() => setSandboxMode(!sandboxMode)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: sandboxMode ? 'var(--sds-primary)' : 'var(--sds-text-muted)',
            }}
          >
            {sandboxMode ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
          </button>
        </div>

        <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--sds-border)' }} />

        {/* Setting: Theme toggler */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sds-text-heading)' }}>
              Color Theme Mode
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--sds-text-muted)', lineHeight: '1.4' }}>
              Toggle between the curated dark premium theme and standard light coding interface.
            </span>
          </div>
          <button
            onClick={onThemeToggle}
            className="sds-btn sds-btn-secondary"
            style={{ fontSize: '11.5px', padding: '6px 12px' }}
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
        </div>
      </div>
    </div>
  );
};
