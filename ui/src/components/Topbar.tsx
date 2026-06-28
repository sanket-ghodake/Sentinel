import React from 'react';
import { Play, Square, Search, Shield, User, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Project } from '../services/clientApi';

interface TopbarProps {
  projects: Project[];
  activeProjectId: string;
  onProjectChange: (id: string) => void;
  activeWorkspace: string;
  onWorkspaceChange: (ws: string) => void;
  scope: string;
  onScopeChange: (scope: string) => void;
  onRunScan: () => void;
  onStopScan?: () => void;
  isScanning: boolean;
  scanProgress: number;
  blockingIssuesCount: number;
  onSearchClick: () => void;
  onProfileClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  projects,
  activeProjectId,
  onProjectChange,
  activeWorkspace,
  onWorkspaceChange,
  scope,
  onScopeChange,
  onRunScan,
  onStopScan,
  isScanning,
  scanProgress: _scanProgress,
  blockingIssuesCount,
  onSearchClick,
  onProfileClick,
}) => {
  const getCommitStatus = () => {
    if (blockingIssuesCount === 0) {
      return (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            backgroundColor: 'var(--sds-success-bg)',
            borderRadius: 'var(--sds-radius-pill)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--sds-success)',
          }}
          title="No blocking critical or high issues. Ready to commit!"
        >
          <CheckCircle size={12} />
          <span>READY TO COMMIT</span>
        </div>
      );
    } else {
      return (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            backgroundColor: 'var(--sds-danger-bg)',
            borderRadius: 'var(--sds-radius-pill)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--sds-danger)',
          }}
          title={`${blockingIssuesCount} blocking issues must be resolved before committing.`}
        >
          <AlertTriangle size={12} />
          <span>BLOCKED: {blockingIssuesCount} ISSUES</span>
        </div>
      );
    }
  };

  return (
    <header
      style={{
        height: '40px',
        backgroundColor: 'var(--sds-surface)',
        borderBottom: '1px solid var(--sds-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--sds-space-16)',
        zIndex: 10,
        gap: 'var(--sds-space-12)',
        userSelect: 'none',
      }}
    >
      {/* 1. Left Section: Logo, Repository & Profile dropdowns */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-12)' }}>
        <span
          style={{
            fontFamily: 'var(--sds-font-sans)',
            fontSize: '13px',
            fontWeight: 700,
            color: 'var(--sds-text-heading)',
            letterSpacing: '0.5px',
          }}
        >
          Sentinel
        </span>

        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--sds-border)' }} />

        {/* Repository Dropdown */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <select
            value={activeProjectId}
            onChange={(e) => onProjectChange(e.target.value)}
            disabled={isScanning}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--sds-text-heading)',
              border: 'none',
              borderRadius: 'var(--sds-radius-sm)',
              padding: '2px 20px 2px 4px',
              fontFamily: 'var(--sds-font-sans)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: isScanning ? 'not-allowed' : 'pointer',
              outline: 'none',
              appearance: 'none',
              transition: 'all var(--sds-transition-fast)',
            }}
          >
            {projects.map((proj) => (
              <option
                key={proj.id}
                value={proj.id}
                style={{ backgroundColor: 'var(--sds-surface)' }}
              >
                {proj.name}
              </option>
            ))}
          </select>
          <span
            style={{
              fontSize: '9px',
              color: 'var(--sds-text-muted)',
              position: 'absolute',
              right: '4px',
              pointerEvents: 'none',
            }}
          >
            ▼
          </span>
        </div>

        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--sds-border)' }} />

        {/* Profile Dropdown */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button
            onClick={onProfileClick}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--sds-text-heading)',
              border: 'none',
              padding: '2px 16px 2px 4px',
              fontFamily: 'var(--sds-font-sans)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              outline: 'none',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span>Sanket</span>
          </button>
          <span
            style={{
              fontSize: '9px',
              color: 'var(--sds-text-muted)',
              position: 'absolute',
              right: '2px',
              pointerEvents: 'none',
            }}
          >
            ▼
          </span>
        </div>
      </div>

      {/* 2. Right Section: Scope, Search, Scan & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-12)' }}>
        {/* Scope (Focus) Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>Focus:</span>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <select
              value={scope}
              onChange={(e) => onScopeChange(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                color: 'var(--sds-text-heading)',
                border: 'none',
                borderRadius: 'var(--sds-radius-sm)',
                padding: '2px 20px 2px 4px',
                fontFamily: 'var(--sds-font-sans)',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                transition: 'all var(--sds-transition-fast)',
              }}
            >
              <option value="entire" style={{ backgroundColor: 'var(--sds-surface)' }}>
                Entire Repository
              </option>
              <option value="changed" style={{ backgroundColor: 'var(--sds-surface)' }}>
                Changed Files
              </option>
              <option value="folder" style={{ backgroundColor: 'var(--sds-surface)' }}>
                Current Folder
              </option>
              <option value="file" style={{ backgroundColor: 'var(--sds-surface)' }}>
                Current File
              </option>
              <option value="staged" style={{ backgroundColor: 'var(--sds-surface)' }}>
                Staged Changes
              </option>
              <option value="unstaged" style={{ backgroundColor: 'var(--sds-surface)' }}>
                Unstaged Changes
              </option>
              <option value="bookmarks" style={{ backgroundColor: 'var(--sds-surface)' }}>
                Bookmarks
              </option>
            </select>
            <span
              style={{
                fontSize: '8px',
                color: 'var(--sds-text-muted)',
                position: 'absolute',
                right: '4px',
                pointerEvents: 'none',
              }}
            >
              ▼
            </span>
          </div>
        </div>

        {/* Global Search box */}
        <div
          onClick={onSearchClick}
          style={{
            position: 'relative',
            width: '140px',
            cursor: 'pointer',
          }}
          title="Search issues, rules, or symbols (Ctrl+K)"
        >
          <Search
            size={10}
            color="var(--sds-text-muted)"
            style={{
              position: 'absolute',
              left: '8px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="text"
            placeholder="Search (Ctrl+K)"
            readOnly
            style={{
              width: '100%',
              backgroundColor: 'var(--sds-bg)',
              border: '1px solid var(--sds-border)',
              borderRadius: 'var(--sds-radius-sm)',
              padding: '3px 8px 3px 22px',
              fontFamily: 'var(--sds-font-sans)',
              fontSize: '11px',
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

        {/* Action: Run Scan / Stop Scan */}
        <button
          onClick={isScanning && onStopScan ? onStopScan : onRunScan}
          className="sds-btn"
          style={{
            fontSize: '11px',
            padding: '3px 10px',
            height: '24px',
            backgroundColor: isScanning ? 'var(--sds-danger-bg)' : 'var(--sds-primary)',
            color: isScanning ? 'var(--sds-danger)' : '#ffffff',
            borderColor: isScanning ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            borderRadius: 'var(--sds-radius-sm)',
          }}
        >
          {isScanning ? (
            <>
              <Square size={9} fill="currentColor" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Play size={9} fill="currentColor" />
              <span>Run</span>
            </>
          )}
        </button>

        <div style={{ width: '1px', height: '14px', backgroundColor: 'var(--sds-border)' }} />

        {/* Status Indicator */}
        {blockingIssuesCount === 0 ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--sds-success)',
            }}
            title="No blocking critical or high issues. Ready to commit!"
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: 'var(--sds-success)',
                borderRadius: '50%',
              }}
            />
            <span>Ready</span>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--sds-danger)',
            }}
            title={`${blockingIssuesCount} blocking issues must be resolved before committing.`}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                backgroundColor: 'var(--sds-danger)',
                borderRadius: '50%',
              }}
            />
            <span>Blocked ({blockingIssuesCount})</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.4; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </header>
  );
};
