import React from 'react';
import { Play, Loader2, Bell, Search, Shield, User } from 'lucide-react';
import type { Project } from '../services/clientApi';

interface TopbarProps {
  projects: Project[];
  activeProjectId: string;
  onProjectChange: (id: string) => void;
  onRunScan: () => void;
  isScanning: boolean;
  scanProgress: number;
  activeWorkspaceTitle: string;
  onSearchClick: () => void;
  onProfileClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  projects,
  activeProjectId,
  onProjectChange,
  onRunScan,
  isScanning,
  scanProgress,
  activeWorkspaceTitle,
  onSearchClick,
  onProfileClick,
}) => {
  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'var(--sds-surface)',
        borderBottom: '1px solid var(--sds-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--sds-space-24)',
        zIndex: 10,
      }}
    >
      {/* Left Section: Logo & Workspace Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-24)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-12)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              padding: '6px',
              borderRadius: 'var(--sds-radius-md)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
            }}
          >
            <Shield size={20} color="var(--sds-primary)" />
          </div>
          <span
            style={{
              fontFamily: 'var(--sds-font-sans)',
              fontSize: '16px',
              fontWeight: 700,
              color: 'var(--sds-text-heading)',
              letterSpacing: '0.75px',
            }}
          >
            SENTINEL
          </span>
        </div>

        {/* Separator line */}
        <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--sds-border)' }} />

        {/* Current Workspace Title */}
        <span
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--sds-text-heading)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            padding: '4px 12px',
            borderRadius: 'var(--sds-radius-md)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          {activeWorkspaceTitle}
        </span>
      </div>

      {/* Middle Section: Project Switcher & Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-16)' }}>
        {/* Project Switcher */}
        <div style={{ position: 'relative' }}>
          <select
            value={activeProjectId}
            onChange={(e) => onProjectChange(e.target.value)}
            disabled={isScanning}
            style={{
              backgroundColor: 'var(--sds-bg)',
              color: 'var(--sds-text-heading)',
              border: '1px solid var(--sds-border)',
              borderRadius: 'var(--sds-radius-md)',
              padding: '6px 32px 6px 12px',
              fontFamily: 'var(--sds-font-sans)',
              fontSize: '13px',
              fontWeight: 500,
              cursor: isScanning ? 'not-allowed' : 'pointer',
              outline: 'none',
              appearance: 'none',
              transition: 'all var(--sds-transition-fast)',
            }}
          >
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
          <div
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              borderTop: '5px solid var(--sds-text)',
              borderLeft: '4px solid transparent',
              borderRight: '4px solid transparent',
            }}
          />
        </div>

        {/* Global Search box */}
        <div
          onClick={onSearchClick}
          style={{
            position: 'relative',
            width: '260px',
            cursor: 'pointer',
          }}
        >
          <Search
            size={14}
            color="var(--sds-text-muted)"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="text"
            placeholder="Search (Ctrl+K)..."
            readOnly
            style={{
              width: '100%',
              backgroundColor: 'var(--sds-bg)',
              border: '1px solid var(--sds-border)',
              borderRadius: 'var(--sds-radius-md)',
              padding: '6px 12px 6px 32px',
              fontFamily: 'var(--sds-font-sans)',
              fontSize: '13px',
              color: 'var(--sds-text-heading)',
              outline: 'none',
              cursor: 'pointer',
              caretColor: 'transparent',
              transition: 'all var(--sds-transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--sds-border-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--sds-border)')}
          />
        </div>
      </div>

      {/* Right Section: Scan, Notifications, User Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-16)' }}>
        {/* Progress Display */}
        {isScanning && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--sds-space-12)',
              fontSize: '12px',
              color: 'var(--sds-primary)',
            }}
          >
            <Loader2
              size={14}
              className="sds-spin"
              style={{ animation: 'spin 1s linear infinite' }}
            />
            <span>Scanning {scanProgress}%</span>
            <div
              style={{
                width: '60px',
                height: '4px',
                backgroundColor: 'var(--sds-border)',
                borderRadius: 'var(--sds-radius-pill)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${scanProgress}%`,
                  height: '100%',
                  backgroundColor: 'var(--sds-primary)',
                  transition: 'width 0.2s ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Run Scan Button */}
        <button
          onClick={onRunScan}
          disabled={isScanning}
          className="sds-btn sds-btn-primary"
          style={{
            fontSize: '12px',
            padding: '6px 14px',
          }}
        >
          {isScanning ? (
            <>
              <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
              Scanning
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" />
              Run Scan
            </>
          )}
        </button>

        {/* Notifications Bell */}
        <button
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--sds-text)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderRadius: 'var(--sds-radius-sm)',
            transition: 'color var(--sds-transition-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--sds-text-heading)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--sds-text)')}
        >
          <Bell size={18} />
          <div
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '6px',
              height: '6px',
              backgroundColor: 'var(--sds-danger)',
              borderRadius: '50%',
            }}
          />
        </button>

        {/* User / Profile menu */}
        <button
          onClick={onProfileClick}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--sds-surface-hover)',
            border: '1px solid var(--sds-border)',
            color: 'var(--sds-text-heading)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all var(--sds-transition-fast)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--sds-primary)';
            e.currentTarget.style.backgroundColor = 'var(--sds-surface-active)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--sds-border)';
            e.currentTarget.style.backgroundColor = 'var(--sds-surface-hover)';
          }}
        >
          <User size={16} />
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
};
