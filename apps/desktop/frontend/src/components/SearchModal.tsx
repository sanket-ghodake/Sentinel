import React, { useState, useEffect, useRef } from 'react';
import { Search, FileCode, Folder, Shield, AlertCircle, Play, X } from 'lucide-react';
import type { Project, Issue } from '../services/clientApi';

interface SearchItem {
  id: string;
  title: string;
  category: 'Projects' | 'Files' | 'Issues' | 'Rules' | 'Plugins' | 'Commands';
  subtitle?: string;
  action: () => void;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  issues: Issue[];
  onSelectProject: (id: string) => void;
  onSelectIssue: (id: string) => void;
  onNavigateToWorkspace: (workspace: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  projects,
  issues,
  onSelectProject,
  onSelectIssue,
  onNavigateToWorkspace,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate searchable item list
  const searchItems: SearchItem[] = [
    // Workspace Navigation Commands
    {
      id: 'cmd-home',
      title: 'Navigate to Home Dashboard',
      category: 'Commands',
      subtitle: 'Open Sentinel home screen',
      action: () => {
        onNavigateToWorkspace('home');
        onClose();
      },
    },
    {
      id: 'cmd-codebase',
      title: 'Navigate to Codebase Workspace',
      category: 'Commands',
      subtitle: 'Open codebase perspective maps',
      action: () => {
        onNavigateToWorkspace('codebase');
        onClose();
      },
    },
    {
      id: 'cmd-analyze',
      title: 'Navigate to Issues Queue',
      category: 'Commands',
      subtitle: 'Browse all codebase warnings',
      action: () => {
        onNavigateToWorkspace('analyze');
        onClose();
      },
    },
    {
      id: 'cmd-improve',
      title: 'Navigate to Improvement Workspace',
      category: 'Commands',
      subtitle: 'Apply safe static analysis improvements',
      action: () => {
        onNavigateToWorkspace('improve');
        onClose();
      },
    },
    {
      id: 'cmd-insights',
      title: 'Navigate to Quality Insights',
      category: 'Commands',
      subtitle: 'View compliance trends',
      action: () => {
        onNavigateToWorkspace('insights');
        onClose();
      },
    },
    {
      id: 'cmd-extensions',
      title: 'Navigate to Extension Manager',
      category: 'Commands',
      subtitle: 'Manage linter plugins',
      action: () => {
        onNavigateToWorkspace('extensions');
        onClose();
      },
    },
    {
      id: 'cmd-settings',
      title: 'Navigate to Configuration Settings',
      category: 'Commands',
      subtitle: 'Configure rules and user profile',
      action: () => {
        onNavigateToWorkspace('settings');
        onClose();
      },
    },
    // Projects
    ...projects.map((p) => ({
      id: `proj-${p.id}`,
      title: p.name,
      category: 'Projects' as const,
      subtitle: `${p.language} Project (${p.branch})`,
      action: () => {
        onSelectProject(p.id);
        onClose();
      },
    })),
    // Common files
    {
      id: 'file-app-tsx',
      title: 'App.tsx',
      category: 'Files' as const,
      subtitle: 'apps/desktop/frontend/src/App.tsx',
      action: () => {
        onNavigateToWorkspace('codebase');
        onClose();
      },
    },
    {
      id: 'file-fake-api',
      title: 'FakeClientApi.cpp',
      category: 'Files' as const,
      subtitle: 'core/fake_data/FakeClientApi.cpp',
      action: () => {
        onNavigateToWorkspace('codebase');
        onClose();
      },
    },
    // Issues
    ...issues.map((i) => ({
      id: `issue-${i.id}`,
      title: i.title,
      category: 'Issues' as const,
      subtitle: `${i.severity} Severity | ${i.location.fileId}:${i.location.line}`,
      action: () => {
        onSelectIssue(i.id);
        onNavigateToWorkspace('analyze');
        onClose();
      },
    })),
    // Linters
    {
      id: 'plugin-cppcheck',
      title: 'cppcheck',
      category: 'Plugins' as const,
      subtitle: 'C/C++ Static Analyzer v2.13',
      action: () => {
        onNavigateToWorkspace('extensions');
        onClose();
      },
    },
    {
      id: 'plugin-clang-tidy',
      title: 'clang-tidy',
      category: 'Plugins' as const,
      subtitle: 'LLVM Lint Diagnostic v17.0',
      action: () => {
        onNavigateToWorkspace('extensions');
        onClose();
      },
    },
  ];

  const filtered = searchItems.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase())) ||
      item.category.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    // Reset selected index when query changes to avoid out of bounds
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

  // Group filtered results by category
  const categories: { [key: string]: SearchItem[] } = {};
  filtered.forEach((item) => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });

  // Flat array of filtered items to map absolute index
  const flatFilteredItems: SearchItem[] = [];
  const categoryKeys = Object.keys(categories);
  categoryKeys.forEach((cat) => {
    flatFilteredItems.push(...categories[cat]);
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Projects':
        return <Shield size={14} color="var(--sds-success)" />;
      case 'Files':
        return <FileCode size={14} color="var(--sds-primary)" />;
      case 'Issues':
        return <AlertCircle size={14} color="var(--sds-danger)" />;
      case 'Plugins':
        return <Folder size={14} color="var(--sds-warning)" />;
      case 'Commands':
        return <Play size={14} color="var(--sds-info)" />;
      default:
        return <Search size={14} />;
    }
  };

  let globalFlatIndex = 0;

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
          width: '560px',
          maxHeight: '480px',
          backgroundColor: 'var(--sds-surface)',
          border: '1px solid var(--sds-border-hover)',
          borderRadius: 'var(--sds-radius-lg)',
          boxShadow: 'var(--sds-shadow-lg), 0 0 24px rgba(99, 102, 241, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'modalSlideDown 0.15s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input area */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: 'var(--sds-space-16) var(--sds-space-24)',
            borderBottom: '1px solid var(--sds-border)',
            gap: '12px',
          }}
        >
          <Search size={18} color="var(--sds-text-muted)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search projects, files, rules, plugins, or commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--sds-text-heading)',
              fontSize: '14px',
              fontFamily: 'var(--sds-font-sans)',
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

        {/* Results area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '32px',
                textAlign: 'center',
                color: 'var(--sds-text-muted)',
                fontSize: '13px',
              }}
            >
              No matches found for "{query}"
            </div>
          ) : (
            categoryKeys.map((catKey) => (
              <div key={catKey}>
                <div
                  style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--sds-text-muted)',
                    padding: '8px 12px 4px 12px',
                    letterSpacing: '0.75px',
                  }}
                >
                  {catKey}
                </div>
                {categories[catKey].map((item) => {
                  const currentFlatIndex = globalFlatIndex++;
                  const isSelected = currentFlatIndex === selectedIndex;

                  return (
                    <div
                      key={item.id}
                      onClick={() => item.action()}
                      onMouseEnter={() => setSelectedIndex(currentFlatIndex)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
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
                          width: '28px',
                          height: '28px',
                          borderRadius: 'var(--sds-radius-sm)',
                          backgroundColor: isSelected
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.15)',
                        }}
                      >
                        {getCategoryIcon(item.category)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '13px',
                            fontWeight: 500,
                            color: isSelected ? 'var(--sds-text-heading)' : 'var(--sds-text)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {item.title}
                        </div>
                        {item.subtitle && (
                          <div
                            style={{
                              fontSize: '11px',
                              color: 'var(--sds-text-muted)',
                              marginTop: '2px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              fontFamily:
                                item.category === 'Files' ? 'var(--sds-font-mono)' : 'inherit',
                            }}
                          >
                            {item.subtitle}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div
                          style={{
                            fontSize: '10px',
                            backgroundColor: 'var(--sds-primary)',
                            color: '#fff',
                            padding: '2px 6px',
                            borderRadius: 'var(--sds-radius-sm)',
                            fontWeight: 600,
                          }}
                        >
                          ENTER
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            borderTop: '1px solid var(--sds-border)',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px',
            color: 'var(--sds-text-muted)',
          }}
        >
          <div>Search matching files, symbols, issues, and linters.</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>
              <kbd
                style={{
                  background: 'var(--sds-surface-hover)',
                  padding: '1px 4px',
                  borderRadius: '3px',
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
                  padding: '1px 4px',
                  borderRadius: '3px',
                }}
              >
                Esc
              </kbd>{' '}
              Close
            </span>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes modalSlideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
