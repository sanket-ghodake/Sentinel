import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ArrowRight,
  ChevronRight,
  Wrench,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Info,
  History,
  FileCode,
  GitCommit,
} from 'lucide-react';
import type { Project, Issue } from '../services/clientApi';
import type { InspectorObject } from './Inspector';

interface AnalyzeWorkspaceProps {
  activeProject: Project;
  issues: Issue[];
  selectedIssueId: string | null;
  setSelectedIssueId: (id: string | null) => void;
  setInspectorObject: (obj: InspectorObject | null) => void;
  onApplyFix: (id: string) => Promise<void>;
  isScanning: boolean;
  onRunScan: () => void;
  setActiveWorkspace: (ws: string) => void;
}

export const AnalyzeWorkspace: React.FC<AnalyzeWorkspaceProps> = ({
  activeProject,
  issues,
  selectedIssueId,
  setSelectedIssueId,
  setInspectorObject,
  onApplyFix,
  isScanning,
  onRunScan,
  setActiveWorkspace,
}) => {
  // Filters & State
  const [activeDomainFilter, setActiveDomainFilter] = useState<string | null>(null);
  const [activeSmartFilter, setActiveSmartFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInvestigating, setIsInvestigating] = useState(false);
  const [ignoredIssues, setIgnoredIssues] = useState<Record<string, string>>({});
  const [showIgnoreModal, setShowIgnoreModal] = useState<string | null>(null);
  const [ignoreReason, setIgnoreReason] = useState<string>('False Positive');

  // Sync selected issue change with Inspector object
  useEffect(() => {
    if (selectedIssueId) {
      const issue = issues.find((i) => i.id === selectedIssueId);
      if (issue) {
        setInspectorObject({ type: 'issue', data: issue });
      }
    }
  }, [selectedIssueId, issues]);

  // Keyboard Navigation: J, K, E, P, A, I
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'SELECT'
      ) {
        return;
      }

      if (issues.length === 0) return;

      const activeIssuesList = filteredIssues;
      const currentIndex = activeIssuesList.findIndex((i) => i.id === selectedIssueId);

      switch (e.key.toLowerCase()) {
        case 'j': // Next Issue
          e.preventDefault();
          if (currentIndex < activeIssuesList.length - 1) {
            const nextIssue = activeIssuesList[currentIndex + 1];
            setSelectedIssueId(nextIssue.id);
          }
          break;
        case 'k': // Previous Issue
          e.preventDefault();
          if (currentIndex > 0) {
            const prevIssue = activeIssuesList[currentIndex - 1];
            setSelectedIssueId(prevIssue.id);
          }
          break;
        case 'e': // Explain / Investigation Mode
          e.preventDefault();
          if (selectedIssueId) {
            setIsInvestigating(true);
          }
          break;
        case 'p': // Preview
          e.preventDefault();
          if (selectedIssueId) {
            const issue = issues.find((i) => i.id === selectedIssueId);
            if (issue && issue.fix) {
              setActiveWorkspace('improve');
            }
          }
          break;
        case 'a': // Apply Fix
          e.preventDefault();
          if (selectedIssueId) {
            const issue = issues.find((i) => i.id === selectedIssueId);
            if (issue && issue.fix && issue.status === 'Open') {
              onApplyFix(selectedIssueId);
            }
          }
          break;
        case 'i': // Ignore
          e.preventDefault();
          if (selectedIssueId) {
            setShowIgnoreModal(selectedIssueId);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [selectedIssueId, issues, searchQuery, activeSmartFilter, activeDomainFilter]);

  // Derived Values
  const openIssues = issues.filter((i) => i.status === 'Open' && !ignoredIssues[i.id]);
  const blockingIssues = openIssues.filter(
    (i) => i.severity === 'Critical' || i.severity === 'High',
  );
  const safeFixes = openIssues.filter((i) => i.fix);

  // Confidence calculations based on mock criteria
  const getConfidenceLevel = (issue: Issue) => {
    if (issue.ruleId === 'rule-sql-injection')
      return { score: 87, label: 'Preview required', color: 'var(--sds-warning)' };
    if (issue.ruleId === 'rule-unused-variable')
      return { score: 99, label: 'Safe to Auto Apply', color: 'var(--sds-success)' };
    if (issue.ruleId === 'rule-console-log')
      return { score: 95, label: 'Safe to Auto Apply', color: 'var(--sds-success)' };
    if (issue.ruleId === 'rule-unused-include')
      return { score: 99, label: 'Safe to Auto Apply', color: 'var(--sds-success)' };
    return { score: 72, label: 'Manual review required', color: 'var(--sds-danger)' };
  };

  // Effort estimation
  const getIssueEffort = (issue: Issue) => {
    if (issue.category === 'Security') return '3 min';
    if (issue.category === 'Memory') return '2 min';
    if (issue.category === 'Style') return '20 sec';
    return '1 min';
  };

  // Filter Logic
  const filteredIssues = issues.filter((i) => {
    // Exclude ignored unless we are looking at ignored filter
    if (activeSmartFilter !== 'IGNORED' && ignoredIssues[i.id]) return false;

    // Smart Filter Check
    if (activeSmartFilter === 'BLOCKING') {
      if (i.status !== 'Open' || (i.severity !== 'Critical' && i.severity !== 'High')) return false;
    } else if (activeSmartFilter === 'SAFE') {
      if (i.status !== 'Open' || !i.fix) return false;
    } else if (activeSmartFilter === 'HIGH_IMPACT') {
      if (i.status !== 'Open' || i.severity === 'Low' || i.severity === 'Info') return false;
    } else if (activeSmartFilter === 'QUICK_WINS') {
      if (i.status !== 'Open' || !i.fix || i.severity === 'Critical') return false;
    } else if (activeSmartFilter === 'IGNORED') {
      if (!ignoredIssues[i.id]) return false;
    } else if (activeSmartFilter === 'NEW') {
      if (i.status !== 'Open') return false;
    }

    // Domain Check
    if (activeDomainFilter) {
      const matchMap: Record<string, string[]> = {
        Performance: ['Performance'],
        Memory: ['Memory'],
        Architecture: ['Architecture', 'Dependency'],
        Security: ['Security'],
        Modernization: ['Modernization', 'Style'],
      };
      const allowedCategories = matchMap[activeDomainFilter] || [activeDomainFilter];
      if (!allowedCategories.includes(i.category)) return false;
    }

    // Search Query Check
    if (searchQuery.trim() !== '') {
      const term = searchQuery.toLowerCase();
      const match =
        i.title.toLowerCase().includes(term) ||
        i.description.toLowerCase().includes(term) ||
        i.location.fileId.toLowerCase().includes(term) ||
        i.category.toLowerCase().includes(term);
      if (!match) return false;
    }

    return true;
  });

  const selectedIssue = issues.find((i) => i.id === selectedIssueId) || filteredIssues[0] || null;

  // Domain Counts
  const getDomainCount = (domain: string) => {
    const matchMap: Record<string, string[]> = {
      Performance: ['Performance'],
      Memory: ['Memory'],
      Architecture: ['Architecture', 'Dependency'],
      Security: ['Security'],
      Modernization: ['Modernization', 'Style'],
    };
    const categories = matchMap[domain];
    return issues.filter(
      (i) => i.status === 'Open' && !ignoredIssues[i.id] && categories.includes(i.category),
    ).length;
  };

  const handleIgnore = (issueId: string) => {
    setIgnoredIssues((prev) => ({
      ...prev,
      [issueId]: ignoreReason,
    }));
    setShowIgnoreModal(null);
    // Select next issue
    const remaining = filteredIssues.filter((i) => i.id !== issueId);
    if (remaining.length > 0) {
      setSelectedIssueId(remaining[0].id);
    } else {
      setSelectedIssueId(null);
    }
  };

  // Render Investigation Mode Layout
  if (isInvestigating && selectedIssue) {
    const confidence = getConfidenceLevel(selectedIssue);

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sds-space-16)',
          height: '100%',
        }}
      >
        {/* Investigation Header */}
        <div
          className="sds-card"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--sds-space-16)',
            borderColor: 'var(--sds-primary)',
            background: 'linear-gradient(90deg, rgba(99,102,241,0.05) 0%, rgba(0,0,0,0) 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-12)' }}>
            <button
              onClick={() => setIsInvestigating(false)}
              className="sds-btn sds-btn-secondary"
              style={{ padding: '6px 12px', minWidth: 'auto' }}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  className="sds-badge sds-badge-danger"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid var(--sds-danger)',
                    color: 'var(--sds-danger)',
                    fontSize: '10px',
                  }}
                >
                  Investigation Mode
                </span>
                <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--sds-text-heading)' }}>
                  {selectedIssue.title}
                </h2>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginTop: '2px',
                  fontSize: '11px',
                  color: 'var(--sds-text-muted)',
                }}
              >
                <span>
                  File: {selectedIssue.location.fileId}:{selectedIssue.location.line}
                </span>
                <span>•</span>
                <span>Category: {selectedIssue.category}</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-16)' }}>
            {/* Confidence Meter Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: 'var(--sds-radius-md)',
                border: '1px solid var(--sds-border)',
              }}
            >
              <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>Confidence:</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: confidence.color }}>
                {confidence.score}%
              </span>
              <span
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  borderRadius: '3px',
                  color: 'var(--sds-text-muted)',
                }}
              >
                {confidence.label}
              </span>
            </div>

            {selectedIssue.fix && selectedIssue.status === 'Open' && (
              <button
                onClick={async () => {
                  await onApplyFix(selectedIssue.id);
                  setIsInvestigating(false);
                }}
                className="sds-btn sds-btn-primary"
                style={{ padding: '8px 16px' }}
              >
                <Wrench size={14} /> Apply Fix
              </button>
            )}
          </div>
        </div>

        {/* 4-Pane Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr',
            gridTemplateRows: '1.2fr 1fr',
            gap: 'var(--sds-space-16)',
            flex: 1,
            minHeight: '500px',
          }}
        >
          {/* Pane 1: Call Graph Visualizer */}
          <div
            className="sds-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sds-space-12)',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <GitCommit size={14} color="var(--sds-primary)" />
              <h3 style={{ fontSize: '13px', fontWeight: 600 }}>1. Call Graph Trace</h3>
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.2)',
                border: '1px dashed var(--sds-border)',
                borderRadius: 'var(--sds-radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'auto',
              }}
            >
              {/* Directed flowchart SVG */}
              <svg width="340" height="200" viewBox="0 0 340 200">
                {/* Arrow heads */}
                <defs>
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="6"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 2 L 10 5 L 0 8 z" fill="var(--sds-border-hover)" />
                  </marker>
                </defs>

                {/* Edges */}
                <line
                  x1="50"
                  y1="100"
                  x2="140"
                  y2="70"
                  stroke="var(--sds-border-hover)"
                  strokeWidth="1.5"
                  markerEnd="url(#arrow)"
                />
                <line
                  x1="50"
                  y1="100"
                  x2="140"
                  y2="130"
                  stroke="var(--sds-border-hover)"
                  strokeWidth="1.5"
                  markerEnd="url(#arrow)"
                />
                <line
                  x1="140"
                  y1="70"
                  x2="270"
                  y2="100"
                  stroke="var(--sds-primary)"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow)"
                />
                <line
                  x1="140"
                  y1="130"
                  x2="270"
                  y2="100"
                  stroke="var(--sds-border-hover)"
                  strokeWidth="1.5"
                  markerEnd="url(#arrow)"
                />

                {/* Node 1 */}
                <rect
                  x="15"
                  y="85"
                  width="70"
                  height="30"
                  rx="4"
                  fill="var(--sds-surface-hover)"
                  stroke="var(--sds-border)"
                  strokeWidth="1.5"
                />
                <text
                  x="50"
                  y="104"
                  textAnchor="middle"
                  fill="var(--sds-text)"
                  fontSize="10"
                  fontFamily="var(--sds-font-mono)"
                >
                  main()
                </text>

                {/* Node 2 */}
                <rect
                  x="110"
                  y="55"
                  width="80"
                  height="30"
                  rx="4"
                  fill="var(--sds-surface-hover)"
                  stroke="var(--sds-border)"
                  strokeWidth="1.5"
                />
                <text
                  x="150"
                  y="74"
                  textAnchor="middle"
                  fill="var(--sds-text)"
                  fontSize="10"
                  fontFamily="var(--sds-font-mono)"
                >
                  dispatch()
                </text>

                {/* Node 3 */}
                <rect
                  x="110"
                  y="115"
                  width="80"
                  height="30"
                  rx="4"
                  fill="var(--sds-surface-hover)"
                  stroke="var(--sds-border)"
                  strokeWidth="1.5"
                />
                <text
                  x="150"
                  y="134"
                  textAnchor="middle"
                  fill="var(--sds-text)"
                  fontSize="10"
                  fontFamily="var(--sds-font-mono)"
                >
                  logResult()
                </text>

                {/* Node 4 (Target) */}
                <rect
                  x="235"
                  y="85"
                  width="90"
                  height="34"
                  rx="4"
                  fill="var(--sds-surface-active)"
                  stroke="var(--sds-danger)"
                  strokeWidth="2"
                />
                <text
                  x="280"
                  y="105"
                  textAnchor="middle"
                  fill="var(--sds-text-heading)"
                  fontWeight="600"
                  fontSize="10"
                  fontFamily="var(--sds-font-mono)"
                >
                  {selectedIssue.location.fileId.split('.')[0]}
                </text>
              </svg>
            </div>
          </div>

          {/* Pane 2: Code Context Editor */}
          <div
            className="sds-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sds-space-12)',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileCode size={14} color="var(--sds-success)" />
              <h3 style={{ fontSize: '13px', fontWeight: 600 }}>2. Code Context Viewer</h3>
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: '#07080b',
                border: '1px solid var(--sds-border)',
                borderRadius: 'var(--sds-radius-md)',
                padding: 'var(--sds-space-16)',
                fontFamily: 'var(--sds-font-mono)',
                fontSize: '11px',
                color: '#a1a0a5',
                lineHeight: '1.6',
                overflowY: 'auto',
              }}
            >
              <div>1: #include &lt;string&gt;</div>
              <div>2: #include &lt;vector&gt;</div>
              <div>...</div>
              <div>
                {selectedIssue.location.line - 2}: void handleQuery(std::string input) {'{'}
              </div>
              <div>{selectedIssue.location.line - 1}: // Perform pre-validation checks</div>
              <div
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  borderLeft: '3px solid var(--sds-danger)',
                  marginLeft: '-16px',
                  marginRight: '-16px',
                  paddingLeft: '13px',
                }}
              >
                {selectedIssue.location.line}:{' '}
                {selectedIssue.fix?.actions[0]?.preview.split('\n')[2] ||
                  'std::string query = "SELECT * FROM users WHERE name = \'" + input + "\';";'}
                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--sds-danger)',
                    marginTop: '2px',
                    fontWeight: 500,
                  }}
                >
                  ⚠️ Diagnostic: {selectedIssue.description}
                </div>
              </div>
              <div>{selectedIssue.location.line + 1}: execute(query);</div>
              <div>
                {selectedIssue.location.line + 2}: {'}'}
              </div>
            </div>
          </div>

          {/* Pane 3: Git History & Blame */}
          <div
            className="sds-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sds-space-12)',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={14} color="var(--sds-info)" />
              <h3 style={{ fontSize: '13px', fontWeight: 600 }}>3. Git Activity & Author</h3>
            </div>
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12px',
                overflowY: 'auto',
              }}
            >
              <div
                style={{
                  padding: '10px',
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  border: '1px solid var(--sds-border)',
                  borderRadius: 'var(--sds-radius-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span style={{ color: 'var(--sds-text-heading)' }}>Sanket Ghodake</span>
                  <span style={{ color: 'var(--sds-text-muted)' }}>2 days ago</span>
                </div>
                <div
                  style={{
                    color: 'var(--sds-primary)',
                    marginTop: '2px',
                    fontFamily: 'var(--sds-font-mono)',
                    fontSize: '11px',
                  }}
                >
                  commit e5f67b2d
                </div>
                <p style={{ margin: '4px 0 0 0', color: 'var(--sds-text)', fontSize: '11px' }}>
                  Initialize domain object structures and add event handlers.
                </p>
              </div>

              <div
                style={{
                  padding: '10px',
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  border: '1px dashed var(--sds-border)',
                  borderRadius: 'var(--sds-radius-sm)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'var(--sds-text-muted)',
                  fontSize: '11px',
                }}
              >
                <span>File Churn Rate: Low</span>
                <span>PR: #18</span>
              </div>
            </div>
          </div>

          {/* Pane 4: Recommended Fix Diff */}
          <div
            className="sds-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sds-space-12)',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={14} color="var(--sds-warning)" />
              <h3 style={{ fontSize: '13px', fontWeight: 600 }}>4. Proposed Repair Preview</h3>
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.1)',
                border: '1px solid var(--sds-border)',
                borderRadius: 'var(--sds-radius-md)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderBottom: '1px solid var(--sds-border)',
                  padding: '6px var(--sds-space-12)',
                  fontSize: '11px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: 'var(--sds-text-muted)',
                }}
              >
                <span>Automated Patch Preview</span>
                <span style={{ color: 'var(--sds-success)', fontWeight: 600 }}>Safe</span>
              </div>
              <pre
                style={{
                  flex: 1,
                  margin: 0,
                  padding: 'var(--sds-space-12)',
                  fontFamily: 'var(--sds-font-mono)',
                  fontSize: '10px',
                  lineHeight: '1.4',
                  color: '#a1a0a5',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedIssue.fix?.actions[0]?.preview ||
                  '- std::string query = "SELECT * FROM WHERE name = \'" + input + "\';";\n+ std::string query = "SELECT * FROM WHERE name = ?;";\n+ sqlite3_bind_text(stmt, 1, input.c_str(), -1, SQLITE_TRANSIENT);'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Analyze Layout (8 Sections)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sds-space-24)',
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
      }}
    >
      {/* Section 1: Readiness Hero */}
      <div
        className="sds-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--sds-space-16)',
          background: 'linear-gradient(90deg, rgba(99,102,241,0.08) 0%, rgba(18,20,28,0) 100%)',
          borderLeft: `4px solid ${
            isScanning
              ? 'var(--sds-primary)'
              : blockingIssues.length > 0
                ? 'var(--sds-danger)'
                : 'var(--sds-success)'
          }`,
          padding: 'var(--sds-space-24)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span
              style={{
                fontSize: '11px',
                color: isScanning
                  ? 'var(--sds-primary)'
                  : blockingIssues.length > 0
                    ? 'var(--sds-danger)'
                    : 'var(--sds-success)',
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Commit Verification status for {activeProject.name}
            </span>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: 600,
                marginTop: '4px',
                color: 'var(--sds-text-heading)',
              }}
            >
              {isScanning ? (
                '🔄 SCANNING...'
              ) : (
                <>READY TO COMMIT: {blockingIssues.length > 0 ? '❌ NO' : '✓ YES'}</>
              )}
            </h1>
            {isScanning && (
              <p style={{ fontSize: '12px', color: 'var(--sds-text-muted)', marginTop: '4px' }}>
                Analyzing Memory, Performance, Architecture, and Security...
              </p>
            )}
          </div>
          {filteredIssues.length > 0 ? (
            <button
              onClick={() => {
                const nextBlocker = blockingIssues[0] || filteredIssues[0];
                if (nextBlocker) {
                  setSelectedIssueId(nextBlocker.id);
                  setIsInvestigating(true);
                }
              }}
              className="sds-btn sds-btn-primary"
              style={{ height: 'fit-content' }}
            >
              Continue Working <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={onRunScan}
              disabled={isScanning}
              className="sds-btn sds-btn-primary"
              style={{ height: 'fit-content' }}
            >
              {isScanning ? 'Scanning...' : 'Scan Project'}
            </button>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 'var(--sds-space-24)',
            borderTop: '1px solid var(--sds-border)',
            paddingTop: 'var(--sds-space-16)',
            fontSize: '13px',
          }}
        >
          <div>
            <span style={{ color: 'var(--sds-text-muted)' }}>Blocking Issues: </span>
            <strong style={{ color: 'var(--sds-danger)' }}>{blockingIssues.length}</strong>
          </div>
          <span style={{ color: 'var(--sds-border)' }}>|</span>
          <div>
            <span style={{ color: 'var(--sds-text-muted)' }}>Suggestions: </span>
            <strong style={{ color: 'var(--sds-warning)' }}>
              {openIssues.length - blockingIssues.length}
            </strong>
          </div>
          <span style={{ color: 'var(--sds-border)' }}>|</span>
          <div>
            <span style={{ color: 'var(--sds-text-muted)' }}>Safe Fixes: </span>
            <strong style={{ color: 'var(--sds-success)' }}>{safeFixes.length}</strong>
          </div>
          <span style={{ color: 'var(--sds-border)' }}>|</span>
          <div>
            <span style={{ color: 'var(--sds-text-muted)' }}>Est. Effort: </span>
            <strong style={{ color: 'var(--sds-primary)' }}>
              {blockingIssues.length * 3 + (openIssues.length - blockingIssues.length) * 1} min
            </strong>
          </div>
        </div>
      </div>

      {/* 2-Column Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 'var(--sds-space-24)',
        }}
      >
        {/* Left Column: Priorities, Categories, Smart Filters, Issue List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-24)' }}>
          {/* Section 2: Today's Priorities */}
          <div
            className="sds-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sds-space-12)',
            }}
          >
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--sds-text-heading)' }}>
              Today's Priorities
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {openIssues.slice(0, 3).map((issue, index) => (
                <div
                  key={issue.id}
                  onClick={() => {
                    setSelectedIssueId(issue.id);
                    setIsInvestigating(true);
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    backgroundColor: 'rgba(0,0,0,0.15)',
                    border: '1px solid var(--sds-border)',
                    borderRadius: 'var(--sds-radius-sm)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ color: 'var(--sds-primary)', fontWeight: 600 }}>
                      {index + 1}.
                    </span>
                    <span style={{ color: 'var(--sds-text-heading)', fontSize: '13px' }}>
                      {issue.title}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                      {getIssueEffort(issue)}
                    </span>
                    <ChevronRight size={14} color="var(--sds-text-muted)" />
                  </div>
                </div>
              ))}
              {openIssues.length === 0 && (
                <div
                  style={{ fontSize: '12px', color: 'var(--sds-text-muted)', textAlign: 'center' }}
                >
                  No high priority issues pending.
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Issue Categories */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
              Issue Categories
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '12px',
              }}
            >
              {[
                { name: 'Performance', key: 'Performance' },
                { name: 'Memory', key: 'Memory' },
                { name: 'Architecture', key: 'Architecture' },
                { name: 'Security', key: 'Security' },
                { name: 'Modernization', key: 'Modernization' },
              ].map((domain) => {
                const count = getDomainCount(domain.key);
                const isActive = activeDomainFilter === domain.key;
                return (
                  <div
                    key={domain.key}
                    onClick={() => setActiveDomainFilter(isActive ? null : domain.key)}
                    className="sds-card"
                    style={{
                      padding: '12px var(--sds-space-8)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderColor: isActive ? 'var(--sds-primary)' : 'var(--sds-border)',
                      backgroundColor: isActive
                        ? 'var(--sds-surface-active)'
                        : 'var(--sds-surface)',
                    }}
                  >
                    <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                      {domain.name}
                    </span>
                    <span
                      style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: count > 0 ? 'var(--sds-warning)' : 'var(--sds-success)',
                        marginTop: '4px',
                      }}
                    >
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Smart Filters */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={12} color="var(--sds-text-muted)" />
              <span style={{ fontSize: '12px', color: 'var(--sds-text-muted)' }}>
                Smart Filters
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { label: 'All Issues', key: 'ALL' },
                { label: 'Blocking', key: 'BLOCKING' },
                { label: 'Safe Fixes', key: 'SAFE' },
                { label: 'High Impact', key: 'HIGH_IMPACT' },
                { label: 'Quick Wins', key: 'QUICK_WINS' },
                { label: 'Ignored', key: 'IGNORED' },
                { label: 'New', key: 'NEW' },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveSmartFilter(filter.key)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid var(--sds-border)',
                    borderRadius: 'var(--sds-radius-sm)',
                    fontSize: '11px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    backgroundColor:
                      activeSmartFilter === filter.key ? 'var(--sds-primary)' : 'transparent',
                    color: activeSmartFilter === filter.key ? '#fff' : 'var(--sds-text)',
                  }}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Local Filter input */}
            <div style={{ position: 'relative', marginTop: '4px' }}>
              <Search
                size={14}
                color="var(--sds-text-muted)"
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
              <input
                type="text"
                placeholder="Search issues, files, descriptions (J/K to navigate list)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.15)',
                  border: '1px solid var(--sds-border)',
                  borderRadius: 'var(--sds-radius-md)',
                  padding: '8px 12px 8px 30px',
                  fontSize: '12px',
                  color: 'var(--sds-text-heading)',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Section 5: Issue List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredIssues.map((issue) => {
              const isSelected = selectedIssueId === issue.id;
              const confidence = getConfidenceLevel(issue);
              const isIgnored = !!ignoredIssues[issue.id];

              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssueId(issue.id)}
                  onDoubleClick={() => {
                    setSelectedIssueId(issue.id);
                    setIsInvestigating(true);
                  }}
                  className="sds-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--sds-primary)' : 'var(--sds-border)',
                    backgroundColor: isSelected ? 'var(--sds-surface-hover)' : 'var(--sds-surface)',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {/* Row content */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          className={`sds-badge ${
                            issue.severity === 'Critical' || issue.severity === 'High'
                              ? 'sds-badge-danger'
                              : 'sds-badge-warning'
                          }`}
                        >
                          {issue.severity}
                        </span>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--sds-text-heading)',
                          }}
                        >
                          {issue.title}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'var(--sds-text-muted)',
                          marginTop: '4px',
                          fontFamily: 'var(--sds-font-mono)',
                        }}
                      >
                        {issue.location.fileId}:{issue.location.line}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                        {getIssueEffort(issue)}
                      </span>
                      <span style={{ fontSize: '11px', color: confidence.color, fontWeight: 500 }}>
                        {confidence.score}% Safe
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIssueId(issue.id);
                          setIsInvestigating(true);
                        }}
                        className="sds-btn sds-btn-secondary"
                        style={{ fontSize: '11px', padding: '4px 10px', minWidth: 'auto' }}
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  {/* Hover Quick Actions style overlay when selected */}
                  {isSelected && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '12px',
                        borderTop: '1px solid var(--sds-border)',
                        paddingTop: '6px',
                        marginTop: '4px',
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsInvestigating(true);
                        }}
                        className="sds-btn sds-btn-secondary"
                        style={{ fontSize: '11px', padding: '2px 8px' }}
                      >
                        <Info size={10} /> Explain (E)
                      </button>
                      {issue.fix && issue.status === 'Open' && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            await onApplyFix(issue.id);
                          }}
                          className="sds-btn sds-btn-secondary"
                          style={{ fontSize: '11px', padding: '2px 8px' }}
                        >
                          <Wrench size={10} /> Apply Fix (A)
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowIgnoreModal(issue.id);
                        }}
                        className="sds-btn sds-btn-secondary"
                        style={{ fontSize: '11px', padding: '2px 8px' }}
                      >
                        <XCircle size={10} /> Ignore (I)
                      </button>
                    </div>
                  )}

                  {isIgnored && (
                    <div
                      style={{ fontSize: '11px', color: 'var(--sds-warning)', fontStyle: 'italic' }}
                    >
                      Ignored Reason: {ignoredIssues[issue.id]}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredIssues.length === 0 && (
              <div
                className="sds-card"
                style={{
                  padding: 'var(--sds-space-24)',
                  textAlign: 'center',
                  color: 'var(--sds-text-muted)',
                }}
              >
                <CheckCircle
                  size={24}
                  color="var(--sds-success)"
                  style={{ margin: '0 auto 8px auto' }}
                />
                <h4>Excellent</h4>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>
                  No issues found. Project ready.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Smart Explanation, Related Issues, Recommended Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-24)' }}>
          {selectedIssue ? (
            <>
              {/* Section 6: Smart Explanation */}
              <div
                className="sds-card"
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-12)' }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <h3
                    style={{ fontSize: '14px', fontWeight: 600, color: 'var(--sds-text-heading)' }}
                  >
                    Smart Explanation
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--sds-primary)', fontWeight: 500 }}>
                    {getConfidenceLevel(selectedIssue).score}% Confidence
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    fontSize: '12px',
                  }}
                >
                  <div>
                    <strong style={{ color: 'var(--sds-text-heading)' }}>Why?</strong>
                    <p style={{ margin: '2px 0', color: 'var(--sds-text)', lineHeight: '1.4' }}>
                      {selectedIssue.description}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--sds-text-heading)' }}>Impact</strong>
                    <p
                      style={{ margin: '2px 0', color: 'var(--sds-text-muted)', lineHeight: '1.4' }}
                    >
                      {selectedIssue.impact}
                    </p>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--sds-text-heading)' }}>Recommended</strong>
                    <p style={{ margin: '2px 0', color: 'var(--sds-text)', lineHeight: '1.4' }}>
                      {selectedIssue.fix?.description ||
                        'Review the code context and manually refactor.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 7: Related Issues */}
              <div
                className="sds-card"
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-12)' }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Related Items</h3>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}
                >
                  <div style={{ color: 'var(--sds-text-muted)' }}>
                    Conceptual clusters linked to this issue:
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      paddingLeft: '8px',
                    }}
                  >
                    <div style={{ color: 'var(--sds-primary)' }}>
                      ↳ Cluster: Code Injection vulnerability
                    </div>
                    <div style={{ color: 'var(--sds-primary)' }}>
                      ↳ Cluster: Resource lifetime scope
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 8: Recommended Actions */}
              <div
                className="sds-card"
                style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-12)' }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Recommended Actions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedIssue.fix && selectedIssue.status === 'Open' ? (
                    <button
                      onClick={() => onApplyFix(selectedIssue.id)}
                      className="sds-btn sds-btn-primary"
                      style={{ justifyContent: 'center' }}
                    >
                      Apply Automated Safe Fix
                    </button>
                  ) : (
                    <div
                      style={{ fontSize: '12px', color: 'var(--sds-success)', textAlign: 'center' }}
                    >
                      ✓ Issue already resolved or manual review required.
                    </div>
                  )}
                  <button
                    onClick={() => setIsInvestigating(true)}
                    className="sds-btn sds-btn-secondary"
                    style={{ justifyContent: 'center' }}
                  >
                    Enter Investigation Mode
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div
              className="sds-card"
              style={{ padding: 'var(--sds-space-24)', textAlign: 'center' }}
            >
              Select an issue to view explanation.
            </div>
          )}
        </div>
      </div>

      {/* Ignore dialog modal */}
      {showIgnoreModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            className="sds-card"
            style={{
              width: '400px',
              padding: 'var(--sds-space-24)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--sds-text-heading)' }}>
                Ignore Quality Check
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--sds-text-muted)', marginTop: '4px' }}>
                Please select a reason for auditing and ignoring this check:
              </p>
            </div>

            <select
              value={ignoreReason}
              onChange={(e) => setIgnoreReason(e.target.value)}
              style={{
                backgroundColor: 'var(--sds-bg)',
                color: '#fff',
                border: '1px solid var(--sds-border)',
                borderRadius: 'var(--sds-radius-md)',
                padding: '8px',
                width: '100%',
              }}
            >
              <option>False Positive</option>
              <option>Won't Fix</option>
              <option>Legacy</option>
              <option>Accepted Risk</option>
            </select>

            <div style={{ display: 'flex', justifySelf: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowIgnoreModal(null)}
                className="sds-btn sds-btn-secondary"
                style={{ padding: '6px 12px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleIgnore(showIgnoreModal)}
                className="sds-btn sds-btn-primary"
                style={{ padding: '6px 12px' }}
              >
                Ignore Issue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
