import { useState, useEffect } from 'react';
import { Topbar } from './components/Topbar';
import { Statusbar } from './components/Statusbar';
import { SearchModal } from './components/SearchModal';
import { CommandPalette } from './components/CommandPalette';
import { DirectoryExplorer } from './components/DirectoryExplorer';
import { BottomDrawer } from './components/BottomDrawer';
import { PluginMarketplace } from './components/PluginMarketplace';
import { SettingsWorkspace } from './components/SettingsWorkspace';
import { MockClient } from './services/mockClient';
import { QtBridgeClient } from './services/qtBridgeClient';
import type { Project, Issue, ClientApi } from './services/clientApi';
import {
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Play,
  Square,
  Terminal,
  FileCode,
  CheckCircle,
  AlertTriangle,
  Shield,
  Settings,
  HelpCircle,
  Activity,
  Box,
  History,
  Check,
  AlertCircle,
} from 'lucide-react';
import type { PluginCard } from './components/PluginMarketplace';

const isQt = typeof window.qt !== 'undefined';
export const client: ClientApi = isQt ? new QtBridgeClient() : new MockClient();

function App() {
  // Navigation & Workspace State
  const [activeWorkspace, setActiveWorkspace] = useState('queue');
  const [scope, setScope] = useState('entire');
  const [selectedFile, setSelectedFile] = useState('IpcServer.cpp');
  const [bottomTab, setBottomTab] = useState<'code' | 'diff' | 'logs' | 'rules' | 'git'>('code');
  const [isInvestigating, setIsInvestigating] = useState(false);

  // Panel toggles
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightCollapsed, setIsRightCollapsed] = useState(false);
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  // Core Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Layout Dialogs
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lastScanTime, setLastScanTime] = useState('Just now');
  const [ignoredIssues, setIgnoredIssues] = useState<Record<string, string>>({});
  const [showIgnoreModal, setShowIgnoreModal] = useState<string | null>(null);
  const [ignoreReason, setIgnoreReason] = useState('');

  // Scanning Progress States
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Investigation Specific Sub-states
  const [activePanel, setActivePanel] = useState<
    | 'summary'
    | 'why'
    | 'call_flow'
    | 'ownership'
    | 'related'
    | 'git'
    | 'reasoning'
    | 'docs'
    | 'discussion'
  >('summary');
  const [comments, setComments] = useState<string[]>([
    'Sanket: Verified this conforms to SQLite parameterized bindings rules.',
  ]);
  const [newComment, setNewComment] = useState('');
  const [selectedCallNode, setSelectedCallNode] = useState<string>('handleQuery');

  // Marketplace & Settings specific states
  const [selectedPluginId, setSelectedPluginId] = useState('plugin-sql-injection');
  const [selectedPlugin, setSelectedPlugin] = useState<PluginCard>({
    id: 'plugin-sql-injection',
    name: 'SQL Injection Guard',
    category: 'Security Auditing',
    version: '1.4.2',
    author: 'Sentinel Security Team',
    downloads: '1.2K',
    rating: 4.9,
    description:
      'Advanced AST matchers analyzing query parameters to detect raw sqlite3 concatenations and dynamic formatting vulnerabilities.',
    installed: true,
    enabled: true,
  });
  const [settingsCategory, setSettingsCategory] = useState('general');
  const [settingsAuditLogs] = useState<string[]>([
    '[INFO] Workspace profile set to: Default (Security & Style)',
    '[INFO] Enforce Docker Sandbox mode enabled.',
  ]);

  // Load projects initially
  useEffect(() => {
    async function load() {
      const projs = await client.GetProjects();
      setProjects(projs);
      if (projs.length > 0) {
        setActiveProjectId(projs[0].id);
      }
    }
    load();
  }, []);

  // Auto-collapse right panel for utility workspaces
  useEffect(() => {
    if (activeWorkspace !== 'queue' && activeWorkspace !== 'repository') {
      setIsRightCollapsed(true);
    } else {
      setIsRightCollapsed(false);
    }
  }, [activeWorkspace]);

  // Reload issues when active project changes
  useEffect(() => {
    if (!activeProjectId) return;
    async function loadIssues() {
      const list = await client.GetIssues(activeProjectId);
      setIssues(list);
      if (list.length > 0) {
        setSelectedIssueId(list[0].id);
      } else {
        setSelectedIssueId(null);
      }
    }
    loadIssues();
  }, [activeProjectId]);

  // Synchronize theme
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light-theme');
    } else {
      document.documentElement.classList.remove('light-theme');
    }
  }, [theme]);

  // Elapsed scan time ticker
  useEffect(() => {
    let counter = 0;
    setLastScanTime('Just now');
    const timer = setInterval(() => {
      counter += 5;
      if (counter < 60) {
        setLastScanTime(`${counter}s ago`);
      } else {
        setLastScanTime(`${Math.floor(counter / 60)}m ago`);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [isScanning]);

  // Auto transition to running screen when scan starts, and back to queue on completion
  useEffect(() => {
    if (isScanning) {
      setActiveWorkspace('running');
    } else if (activeWorkspace === 'running') {
      setActiveWorkspace('queue');
    }
  }, [isScanning]);

  const handleProjectChange = (id: string) => {
    setActiveProjectId(id);
  };

  const handleRunScan = async () => {
    if (!activeProjectId) return;
    setIsScanning(true);
    setScanProgress(0);

    await client.RunScan(activeProjectId, (event) => {
      if (event.type === 'progress') {
        setScanProgress(event.progress);
      } else if (event.type === 'ScanCompleted') {
        setIsScanning(false);
        setScanProgress(100);
        client.GetProjects().then((updatedProjs) => {
          setProjects(updatedProjs);
        });
        client.GetIssues(activeProjectId).then((list) => {
          setIssues(list);
          if (list.length > 0 && !selectedIssueId) {
            setSelectedIssueId(list[list.length - 1].id);
          }
        });
      }
    });
  };

  const handleStopScan = () => {
    setIsScanning(false);
    setScanProgress(0);
  };

  const handleApplyFix = async (issueId: string) => {
    try {
      const success = await client.ApplyAutofix(issueId);
      if (success) {
        const updatedProjs = await client.GetProjects();
        setProjects(updatedProjs);
        const updatedIssues = await client.GetIssues(activeProjectId);
        setIssues(updatedIssues);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  const handleApplySafeFixes = async () => {
    const autofixableIssues = issues.filter((i) => i.status === 'Open' && i.fix);
    for (const issue of autofixableIssues) {
      await handleApplyFix(issue.id);
    }
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      const isInput =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.tagName === 'SELECT';

      if (isInput && !e.ctrlKey && e.key !== 'Escape') {
        return;
      }

      // Ctrl+K -> Search Modal
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      // Ctrl+Shift+P -> Command Palette
      else if (e.ctrlKey && e.shiftKey && e.key.toUpperCase() === 'P') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
      // Ctrl+R -> Run Scan
      else if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        handleRunScan();
      }
      // Ctrl+[ -> Toggle Left Panel
      else if (e.ctrlKey && e.key === '[') {
        e.preventDefault();
        setIsLeftCollapsed((prev) => !prev);
      }
      // Ctrl+] -> Toggle Right Panel
      else if (e.ctrlKey && e.key === ']') {
        e.preventDefault();
        setIsRightCollapsed((prev) => !prev);
      }
      // Ctrl+` -> Toggle Bottom Panel
      else if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setIsBottomCollapsed((prev) => !prev);
      }
      // Esc -> Close modals or exit investigation mode
      else if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        } else if (isPaletteOpen) {
          setIsPaletteOpen(false);
        } else if (isInvestigating) {
          setIsInvestigating(false);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [activeProjectId, isSearchOpen, isPaletteOpen, isInvestigating]);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const selectedIssue = issues.find((i) => i.id === selectedIssueId) || null;

  // Sync selected file context with selected issue location
  useEffect(() => {
    if (selectedIssue) {
      setSelectedFile(selectedIssue.location.fileId);
    }
  }, [selectedIssueId]);

  // Handle ignore issue submission
  const handleIgnoreSubmit = () => {
    if (showIgnoreModal) {
      setIgnoredIssues((prev) => ({
        ...prev,
        [showIgnoreModal]: ignoreReason || 'Manually deferred',
      }));
      setShowIgnoreModal(null);
      setIgnoreReason('');
    }
  };

  // Helper getters for ratings/confidence
  const getConfidenceLevel = (iss: Issue) => {
    if (iss.confidence === 'High') return { score: 98, color: 'var(--sds-success)' };
    if (iss.confidence === 'Medium') return { score: 75, color: 'var(--sds-warning)' };
    return { score: 45, color: 'var(--sds-text-muted)' };
  };

  // ----------------------------------------------------
  // SUB-PANEL RENDERING METHODS
  // ----------------------------------------------------

  // Left Panel Dynamic Content
  const renderLeftPanelContent = () => {
    const navItems = [
      { id: 'queue', label: 'Work Queue', icon: '⚡' },
      { id: 'repository', label: 'Repository', icon: '📁' },
      { id: 'packs', label: 'Rule Packs', icon: '📋' },
      { id: 'history', label: 'History', icon: '🕒' },
      { id: 'settings', label: 'Settings', icon: '⚙' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
        {/* Navigation Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isSelected =
              activeWorkspace === item.id || (item.id === 'queue' && activeWorkspace === 'running');
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveWorkspace(item.id);
                  if (item.id !== 'queue') {
                    setIsInvestigating(false);
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--sds-radius-md)',
                  border: 'none',
                  backgroundColor: isSelected ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: isSelected ? 'var(--sds-text-heading)' : 'var(--sds-text)',
                  fontWeight: isSelected ? 600 : 500,
                  fontSize: '13px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'all var(--sds-transition-fast)',
                }}
              >
                <span style={{ fontSize: '14px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--sds-border)' }} />

        {/* Repository Tree */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--sds-text-muted)',
              letterSpacing: '0.5px',
              paddingLeft: '8px',
            }}
          >
            REPOSITORY
          </span>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <DirectoryExplorer
              selectedFile={selectedFile}
              onFileSelect={(path) => {
                setSelectedFile(path);
                const related = issues.find(
                  (i) => i.location.fileId === path || i.location.fileId.endsWith(path),
                );
                if (related) {
                  setSelectedIssueId(related.id);
                  setIsInvestigating(true);
                  setActiveWorkspace('queue');
                } else {
                  setActiveWorkspace('repository');
                }
              }}
              issues={issues.map((i) => ({ fileId: i.location.fileId, severity: i.severity }))}
            />
          </div>
        </div>
      </div>
    );
  };

  // Center Panel Content
  const renderCenterPanelContent = () => {
    if (activeWorkspace === 'queue') {
      if (isInvestigating) {
        // Deep Dive editor workspace
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setIsInvestigating(false)}
                  className="sds-btn sds-btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '11.5px' }}
                >
                  ← Back to Work Queue
                </button>
                <div
                  style={{ width: '1px', height: '14px', backgroundColor: 'var(--sds-border)' }}
                />
                <span
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    fontFamily: 'var(--sds-font-mono)',
                    color: 'var(--sds-text-heading)',
                  }}
                >
                  {selectedFile}
                </span>
              </div>
              {selectedIssue && (
                <span className="sds-badge sds-badge-danger" style={{ fontSize: '10px' }}>
                  {selectedIssue.severity} Warning
                </span>
              )}
            </div>

            <div
              style={{
                flex: 1,
                border: '1px solid var(--sds-border)',
                borderRadius: 'var(--sds-radius-lg)',
                overflow: 'hidden',
                backgroundColor: '#07080b',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 16px',
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  borderBottom: '1px solid var(--sds-border)',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                  Interactive Inspector Workspace
                </span>
                <span className="sds-badge sds-badge-info" style={{ fontSize: '9px' }}>
                  C++ Sandbox Container
                </span>
              </div>
              <div
                style={{
                  flex: 1,
                  overflow: 'auto',
                  padding: '16px',
                  fontFamily: 'var(--sds-font-mono)',
                  fontSize: '12.5px',
                  lineHeight: '1.6',
                }}
              >
                {selectedFile === 'IpcServer.cpp' ? (
                  <>
                    <div>#include "IpcServer.h"</div>
                    <div>#include &lt;sqlite3.h&gt;</div>
                    <div>#include &lt;string&gt;</div>
                    <div></div>
                    <div>void IpcServer::handleQuery(const std::string& input_val) &#123;</div>
                    <div
                      style={{
                        display: 'flex',
                        backgroundColor: 'rgba(239, 68, 68, 0.12)',
                        borderLeft: '3px solid var(--sds-danger)',
                        paddingLeft: '8px',
                      }}
                    >
                      <span
                        style={{
                          color: 'var(--sds-danger)',
                          marginRight: '16px',
                          width: '20px',
                          textAlign: 'right',
                        }}
                      >
                        42
                      </span>
                      <span style={{ color: '#ffb3b3' }}>
                        std::string sql = "SELECT * FROM users WHERE name = '" + input_val + "';";
                      </span>
                      <span
                        style={{
                          marginLeft: '16px',
                          color: 'var(--sds-danger)',
                          fontStyle: 'italic',
                          fontSize: '11px',
                        }}
                      >
                        ⚠️ SQL Injection warning
                      </span>
                    </div>
                    <div> sqlite3_stmt* stmt;</div>
                    <div> int rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr);</div>
                    <div> if (rc == SQLITE_OK) &#123;</div>
                    <div> sqlite3_step(stmt);</div>
                    <div> &#125;</div>
                    <div> sqlite3_finalize(stmt);</div>
                    <div>&#125;</div>
                  </>
                ) : selectedFile === 'JsonRpcHandler.cpp' ? (
                  <>
                    <div>#include "JsonRpcHandler.h"</div>
                    <div>#include &lt;iostream&gt;</div>
                    <div></div>
                    <div>
                      void JsonRpcHandler::processRequest(const std::string& method, const
                      std::string& params) &#123;
                    </div>
                    <div>
                      {' '}
                      std::cout &lt;&lt; "Received Rpc method: " &lt;&lt; method &lt;&lt; std::endl;
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                        borderLeft: '3px solid var(--sds-warning)',
                        paddingLeft: '8px',
                      }}
                    >
                      <span
                        style={{
                          color: 'var(--sds-warning)',
                          marginRight: '16px',
                          width: '20px',
                          textAlign: 'right',
                        }}
                      >
                        85
                      </span>
                      <span style={{ color: '#ffe4b3' }}>
                        int tempCode = 5; // local unused variable warning
                      </span>
                      <span
                        style={{
                          marginLeft: '16px',
                          color: 'var(--sds-warning)',
                          fontStyle: 'italic',
                          fontSize: '11px',
                        }}
                      >
                        ⚠️ Unused variable 'tempCode'
                      </span>
                    </div>
                    <div> if (method == "ping") &#123;</div>
                    <div> sendResponse("pong");</div>
                    <div> &#125;</div>
                    <div>&#125;</div>
                  </>
                ) : (
                  <div>// Viewing file: {selectedFile}</div>
                )}
              </div>
            </div>
          </div>
        );
      }

      // Work Queue List View
      const openIssues = issues.filter((i) => i.status === 'Open' && !ignoredIssues[i.id]);

      if (openIssues.length === 0) {
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: '340px',
              textAlign: 'center',
              gap: '16px',
              padding: '40px',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--sds-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 700,
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              ✓
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--sds-text-heading)' }}>
                Repository Ready
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--sds-text-muted)' }}>
                No blocking issues found.
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                gap: '12px',
                fontSize: '12px',
                color: 'var(--sds-text-muted)',
                margin: '6px 0',
              }}
            >
              <span>42 rules checked</span>
              <span>•</span>
              <span>Last scan {lastScanTime}</span>
            </div>
            <button
              onClick={() => handleRunScan()}
              className="sds-btn sds-btn-primary"
              style={{ padding: '6px 16px', fontSize: '12.5px', marginTop: '8px' }}
            >
              Run Scan Again
            </button>
          </div>
        );
      }

      const criticalIssues = openIssues.filter(
        (i) => i.severity === 'Critical' || i.severity === 'High',
      );
      const warningIssues = openIssues.filter(
        (i) => i.severity !== 'Critical' && i.severity !== 'High',
      );
      const fixableCount = openIssues.filter((i) => i.fix).length;

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-24)' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--sds-text-heading)' }}>
              Today's Work Queue
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--sds-text-muted)', marginTop: '4px' }}>
              Address outstanding items below to unblock commits on the active branch.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Critical Blockers */}
            {criticalIssues.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedIssueId(item.id);
                  setIsInvestigating(true);
                }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  backgroundColor: 'var(--sds-surface)',
                  border: '1px solid var(--sds-border)',
                  borderRadius: 'var(--sds-radius-lg)',
                  cursor: 'pointer',
                  transition: 'all var(--sds-transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--sds-border-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--sds-border)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: 'var(--sds-danger)', fontWeight: 700, fontSize: '14px' }}>
                    🔴
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: 'var(--sds-text-heading)',
                      }}
                    >
                      {item.title}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--sds-text-muted)',
                        fontFamily: 'var(--sds-font-mono)',
                      }}
                    >
                      {item.location.fileId}:L{item.location.line}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--sds-text-muted)',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      padding: '2px 8px',
                      borderRadius: 'var(--sds-radius-pill)',
                    }}
                  >
                    Estimated fix: {idx === 0 ? '2 min' : '3 min'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIssueId(item.id);
                      setIsInvestigating(true);
                    }}
                    className="sds-btn sds-btn-ghost"
                    style={{ fontSize: '11.5px', padding: '4px 8px' }}
                  >
                    Investigate →
                  </button>
                </div>
              </div>
            ))}

            {/* Safe Fixes Group block */}
            {fixableCount > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  backgroundColor: 'rgba(16, 185, 129, 0.04)',
                  border: '1px solid rgba(16, 185, 129, 0.15)',
                  borderRadius: 'var(--sds-radius-lg)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: 'var(--sds-success)', fontWeight: 700, fontSize: '14px' }}>
                    🟢
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: 'var(--sds-text-heading)',
                      }}
                    >
                      Apply Safe Fixes
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                      Automatically fix {fixableCount} warnings conforming to sandbox standards.
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                    Estimated fix: 20 sec
                  </span>
                  <button
                    onClick={() => handleApplySafeFixes()}
                    className="sds-btn"
                    style={{
                      fontSize: '11.5px',
                      padding: '5px 12px',
                      backgroundColor: 'var(--sds-success)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 'var(--sds-radius-md)',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Apply Fixes
                  </button>
                </div>
              </div>
            )}

            {/* Warnings */}
            {warningIssues.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedIssueId(item.id);
                  setIsInvestigating(true);
                }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  backgroundColor: 'var(--sds-surface)',
                  border: '1px solid var(--sds-border)',
                  borderRadius: 'var(--sds-radius-lg)',
                  cursor: 'pointer',
                  transition: 'all var(--sds-transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--sds-border-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--sds-border)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: 'var(--sds-warning)', fontWeight: 700, fontSize: '14px' }}>
                    🟡
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        color: 'var(--sds-text-heading)',
                      }}
                    >
                      {item.title}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--sds-text-muted)',
                        fontFamily: 'var(--sds-font-mono)',
                      }}
                    >
                      {item.location.fileId}:L{item.location.line}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--sds-text-muted)',
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      padding: '2px 8px',
                      borderRadius: 'var(--sds-radius-pill)',
                    }}
                  >
                    Estimated fix: 30 sec
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIssueId(item.id);
                      setIsInvestigating(true);
                    }}
                    className="sds-btn sds-btn-ghost"
                    style={{ fontSize: '11.5px', padding: '4px 8px' }}
                  >
                    Investigate →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeWorkspace === 'repository') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-24)' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--sds-text-heading)' }}>
              Local Repository Changes
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--sds-text-muted)', marginTop: '4px' }}>
              Compare workspace changes, inspect diffs, and review pre-commit status before
              committing.
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'var(--sds-surface)',
              border: '1px solid var(--sds-border)',
              borderRadius: 'var(--sds-radius-lg)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                  CURRENT BRANCH
                </span>
                <span
                  style={{ fontSize: '14px', fontWeight: 600, color: 'var(--sds-text-heading)' }}
                >
                  main
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleRunScan()}
                  className="sds-btn sds-btn-primary"
                  style={{ fontSize: '11px', padding: '6px 12px' }}
                >
                  Verify Changes
                </button>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'var(--sds-border)' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--sds-text-muted)' }}>
                MODIFIED FILES (3)
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  {
                    file: 'core/storage/Database.cpp',
                    type: 'staged',
                    changes: '+24 -12',
                    code: 'Database.cpp',
                  },
                  { file: 'ui/src/App.tsx', type: 'unstaged', changes: '+98 -42', code: 'App.tsx' },
                  {
                    file: 'tests/unit/test_fake_data.cpp',
                    type: 'unstaged',
                    changes: 'deleted',
                    code: 'test_fake_data.cpp',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedFile(item.code);
                      setBottomTab('git');
                      setIsBottomCollapsed(false);
                    }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--sds-border)',
                      borderRadius: 'var(--sds-radius-md)',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--sds-border-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--sds-border)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          backgroundColor:
                            item.type === 'staged'
                              ? 'rgba(16,185,129,0.12)'
                              : 'rgba(245,158,11,0.12)',
                          color:
                            item.type === 'staged' ? 'var(--sds-success)' : 'var(--sds-warning)',
                          padding: '2px 6px',
                          borderRadius: 'var(--sds-radius-sm)',
                        }}
                      >
                        {item.type.toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontSize: '13px',
                          color: 'var(--sds-text-heading)',
                          fontFamily: 'var(--sds-font-mono)',
                        }}
                      >
                        {item.file}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        color: 'var(--sds-text-muted)',
                        fontFamily: 'var(--sds-font-mono)',
                      }}
                    >
                      {item.changes}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeWorkspace === 'packs') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-24)' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--sds-text-heading)' }}>
              Installed Rule Packs
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--sds-text-muted)', marginTop: '4px' }}>
              Verify and configure static analysis standards enabled for pre-commit gates.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              {
                id: 'documentation',
                label: 'Documentation Standards',
                desc: 'Checks file headers, comment style, docstrings conformity.',
                enabled: true,
              },
              {
                id: 'misra',
                label: 'MISRA C++ Conformance Pack',
                desc: 'Validates automotive-grade safety guidelines, pointer restrictions, stack-allocation boundaries.',
                enabled: true,
              },
              {
                id: 'sqlite-security',
                label: 'SQLite Security Bindings (RFC-004)',
                desc: 'Validates parameterized placeholders, detects raw C++ SQL string concatenations.',
                enabled: true,
              },
              {
                id: 'company-rules',
                label: 'Enterprise Custom Checks',
                desc: 'Specific styling, naming guidelines, file directory structure checks.',
                enabled: false,
              },
            ].map((pack) => (
              <div
                key={pack.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  backgroundColor: 'var(--sds-surface)',
                  border: '1px solid var(--sds-border)',
                  borderRadius: 'var(--sds-radius-lg)',
                }}
              >
                <div>
                  <h4
                    style={{ fontSize: '14px', fontWeight: 600, color: 'var(--sds-text-heading)' }}
                  >
                    {pack.label}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--sds-text-muted)', marginTop: '4px' }}>
                    {pack.desc}
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: pack.enabled ? 'var(--sds-success)' : 'var(--sds-text-muted)',
                      backgroundColor: pack.enabled
                        ? 'rgba(16,185,129,0.12)'
                        : 'rgba(255,255,255,0.03)',
                      padding: '2px 8px',
                      borderRadius: 'var(--sds-radius-pill)',
                    }}
                  >
                    {pack.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => {}}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'var(--sds-text-muted)',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    ⚙ Configure
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActiveWorkspace('marketplace')}
            className="sds-btn sds-btn-primary"
            style={{ alignSelf: 'flex-start', marginTop: '12px' }}
          >
            Browse Extension Store →
          </button>
        </div>
      );
    }

    if (activeWorkspace === 'running') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-24)' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--sds-text-heading)' }}>
              Analysis Executions
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--sds-text-muted)', marginTop: '4px' }}>
              Check-by-check verification log of the active pre-commit gates.
            </p>
          </div>

          <div
            className="sds-card"
            style={{
              padding: 'var(--sds-space-20)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--sds-text-heading)' }}>
                {isScanning
                  ? `RUNNING SENTINEL CHECKS... ${scanProgress}%`
                  : 'VERIFICATION COMPLETE'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                docker-sandbox container
              </span>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
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
                  transition: 'width 0.15s ease',
                }}
              />
            </div>

            {/* Checkers Listing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                {
                  name: 'Documentation Checks',
                  status: 'Success',
                  icon: '✓',
                  color: 'var(--sds-success)',
                },
                {
                  name: 'MISRA C++ Validation Standards',
                  status: isScanning ? (scanProgress > 70 ? 'Success' : 'Running') : 'Success',
                  icon: isScanning ? (scanProgress > 70 ? '✓' : '■') : '✓',
                  color: isScanning
                    ? scanProgress > 70
                      ? 'var(--sds-success)'
                      : 'var(--sds-primary)'
                    : 'var(--sds-success)',
                },
                {
                  name: 'Cppcheck Code Audits',
                  status: isScanning ? (scanProgress > 40 ? 'Running' : 'Waiting') : 'Success',
                  icon: isScanning ? (scanProgress > 40 ? '■' : '●') : '✓',
                  color: isScanning
                    ? scanProgress > 40
                      ? 'var(--sds-primary)'
                      : 'var(--sds-text-muted)'
                    : 'var(--sds-success)',
                },
                {
                  name: 'SQLite Parameter Security checks',
                  status: isScanning ? 'Waiting' : 'Success',
                  icon: isScanning ? '●' : '✓',
                  color: isScanning ? 'var(--sds-text-muted)' : 'var(--sds-success)',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(0,0,0,0.12)',
                    borderRadius: 'var(--sds-radius-md)',
                    border: '1px solid var(--sds-border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: item.color, fontWeight: 700, fontSize: '13px' }}>
                      {item.icon}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--sds-text)', fontWeight: 500 }}>
                      {item.name}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: item.color, fontWeight: 600 }}>
                    {item.status.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeWorkspace === 'history') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-24)' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--sds-text-heading)' }}>
              Execution History
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--sds-text-muted)', marginTop: '4px' }}>
              Audit timeline of previous analysis runs and pre-commit checks.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                time: 'Today, 2:14 PM',
                status: 'Blocked',
                event: 'Scan finished: 2 issues detected (1 critical SQL injection blocker).',
                details: 'Commit aborted by pre-commit-check hook.',
              },
              {
                time: 'Yesterday, 4:32 PM',
                status: 'Success',
                event: 'Applied 12 Safe Fixes on local workspace.',
                details: 'Quality score improved +2.5%.',
              },
              {
                time: 'Yesterday, 10:15 AM',
                status: 'Success',
                event: 'Scan finished: 0 issues detected.',
                details: 'Ready to commit.',
              },
              {
                time: '3 days ago, 11:20 AM',
                status: 'Success',
                event: 'Initial workspace repository initialized.',
                details: 'Repository Sentinel mapped successfully.',
              },
            ].map((run, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '16px',
                  position: 'relative',
                  paddingLeft: '12px',
                }}
              >
                {idx !== 3 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '4px',
                      top: '20px',
                      bottom: '-20px',
                      width: '2px',
                      backgroundColor: 'var(--sds-border)',
                    }}
                  />
                )}
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor:
                      run.status === 'Blocked' ? 'var(--sds-danger)' : 'var(--sds-success)',
                    marginTop: '5px',
                    zIndex: 2,
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                    {run.time}
                  </span>
                  <span
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 600,
                      color: 'var(--sds-text-heading)',
                    }}
                  >
                    {run.event}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--sds-text)' }}>{run.details}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeWorkspace === 'marketplace') {
      return (
        <PluginMarketplace
          selectedPluginId={selectedPluginId}
          onPluginSelect={(p) => {
            setSelectedPluginId(p.id);
            setSelectedPlugin(p);
          }}
        />
      );
    }

    if (activeWorkspace === 'settings') {
      return <SettingsWorkspace theme={theme} onThemeToggle={handleToggleTheme} />;
    }

    return null;
  };

  // Right Panel Content
  const renderRightPanelContent = () => {
    if (activeWorkspace === 'queue' || activeWorkspace === 'repository') {
      if (isInvestigating) {
        // Deep Dive Investigation Details
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--sds-border)',
                paddingBottom: '8px',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--sds-text-heading)' }}>
                INVESTIGATION TABS
              </span>
            </div>

            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {(
                [
                  { id: 'summary', label: 'Summary' },
                  { id: 'why', label: 'Why Flow' },
                  { id: 'call_flow', label: 'Call Flow' },
                  { id: 'ownership', label: 'Ownership' },
                  { id: 'git', label: 'Git blame' },
                  { id: 'discussion', label: 'Review Notes' },
                ] as {
                  id:
                    | 'summary'
                    | 'why'
                    | 'call_flow'
                    | 'ownership'
                    | 'related'
                    | 'git'
                    | 'reasoning'
                    | 'docs'
                    | 'discussion';
                  label: string;
                }[]
              ).map((panel) => (
                <button
                  key={panel.id}
                  onClick={() => setActivePanel(panel.id)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11px',
                    borderRadius: 'var(--sds-radius-sm)',
                    border: 'none',
                    backgroundColor:
                      activePanel === panel.id ? 'var(--sds-primary)' : 'rgba(255,255,255,0.04)',
                    color: activePanel === panel.id ? '#fff' : 'var(--sds-text)',
                    cursor: 'pointer',
                  }}
                >
                  {panel.label}
                </button>
              ))}
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                fontSize: '13px',
              }}
            >
              {activePanel === 'summary' && selectedIssue && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }}>{selectedIssue.title}</h3>
                  <p style={{ color: 'var(--sds-text-muted)', lineHeight: '1.45' }}>
                    {selectedIssue.description}
                  </p>
                  <div>
                    <span
                      style={{
                        color: 'var(--sds-text-heading)',
                        fontWeight: 600,
                        display: 'block',
                      }}
                    >
                      Impact:
                    </span>
                    <span style={{ color: 'var(--sds-text-muted)' }}>{selectedIssue.impact}</span>
                  </div>
                  <div>
                    <span
                      style={{
                        color: 'var(--sds-text-heading)',
                        fontWeight: 600,
                        display: 'block',
                      }}
                    >
                      Recommended Fix:
                    </span>
                    <span style={{ color: 'var(--sds-text-muted)' }}>
                      {selectedIssue.fix?.description}
                    </span>
                  </div>
                </div>
              )}

              {activePanel === 'why' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }}>
                    Concurrency & Safety Diagnostics
                  </h3>
                  <div
                    style={{
                      padding: '10px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      borderRadius: 'var(--sds-radius-md)',
                      border: '1px solid var(--sds-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--sds-primary)', fontWeight: 600 }}>
                        1. INITIALIZE
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                        IpcServer.cpp:L35
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--sds-warning)', fontWeight: 600 }}>
                        2. READ DATA
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                        IpcServer.cpp:L42
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--sds-danger)', fontWeight: 600 }}>
                        3. INJECTION
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                        IpcServer.cpp:L45
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {activePanel === 'call_flow' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Call Trace Hierarchy</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {['main()', 'dispatch()', 'handleQuery()'].map((node, i) => (
                      <div
                        key={i}
                        onClick={() => setSelectedCallNode(node)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor:
                            selectedCallNode === node
                              ? 'rgba(99,102,241,0.1)'
                              : 'rgba(255,255,255,0.02)',
                          border: '1px solid',
                          borderColor:
                            selectedCallNode === node ? 'var(--sds-primary)' : 'var(--sds-border)',
                          borderRadius: 'var(--sds-radius-md)',
                          cursor: 'pointer',
                          fontFamily: 'var(--sds-font-mono)',
                          fontSize: '11.5px',
                        }}
                      >
                        {node}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePanel === 'ownership' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Pointer Lifespan Chart</h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      fontSize: '11.5px',
                    }}
                  >
                    <div
                      style={{ borderBottom: '1px solid var(--sds-border)', paddingBottom: '4px' }}
                    >
                      <strong style={{ color: 'var(--sds-primary)' }}>[ALLOCATE]</strong> Memory
                      buffer reserved.
                    </div>
                    <div
                      style={{ borderBottom: '1px solid var(--sds-border)', paddingBottom: '4px' }}
                    >
                      <strong style={{ color: 'var(--sds-warning)' }}>[TRANSFER]</strong> Scope
                      ownership passes.
                    </div>
                    <div>
                      <strong style={{ color: 'var(--sds-danger)' }}>[EXPIRE]</strong> Scope
                      variables go out of bounds.
                    </div>
                  </div>
                </div>
              )}

              {activePanel === 'git' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Git Blame History</h3>
                  <div
                    style={{
                      padding: '12px',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      borderRadius: 'var(--sds-radius-md)',
                      border: '1px solid var(--sds-border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '11.5px',
                        marginBottom: '4px',
                      }}
                    >
                      <strong>Sanket Ghodake</strong>
                      <span style={{ color: 'var(--sds-text-muted)' }}>2 days ago</span>
                    </div>
                    <code
                      style={{
                        fontSize: '11px',
                        color: 'var(--sds-primary)',
                        display: 'block',
                        marginBottom: '6px',
                      }}
                    >
                      commit e5f67b2d56
                    </code>
                    <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.4' }}>
                      "Initialize database query interface and add SQL routing callbacks"
                    </p>
                  </div>
                </div>
              )}

              {activePanel === 'discussion' && (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}
                >
                  <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Code Review Discussion</h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      flex: 1,
                      overflowY: 'auto',
                    }}
                  >
                    {comments.map((c, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '8px 10px',
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          borderRadius: 'var(--sds-radius-md)',
                          border: '1px solid var(--sds-border)',
                          fontSize: '12px',
                        }}
                      >
                        {c}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                    <input
                      type="text"
                      placeholder="Add comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      style={{
                        flex: 1,
                        backgroundColor: 'var(--sds-bg)',
                        border: '1px solid var(--sds-border)',
                        borderRadius: 'var(--sds-radius-sm)',
                        padding: '6px',
                        fontSize: '12px',
                        color: '#fff',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={() => {
                        if (newComment) {
                          setComments((prev) => [...prev, `Sanket: ${newComment}`]);
                          setNewComment('');
                        }
                      }}
                      className="sds-btn sds-btn-primary"
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                    >
                      Post
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }

      // Normal right panel details (Apple-settings / JetBrains style: cardless)
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-20)' }}>
          {selectedIssue ? (
            <>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--sds-text-muted)',
                    letterSpacing: '0.5px',
                  }}
                >
                  ISSUE DETAILS
                </span>
              </div>

              {/* Smart Explanation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <h4
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: 'var(--sds-text-heading)',
                    }}
                  >
                    Smart Explanation
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--sds-primary)', fontWeight: 600 }}>
                    {getConfidenceLevel(selectedIssue).score}% Confidence
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    fontSize: '12.5px',
                    lineHeight: '1.45',
                  }}
                >
                  <div>
                    <strong
                      style={{
                        color: 'var(--sds-text-heading)',
                        fontSize: '11.5px',
                        display: 'block',
                        marginBottom: '2px',
                      }}
                    >
                      Diagnostic Reasoning
                    </strong>
                    <p style={{ margin: '0', color: 'var(--sds-text)' }}>
                      {selectedIssue.description}
                    </p>
                  </div>
                  <div
                    style={{ height: '1px', backgroundColor: 'var(--sds-border)', margin: '4px 0' }}
                  />
                  <div>
                    <strong
                      style={{
                        color: 'var(--sds-text-heading)',
                        fontSize: '11.5px',
                        display: 'block',
                        marginBottom: '2px',
                      }}
                    >
                      Vulnerability Blast Radius
                    </strong>
                    <p style={{ margin: '0', color: 'var(--sds-text-muted)' }}>
                      {selectedIssue.impact}
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--sds-border)' }} />

              {/* Recommended Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <h4
                  style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--sds-text-heading)' }}
                >
                  Recommended Actions
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedIssue.fix && selectedIssue.status === 'Open' ? (
                    <button
                      onClick={() => handleApplyFix(selectedIssue.id)}
                      className="sds-btn sds-btn-primary"
                      style={{ justifyContent: 'center', width: '100%', fontSize: '12px' }}
                    >
                      Apply Automated Safe Fix
                    </button>
                  ) : (
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--sds-success)',
                        textAlign: 'center',
                        padding: '4px',
                      }}
                    >
                      ✓ Warning resolved or deferred.
                    </div>
                  )}
                  <button
                    onClick={() => setIsInvestigating(true)}
                    className="sds-btn sds-btn-secondary"
                    style={{ justifyContent: 'center', width: '100%', fontSize: '12px' }}
                  >
                    Enter Investigation Mode (Explain)
                  </button>

                  {selectedIssue.status === 'Open' && (
                    <button
                      onClick={() => setShowIgnoreModal(selectedIssue.id)}
                      className="sds-btn sds-btn-secondary"
                      style={{
                        justifyContent: 'center',
                        width: '100%',
                        color: 'var(--sds-text-muted)',
                        fontSize: '12px',
                      }}
                    >
                      Ignore / Defer Warning
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                padding: '24px 0',
              }}
            >
              <HelpCircle size={24} color="var(--sds-text-muted)" />
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--sds-text-heading)',
                    display: 'block',
                  }}
                >
                  No Issue Selected
                </span>
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--sds-text-muted)',
                    display: 'block',
                    marginTop: '4px',
                  }}
                >
                  Select an item from the work queue to inspect detailed static check diagnostics.
                </span>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // ----------------------------------------------------
  // FINAL LAYOUT SHELL RENDERING
  // ----------------------------------------------------

  return (
    <div
      className="sds-shell"
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}
    >
      {/* Top Header Bar Toolbar */}
      <Topbar
        projects={projects}
        activeProjectId={activeProjectId}
        onProjectChange={handleProjectChange}
        activeWorkspace={activeWorkspace}
        onWorkspaceChange={(ws) => {
          setActiveWorkspace(ws);
          if (ws !== 'issues') {
            setIsInvestigating(false);
          }
        }}
        scope={scope}
        onScopeChange={setScope}
        onRunScan={handleRunScan}
        onStopScan={handleStopScan}
        isScanning={isScanning}
        scanProgress={scanProgress}
        blockingIssuesCount={
          issues.filter(
            (i) =>
              (i.severity === 'Critical' || i.severity === 'High') &&
              i.status === 'Open' &&
              !ignoredIssues[i.id],
          ).length
        }
        onSearchClick={() => setIsSearchOpen(true)}
        onProfileClick={() => setIsRightCollapsed((prev) => !prev)}
      />

      {/* Main Grid: Left Panel | Center Panel with Bottom Drawer | Right Panel */}
      <div
        className="sds-main-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `${isLeftCollapsed ? '0px' : '260px'} 1fr ${isRightCollapsed ? '0px' : '360px'}`,
          flex: 1,
          overflow: 'hidden',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Left Panel */}
        <aside
          style={{
            backgroundColor: 'var(--sds-surface)',
            borderRight: '1px solid var(--sds-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: isLeftCollapsed ? '0px' : 'var(--sds-space-16)',
            opacity: isLeftCollapsed ? 0 : 1,
            pointerEvents: isLeftCollapsed ? 'none' : 'auto',
            transition: 'all 0.25s ease',
          }}
        >
          {renderLeftPanelContent()}
        </aside>

        {/* Center Panel (Core Area & Bottom Tabbed Drawer) */}
        <main
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: 'var(--sds-bg)',
            position: 'relative',
          }}
        >
          {/* Main workspace scrollable content */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 'var(--sds-space-24)',
            }}
          >
            {renderCenterPanelContent()}
          </div>

          {/* Bottom Drawer indicator / toggle bar */}
          <div
            style={{
              height: isBottomCollapsed ? '32px' : '280px',
              borderTop: '1px solid var(--sds-border)',
              backgroundColor: 'var(--sds-surface)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: 'rgba(0,0,0,0.1)',
                padding: '0 16px',
                height: '32px',
                borderBottom: '1px solid var(--sds-border)',
                cursor: 'pointer',
              }}
              onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
            >
              <span
                style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--sds-text-heading)' }}
              >
                {isBottomCollapsed ? '▲ Expand Context Drawer' : '▼ Collapse Drawer'}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--sds-text-muted)' }}>Ctrl+`</span>
            </div>

            {!isBottomCollapsed && (
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <BottomDrawer
                  selectedIssue={selectedIssue}
                  selectedFile={selectedFile}
                  activeTab={bottomTab}
                  onTabChange={setBottomTab}
                  isScanning={isScanning}
                  scanProgress={scanProgress}
                  onApplyFix={handleApplyFix}
                />
              </div>
            )}
          </div>
        </main>

        {/* Right Panel */}
        <aside
          style={{
            backgroundColor: 'var(--sds-surface)',
            borderLeft: '1px solid var(--sds-border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: isRightCollapsed ? '0px' : 'var(--sds-space-16)',
            opacity: isRightCollapsed ? 0 : 1,
            pointerEvents: isRightCollapsed ? 'none' : 'auto',
            transition: 'all 0.25s ease',
          }}
        >
          {renderRightPanelContent()}
        </aside>
      </div>

      {/* Bottom Status bar */}
      <Statusbar
        isScanning={isScanning}
        branchName={activeProject?.branch || 'main'}
        lastScanTime={lastScanTime}
        activeProfile="Default"
        activeAnalyzerCount={activeProject?.plugins?.length || 3}
      />

      {/* Global Modals (Ctrl+K and Ctrl+Shift+P) */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        projects={projects}
        issues={issues}
        onSelectProject={handleProjectChange}
        onSelectIssue={(id) => {
          setSelectedIssueId(id);
          setIsInvestigating(true);
        }}
        onNavigateToWorkspace={(ws) => {
          setActiveWorkspace(ws);
          if (ws !== 'issues') setIsInvestigating(false);
        }}
      />

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onRunFullScan={handleRunScan}
        onApplySafeFixes={handleApplySafeFixes}
        onToggleTheme={handleToggleTheme}
        onNavigateToWorkspace={(ws) => {
          setActiveWorkspace(ws);
          if (ws !== 'issues') setIsInvestigating(false);
        }}
      />

      {/* Ignore Modal */}
      {showIgnoreModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            className="sds-card"
            style={{
              padding: 'var(--sds-space-24)',
              maxWidth: '400px',
              width: '90%',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--sds-text-heading)' }}>
              Ignore Issue Warning
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--sds-text-muted)' }}>
              Please provide a deferral reason to ignore this warning on pre-commit security audits.
            </p>
            <input
              type="text"
              placeholder="e.g. False positive, internal mock only"
              value={ignoreReason}
              onChange={(e) => setIgnoreReason(e.target.value)}
              style={{
                width: '100%',
                backgroundColor: 'var(--sds-bg)',
                border: '1px solid var(--sds-border)',
                borderRadius: 'var(--sds-radius-md)',
                padding: '8px 12px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowIgnoreModal(null)}
                className="sds-btn sds-btn-secondary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleIgnoreSubmit}
                className="sds-btn sds-btn-primary"
                style={{ padding: '6px 12px', fontSize: '12px' }}
              >
                Confirm Ignore
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
