import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, Play, Wrench, Settings, RefreshCw, X, SunMoon } from 'lucide-react';

interface PaletteCommand {
  id: string;
  name: string;
  category: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onRunFullScan: () => void;
  onApplySafeFixes: () => void;
  onToggleTheme: () => void;
  onNavigateToWorkspace: (workspace: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onRunFullScan,
  onApplySafeFixes,
  onToggleTheme,
  onNavigateToWorkspace,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: PaletteCommand[] = [
    {
      id: 'cmd-scan-full',
      name: 'Run Full Scan',
      category: 'Analysis',
      shortcut: 'Ctrl+R',
      icon: <Play size={14} color="var(--sds-success)" />,
      action: () => {
        onRunFullScan();
        onClose();
      },
    },
    {
      id: 'cmd-scan-changed',
      name: 'Scan Changed Files Only',
      category: 'Analysis',
      icon: <RefreshCw size={14} color="var(--sds-primary)" />,
      action: () => {
        onRunFullScan();
        onClose();
      },
    },
    {
      id: 'cmd-apply-fixes',
      name: 'Apply Safe Autofixes',
      category: 'Fixes',
      icon: <Wrench size={14} color="var(--sds-success)" />,
      action: () => {
        onApplySafeFixes();
        onClose();
      },
    },
    {
      id: 'cmd-toggle-theme',
      name: 'Toggle Visual Theme (Light/Dark)',
      category: 'Preferences',
      icon: <SunMoon size={14} color="var(--sds-warning)" />,
      action: () => {
        onToggleTheme();
        onClose();
      },
    },
    {
      id: 'cmd-export-report',
      name: 'Export Quality Audit Report',
      category: 'Reports',
      icon: <Settings size={14} color="var(--sds-text-muted)" />,
      action: () => {
        alert('Exporting Report as JSON...');
        onClose();
      },
    },
    {
      id: 'cmd-install-plugin',
      name: 'Install Linter Plugin...',
      category: 'Extensions',
      icon: <Shield size={14} color="var(--sds-primary)" />,
      action: () => {
        onNavigateToWorkspace('extensions');
        onClose();
      },
    },
    {
      id: 'cmd-import-rulepack',
      name: 'Import Rule Pack Configuration...',
      category: 'Extensions',
      icon: <Terminal size={14} color="var(--sds-info)" />,
      action: () => {
        onNavigateToWorkspace('settings');
        onClose();
      },
    },
    {
      id: 'cmd-show-home',
      name: 'Show Home Dashboard',
      category: 'Navigation',
      icon: <Terminal size={14} />,
      action: () => {
        onNavigateToWorkspace('home');
        onClose();
      },
    },
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.name.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(5, 6, 8, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '480px',
          maxHeight: '400px',
          backgroundColor: 'var(--sds-surface)',
          border: '1px solid var(--sds-border-hover)',
          borderRadius: 'var(--sds-radius-lg)',
          boxShadow: 'var(--sds-shadow-lg), 0 0 24px rgba(99, 102, 241, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'paletteSlideDown 0.15s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: 'var(--sds-space-12) var(--sds-space-16)',
            borderBottom: '1px solid var(--sds-border)',
            gap: '10px',
          }}
        >
          <Terminal size={16} color="var(--sds-primary)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command to execute..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--sds-text-heading)',
              fontSize: '13px',
              fontFamily: 'var(--sds-font-mono)',
              outline: 'none',
            }}
          />
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--sds-text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Command list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--sds-text-muted)',
                fontSize: '12px',
              }}
            >
              No matching commands
            </div>
          ) : (
            filtered.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '8px 12px',
                    borderRadius: 'var(--sds-radius-md)',
                    backgroundColor: isSelected ? 'var(--sds-surface-active)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background var(--sds-transition-fast)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--sds-radius-sm)',
                      backgroundColor: isSelected ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.15)',
                    }}
                  >
                    {cmd.icon}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      fontSize: '12px',
                      fontWeight: 500,
                      fontFamily: 'var(--sds-font-sans)',
                      color: isSelected ? 'var(--sds-text-heading)' : 'var(--sds-text)',
                    }}
                  >
                    {cmd.name}
                  </div>
                  {cmd.shortcut && (
                    <div
                      style={{
                        fontSize: '9px',
                        color: 'var(--sds-text-muted)',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        padding: '2px 6px',
                        borderRadius: 'var(--sds-radius-sm)',
                        fontFamily: 'var(--sds-font-mono)',
                      }}
                    >
                      {cmd.shortcut}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: '6px 12px',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            borderTop: '1px solid var(--sds-border)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '9px',
            color: 'var(--sds-text-muted)',
          }}
        >
          <span>Command Palette (Ctrl+Shift+P)</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span>
              <kbd
                style={{
                  background: 'var(--sds-surface-hover)',
                  padding: '1px 3px',
                  borderRadius: '2px',
                }}
              >
                ↑↓
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd
                style={{
                  background: 'var(--sds-surface-hover)',
                  padding: '1px 3px',
                  borderRadius: '2px',
                }}
              >
                Enter
              </kbd>{' '}
              Run
            </span>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes paletteSlideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
