import React from 'react';
import { Play, Loader2, Bell, Search, Layers } from 'lucide-react';
import type { Project } from '../services/clientApi';

interface TopbarProps {
  projects: Project[];
  activeProjectId: string;
  onProjectChange: (id: string) => void;
  onRunScan: () => void;
  isScanning: boolean;
  scanProgress: number;
}

export const Topbar: React.FC<TopbarProps> = ({
  projects,
  activeProjectId,
  onProjectChange,
  onRunScan,
  isScanning,
  scanProgress,
}) => {
  const activeProject = projects.find((p) => p.id === activeProjectId);

  return (
    <header
      style={{
        height: '56px',
        backgroundColor: 'var(--sds-surface)',
        borderBottom: '1px solid var(--sds-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--sds-space-24)',
        zIndex: 10,
      }}
    >
      {/* Project Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-12)' }}>
        <Layers size={16} color="var(--sds-text-muted)" />
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
                {proj.name} ({proj.language})
              </option>
            ))}
          </select>
          {/* Custom chevron dropdown arrow */}
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
        {activeProject && (
          <span
            style={{
              fontSize: '11px',
              color: 'var(--sds-text-muted)',
              fontFamily: 'var(--sds-font-mono)',
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              padding: '2px 8px',
              borderRadius: 'var(--sds-radius-sm)',
              border: '1px solid var(--sds-border)',
            }}
          >
            {activeProject.branch}
          </span>
        )}
      </div>

      {/* Center Search Bar */}
      <div
        style={{
          position: 'relative',
          width: '320px',
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
          placeholder="Search files, rules, or issues (Ctrl+K)..."
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
            transition: 'all var(--sds-transition-fast)',
          }}
          onFocus={(e) => (e.target.style.borderColor = 'var(--sds-primary)')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--sds-border)')}
        />
      </div>

      {/* Right Side Controls */}
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
            <span>Scanning... {scanProgress}%</span>
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
          {/* Unread badge dot */}
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
