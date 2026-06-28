import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Statusbar } from './components/Statusbar';
import { Inspector } from './components/Inspector';
import { DiffViewer } from './components/DiffViewer';
import { SearchModal } from './components/SearchModal';
import { CommandPalette } from './components/CommandPalette';
import { HomeWorkspace } from './components/HomeWorkspace';
import { AnalyzeWorkspace } from './components/AnalyzeWorkspace';
import { MockClient } from './services/mockClient';
import { QtBridgeClient } from './services/qtBridgeClient';
import type { InspectorObject } from './components/Inspector';
import type {
  Project,
  Issue,
  ScanStartedEvent,
  IssueFoundEvent,
  ScanCompletedEvent,
  ClientApi,
} from './services/clientApi';
import { FileCode, Folder, ToggleLeft, ToggleRight } from 'lucide-react';

const isQt = typeof window.qt !== 'undefined';
const client: ClientApi = isQt ? new QtBridgeClient() : new MockClient();

const workspaceTitles: { [key: string]: string } = {
  home: 'Home Dashboard',
  codebase: 'Codebase Workspace',
  analyze: 'Issues Queue',
  improve: 'Improvement Workspace',
  insights: 'Quality Insights',
  extensions: 'Extension Manager',
  settings: 'Configuration Settings',
};

function App() {
  const [activeWorkspace, setActiveWorkspace] = useState('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Shell Layout and Dialog States
  const [inspectorObject, setInspectorObject] = useState<InspectorObject | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lastScanTime, setLastScanTime] = useState('Just now');

  // Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Load projects initially
  useEffect(() => {
    async function load() {
      const projs = await client.GetProjects();
      setProjects(projs);
      if (projs.length > 0) {
        setActiveProjectId(projs[0].id);
        setInspectorObject({ type: 'project', data: projs[0] });
      }
    }
    load();
  }, []);

  // Reload issues when active project changes
  useEffect(() => {
    if (!activeProjectId) return;
    async function loadIssues() {
      const list = await client.GetIssues(activeProjectId);
      setIssues(list);
      if (list.length > 0) {
        setSelectedIssueId(list[0].id);
        setInspectorObject({ type: 'issue', data: list[0] });
      } else {
        setSelectedIssueId(null);
        const activeProj = projects.find((p) => p.id === activeProjectId);
        if (activeProj) {
          setInspectorObject({ type: 'project', data: activeProj });
        } else {
          setInspectorObject(null);
        }
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

  // Automatically select default inspector context when active workspace changes
  useEffect(() => {
    if (activeWorkspace === 'home') {
      setInspectorObject({ type: 'home_context', data: {} });
    } else if (activeWorkspace === 'codebase') {
      const activeProj = projects.find((p) => p.id === activeProjectId);
      if (activeProj) {
        setInspectorObject({ type: 'project', data: activeProj });
      }
    } else if (activeWorkspace === 'analyze') {
      const iss = issues.find((i) => i.id === selectedIssueId) || issues[0];
      if (iss) {
        setSelectedIssueId(iss.id);
        setInspectorObject({ type: 'issue', data: iss });
      }
    } else if (activeWorkspace === 'extensions') {
      setInspectorObject({
        type: 'plugin',
        data: {
          name: 'cppcheck',
          version: '2.13',
          description:
            'Static analysis tool for C/C++ code. Detects bugs, memory leaks, and undefined behavior.',
          status: 'Active',
          category: 'Static Analyzer',
        },
      });
    } else {
      setInspectorObject(null);
    }
  }, [activeWorkspace, projects, activeProjectId]);

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

  const handleProjectChange = (id: string) => {
    setActiveProjectId(id);
    const proj = projects.find((p) => p.id === id);
    if (proj) {
      setInspectorObject({ type: 'project', data: proj });
    }
  };

  const handleRunScan = async () => {
    if (!activeProjectId) return;
    setIsScanning(true);
    setScanProgress(0);

    await client.RunScan(
      activeProjectId,
      (
        event:
          | ScanStartedEvent
          | IssueFoundEvent
          | ScanCompletedEvent
          | { type: 'progress'; progress: number },
      ) => {
        if (event.type === 'progress') {
          setScanProgress(event.progress);
        } else if (event.type === 'ScanCompleted') {
          setIsScanning(false);
          setScanProgress(100);
          // Refresh project data and issues list
          client.GetProjects().then((updatedProjs) => {
            setProjects(updatedProjs);
            const activeProj = updatedProjs.find((p) => p.id === activeProjectId);
            if (activeProj) {
              setInspectorObject({ type: 'project', data: activeProj });
            }
          });
          client.GetIssues(activeProjectId).then((list) => {
            setIssues(list);
            if (list.length > 0 && !selectedIssueId) {
              setSelectedIssueId(list[list.length - 1].id);
              setInspectorObject({ type: 'issue', data: list[list.length - 1] });
            }
          });
        }
      },
    );
  };

  const handleApplyFix = async (issueId: string) => {
    try {
      const success = await client.ApplyAutofix(issueId);
      if (success) {
        // Refresh project and issues state
        const updatedProjs = await client.GetProjects();
        setProjects(updatedProjs);
        const updatedIssues = await client.GetIssues(activeProjectId);
        setIssues(updatedIssues);
        const currentIssue = updatedIssues.find((i) => i.id === issueId);
        if (currentIssue) {
          setInspectorObject({ type: 'issue', data: currentIssue });
        }
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
      // Ctrl+F -> Search/Filter Focus
      else if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        // Shift workspace to Analyze & focus filter query
        setActiveWorkspace('analyze');
        const filterInput = document.getElementById('local-search-input');
        if (filterInput) {
          filterInput.focus();
        }
      }
      // Esc -> Close search, palette, or inspector
      else if (e.key === 'Escape') {
        if (isSearchOpen) {
          setIsSearchOpen(false);
        } else if (isPaletteOpen) {
          setIsPaletteOpen(false);
        } else {
          setInspectorObject(null);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [activeProjectId, isSearchOpen, isPaletteOpen]);

  const activeProject = projects.find((p) => p.id === activeProjectId);
  const selectedIssue = issues.find((i) => i.id === selectedIssueId) || null;

  // Render sub-workspaces
  const renderWorkspaceContent = () => {
    if (!activeProject) {
      return (
        <div style={{ color: 'var(--sds-text-muted)', textAlign: 'center', marginTop: '100px' }}>
          Loading active project workspace...
        </div>
      );
    }

    switch (activeWorkspace) {
      case 'home': {
        return (
          <HomeWorkspace
            activeProject={activeProject}
            projects={projects}
            issues={issues}
            isScanning={isScanning}
            onRunScan={handleRunScan}
            setActiveWorkspace={setActiveWorkspace}
            setInspectorObject={setInspectorObject}
            onProjectChange={handleProjectChange}
          />
        );
      }

      case 'codebase':
        return (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '260px 1fr',
              gap: 'var(--sds-space-24)',
              flex: 1,
            }}
          >
            {/* Folder Tree Panel */}
            <div className="sds-card" style={{ padding: 'var(--sds-space-16)' }}>
              <h3 style={{ fontSize: '14px', marginBottom: 'var(--sds-space-12)' }}>
                Folder Structure
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-8)' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'var(--sds-text-heading)',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    setInspectorObject({
                      type: 'folder',
                      data: { name: 'core', path: 'core/', subdirsCount: 2, filesCount: 4 },
                    })
                  }
                >
                  <Folder size={14} color="var(--sds-primary)" />
                  <span>core/</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'var(--sds-text)',
                    marginLeft: '16px',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    setInspectorObject({
                      type: 'folder',
                      data: {
                        name: 'event_bus',
                        path: 'core/event_bus/',
                        subdirsCount: 0,
                        filesCount: 2,
                      },
                    })
                  }
                >
                  <Folder size={14} color="var(--sds-primary)" />
                  <span>event_bus/</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'var(--sds-text)',
                    marginLeft: '16px',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    setInspectorObject({
                      type: 'folder',
                      data: {
                        name: 'fake_data',
                        path: 'core/fake_data/',
                        subdirsCount: 0,
                        filesCount: 2,
                      },
                    })
                  }
                >
                  <Folder size={14} color="var(--sds-primary)" />
                  <span>fake_data/</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'var(--sds-text)',
                    marginLeft: '32px',
                    fontFamily: 'var(--sds-font-mono)',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    setInspectorObject({
                      type: 'file',
                      data: {
                        name: 'FakeClientApi.cpp',
                        path: 'core/fake_data/FakeClientApi.cpp',
                        issuesCount: 1,
                        loc: 145,
                      },
                    })
                  }
                >
                  <FileCode size={12} color="var(--sds-text-muted)" />
                  <span>FakeClientApi.cpp</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'var(--sds-text-heading)',
                    fontWeight: 500,
                    marginTop: '4px',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    setInspectorObject({
                      type: 'folder',
                      data: { name: 'apps', path: 'apps/', subdirsCount: 1, filesCount: 1 },
                    })
                  }
                >
                  <Folder size={14} color="var(--sds-primary)" />
                  <span>apps/</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'var(--sds-text)',
                    marginLeft: '16px',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    setInspectorObject({
                      type: 'folder',
                      data: {
                        name: 'desktop',
                        path: 'apps/desktop/',
                        subdirsCount: 1,
                        filesCount: 3,
                      },
                    })
                  }
                >
                  <Folder size={14} color="var(--sds-primary)" />
                  <span>desktop/</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'var(--sds-text)',
                    marginLeft: '32px',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    setInspectorObject({
                      type: 'folder',
                      data: {
                        name: 'frontend',
                        path: 'apps/desktop/frontend/',
                        subdirsCount: 2,
                        filesCount: 8,
                      },
                    })
                  }
                >
                  <Folder size={14} color="var(--sds-primary)" />
                  <span>frontend/</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '13px',
                    color: 'var(--sds-text)',
                    marginLeft: '48px',
                    fontFamily: 'var(--sds-font-mono)',
                    cursor: 'pointer',
                  }}
                  onClick={() =>
                    setInspectorObject({
                      type: 'file',
                      data: {
                        name: 'App.tsx',
                        path: 'apps/desktop/frontend/src/App.tsx',
                        issuesCount: 0,
                        loc: 1143,
                      },
                    })
                  }
                >
                  <FileCode size={12} color="var(--sds-primary)" />
                  <span>App.tsx</span>
                </div>
              </div>
            </div>

            {/* Codebase Dependency Graph Card */}
            <div
              className="sds-card"
              style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-16)' }}
            >
              <h3>Architecture Map</h3>
              <p style={{ fontSize: '13px', color: 'var(--sds-text-muted)' }}>
                Visual graph showing the core modules dependencies and link weights.
              </p>
              {/* Graphical SVG Schema */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  border: '1px dashed var(--sds-border)',
                  borderRadius: 'var(--sds-radius-md)',
                  position: 'relative',
                }}
              >
                <svg width="400" height="240" viewBox="0 0 400 240">
                  {/* Edges */}
                  <line
                    x1="80"
                    y1="120"
                    x2="200"
                    y2="60"
                    stroke="var(--sds-border-hover)"
                    strokeWidth="2"
                  />
                  <line
                    x1="80"
                    y1="120"
                    x2="200"
                    y2="180"
                    stroke="var(--sds-border-hover)"
                    strokeWidth="2"
                  />
                  <line
                    x1="200"
                    y1="60"
                    x2="320"
                    y2="120"
                    stroke="var(--sds-primary)"
                    strokeWidth="3"
                  />
                  <line
                    x1="200"
                    y1="180"
                    x2="320"
                    y2="120"
                    stroke="var(--sds-border-hover)"
                    strokeWidth="2"
                  />
                  {/* Nodes */}
                  <circle
                    cx="80"
                    cy="120"
                    r="24"
                    fill="var(--sds-surface-hover)"
                    stroke="var(--sds-border)"
                    strokeWidth="2"
                  />
                  <text
                    x="80"
                    y="124"
                    fill="var(--sds-text)"
                    fontSize="9"
                    textAnchor="middle"
                    fontFamily="var(--sds-font-mono)"
                  >
                    CLI/App
                  </text>

                  <circle
                    cx="200"
                    cy="60"
                    r="28"
                    fill="var(--sds-surface-active)"
                    stroke="var(--sds-primary)"
                    strokeWidth="2"
                  />
                  <text
                    x="200"
                    y="64"
                    fill="var(--sds-text-heading)"
                    fontSize="9"
                    textAnchor="middle"
                    fontFamily="var(--sds-font-mono)"
                  >
                    EventBus
                  </text>

                  <circle
                    cx="200"
                    cy="180"
                    r="28"
                    fill="var(--sds-surface-hover)"
                    stroke="var(--sds-border)"
                    strokeWidth="2"
                  />
                  <text
                    x="200"
                    y="184"
                    fill="var(--sds-text)"
                    fontSize="9"
                    textAnchor="middle"
                    fontFamily="var(--sds-font-mono)"
                  >
                    FakeAPI
                  </text>

                  <circle
                    cx="320"
                    cy="120"
                    r="32"
                    fill="var(--sds-primary)"
                    stroke="var(--sds-primary-hover)"
                    strokeWidth="2"
                  />
                  <text
                    x="320"
                    y="124"
                    fill="#fff"
                    fontSize="10"
                    fontWeight="600"
                    textAnchor="middle"
                    fontFamily="var(--sds-font-mono)"
                  >
                    CoreEngine
                  </text>
                </svg>
              </div>
            </div>
          </div>
        );

      case 'analyze': {
        return (
          <AnalyzeWorkspace
            activeProject={activeProject}
            issues={issues}
            selectedIssueId={selectedIssueId}
            setSelectedIssueId={setSelectedIssueId}
            setInspectorObject={setInspectorObject}
            onApplyFix={handleApplyFix}
            isScanning={isScanning}
            onRunScan={handleRunScan}
            setActiveWorkspace={setActiveWorkspace}
          />
        );
      }

      case 'improve':
        if (!selectedIssue || !selectedIssue.fix) {
          return (
            <div
              className="sds-card"
              style={{ textAlign: 'center', padding: 'var(--sds-space-64)' }}
            >
              <h3>No improvement selected</h3>
              <p style={{ color: 'var(--sds-text-muted)', marginTop: 'var(--sds-space-8)' }}>
                Select an issue with an available improvement in the Analyze page first.
              </p>
              <button
                onClick={() => setActiveWorkspace('analyze')}
                className="sds-btn sds-btn-primary"
                style={{ marginTop: 'var(--sds-space-16)' }}
              >
                Go to Issues Queue
              </button>
            </div>
          );
        }

        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sds-space-16)',
              flex: 1,
            }}
          >
            <div>
              <h3>Improvement Workspace</h3>
              <p style={{ fontSize: '13px', color: 'var(--sds-text-muted)' }}>
                Verify and apply automated diff changes to files under the Docker container
                workspace.
              </p>
            </div>
            <DiffViewer
              previewText={selectedIssue.fix.actions[0]?.preview || ''}
              status={selectedIssue.status}
              onApply={async () => {
                await handleApplyFix(selectedIssue.id);
              }}
              onCancel={() => setActiveWorkspace('analyze')}
            />
          </div>
        );

      case 'insights':
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sds-space-24)',
              flex: 1,
            }}
          >
            <h3>Quality Trend Analytics</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr',
                gap: 'var(--sds-space-24)',
              }}
            >
              {/* Quality Trend Line Graph */}
              <div
                className="sds-card"
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-16)' }}
              >
                <h4>Quality History Score</h4>
                <div
                  style={{
                    height: '200px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    paddingBottom: '20px',
                    position: 'relative',
                    borderLeft: '1px solid var(--sds-border)',
                    borderBottom: '1px solid var(--sds-border)',
                  }}
                >
                  {/* SVG Line representation of Quality trend */}
                  <svg
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  >
                    <path
                      d="M 50 150 L 150 120 L 250 80 L 350 40"
                      fill="none"
                      stroke="var(--sds-primary)"
                      strokeWidth="3"
                    />
                    {/* Points */}
                    <circle cx="50" cy="150" r="5" fill="var(--sds-primary)" />
                    <circle cx="150" cy="120" r="5" fill="var(--sds-primary)" />
                    <circle cx="250" cy="80" r="5" fill="var(--sds-primary)" />
                    <circle cx="350" cy="40" r="5" fill="var(--sds-primary)" />
                  </svg>
                  {/* Axis labels */}
                  <div
                    style={{ position: 'absolute', bottom: '0px', left: '40px', fontSize: '10px' }}
                  >
                    Commit-a1
                  </div>
                  <div
                    style={{ position: 'absolute', bottom: '0px', left: '140px', fontSize: '10px' }}
                  >
                    Commit-b2
                  </div>
                  <div
                    style={{ position: 'absolute', bottom: '0px', left: '240px', fontSize: '10px' }}
                  >
                    Commit-c3
                  </div>
                  <div
                    style={{ position: 'absolute', bottom: '0px', left: '340px', fontSize: '10px' }}
                  >
                    Latest Scan
                  </div>
                </div>
              </div>

              {/* Issues by categories */}
              <div
                className="sds-card"
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-16)' }}
              >
                <h4>Issue Distributions</h4>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-16)' }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        marginBottom: '4px',
                      }}
                    >
                      <span>Security</span>
                      <span>{issues.filter((i) => i.category === 'Security').length} items</span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        backgroundColor: 'var(--sds-border)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: issues.some((i) => i.category === 'Security') ? '60%' : '0%',
                          height: '100%',
                          backgroundColor: 'var(--sds-danger)',
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        marginBottom: '4px',
                      }}
                    >
                      <span>Style Conformance</span>
                      <span>{issues.filter((i) => i.category === 'Style').length} items</span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        backgroundColor: 'var(--sds-border)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: '80%',
                          height: '100%',
                          backgroundColor: 'var(--sds-warning)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'extensions':
        return (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sds-space-24)',
              flex: 1,
            }}
          >
            <h3>Installed Extensions & Analyzers</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 'var(--sds-space-16)',
              }}
            >
              {/* Plugin 1: Cppcheck */}
              <div
                className="sds-card"
                onClick={() =>
                  setInspectorObject({
                    type: 'plugin',
                    data: {
                      name: 'cppcheck',
                      version: '2.13',
                      description:
                        'Static analysis tool for C/C++ code. Detects bugs, memory leaks, and undefined behavior.',
                      status: 'Active',
                      category: 'Static Analyzer',
                    },
                  })
                }
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--sds-space-12)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <h4 style={{ fontSize: '15px' }}>cppcheck</h4>
                  <ToggleRight size={24} color="var(--sds-success)" style={{ cursor: 'pointer' }} />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--sds-text-muted)', lineHeight: '1.4' }}>
                  Static analysis tool for C/C++ code. Detects bugs, memory leaks, and undefined
                  behavior.
                </p>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--sds-primary)',
                    fontWeight: 500,
                    marginTop: 'auto',
                  }}
                >
                  Version 2.13 (Active)
                </div>
              </div>

              {/* Plugin 2: Clang-Tidy */}
              <div
                className="sds-card"
                onClick={() =>
                  setInspectorObject({
                    type: 'plugin',
                    data: {
                      name: 'clang-tidy',
                      version: '17.0',
                      description:
                        'LLVM-based C++ linter tool providing diagnosis and automated corrections for style, performance, and API misuse.',
                      status: 'Active',
                      category: 'LLVM Compiler Linter',
                    },
                  })
                }
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--sds-space-12)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <h4 style={{ fontSize: '15px' }}>clang-tidy</h4>
                  <ToggleRight size={24} color="var(--sds-success)" style={{ cursor: 'pointer' }} />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--sds-text-muted)', lineHeight: '1.4' }}>
                  LLVM-based C++ linter tool providing diagnosis and automated corrections for
                  style, performance, and API misuse.
                </p>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--sds-primary)',
                    fontWeight: 500,
                    marginTop: 'auto',
                  }}
                >
                  Version 17.0 (Active)
                </div>
              </div>

              {/* Plugin 3: ESLint */}
              <div
                className="sds-card"
                onClick={() =>
                  setInspectorObject({
                    type: 'plugin',
                    data: {
                      name: 'eslint-plugin',
                      version: '8.56',
                      description:
                        'Pluggable JavaScript/TypeScript linter finding patterns and bugs in Node/React codebases.',
                      status: 'Active',
                      category: 'JS/TS Linter',
                    },
                  })
                }
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--sds-space-12)',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <h4 style={{ fontSize: '15px' }}>eslint-plugin</h4>
                  <ToggleRight size={24} color="var(--sds-success)" style={{ cursor: 'pointer' }} />
                </div>
                <p style={{ fontSize: '12px', color: 'var(--sds-text-muted)', lineHeight: '1.4' }}>
                  Pluggable JavaScript/TypeScript linter finding patterns and bugs in Node/React
                  codebases.
                </p>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--sds-primary)',
                    fontWeight: 500,
                    marginTop: 'auto',
                  }}
                >
                  Version 8.56 (Active)
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div
            className="sds-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sds-space-24)',
              maxWidth: '500px',
            }}
          >
            <h3>Global Configuration Profile</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-16)' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: 'var(--sds-text-muted)',
                    marginBottom: '4px',
                  }}
                >
                  Active Profile
                </label>
                <select
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--sds-bg)',
                    border: '1px solid var(--sds-border)',
                    borderRadius: 'var(--sds-radius-md)',
                    padding: '8px',
                    color: '#fff',
                  }}
                >
                  <option>Default (Security & Style)</option>
                  <option>Strict (Compile Warnings & All checks)</option>
                </select>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid var(--sds-border)',
                  paddingTop: 'var(--sds-space-16)',
                }}
              >
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--sds-text-heading)' }}>
                    Auto-scan on save
                  </span>
                  <p style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                    Automatically trigger scan when modifying workspace files
                  </p>
                </div>
                <ToggleLeft size={24} style={{ cursor: 'pointer' }} />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="sds-shell">
      {/* Top Header Bar */}
      <Topbar
        projects={projects}
        activeProjectId={activeProjectId}
        onProjectChange={handleProjectChange}
        onRunScan={handleRunScan}
        isScanning={isScanning}
        scanProgress={scanProgress}
        activeWorkspaceTitle={workspaceTitles[activeWorkspace] || activeWorkspace}
        onSearchClick={() => setIsSearchOpen(true)}
        onProfileClick={() => setInspectorObject({ type: 'profile', data: {} })}
      />

      {/* Main Grid: Navigation (left) - Workspace (center) - Inspector (right) */}
      <div className="sds-main-grid">
        <Sidebar
          activeItem={activeWorkspace}
          onItemSelect={setActiveWorkspace}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed((c) => !c)}
          openIssuesCount={issues.filter((i) => i.status === 'Open').length}
          autofixesCount={issues.filter((i) => i.status === 'Open' && i.fix).length}
        />
        <main className="sds-workspace">{renderWorkspaceContent()}</main>
        <Inspector
          inspectorObject={inspectorObject}
          onApplyFix={handleApplyFix}
          isApplying={false}
          onNavigateToImprove={() => setActiveWorkspace('improve')}
          onClose={() => setInspectorObject(null)}
        />
      </div>

      {/* Bottom Status Indicator Bar */}
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
          const iss = issues.find((i) => i.id === id);
          if (iss) setInspectorObject({ type: 'issue', data: iss });
        }}
        onNavigateToWorkspace={setActiveWorkspace}
      />

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onRunFullScan={handleRunScan}
        onApplySafeFixes={handleApplySafeFixes}
        onToggleTheme={handleToggleTheme}
        onNavigateToWorkspace={setActiveWorkspace}
      />
    </div>
  );
}

export default App;
