import React from 'react';
import { Sparkles, ArrowRight, Plus, GitBranch, Download, Award } from 'lucide-react';
import type { Project, Issue } from '../services/clientApi';
import type { InspectorObject } from './Inspector';
import { QualityGauge } from './QualityGauge';

interface HomeWorkspaceProps {
  activeProject: Project;
  projects: Project[];
  issues: Issue[];
  isScanning: boolean;
  onRunScan: () => void;
  setActiveWorkspace: (ws: string) => void;
  setInspectorObject: (obj: InspectorObject | null) => void;
  onProjectChange: (id: string) => void;
}

export const HomeWorkspace: React.FC<HomeWorkspaceProps> = ({
  activeProject,
  projects,
  issues,
  isScanning,
  onRunScan,
  setActiveWorkspace,
  setInspectorObject,
  onProjectChange,
}) => {
  const openIssues = issues.filter((i) => i.status === 'Open');
  const blockingIssues = openIssues.filter(
    (i) => i.severity === 'Critical' || i.severity === 'High',
  );
  const safeFixes = openIssues.filter((i) => i.fix);

  // Keyboard accessibility helper for focus rings
  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

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
      {/* Section 1: Welcome Header */}
      <div
        className="sds-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(99,102,241,0.08) 0%, rgba(18,20,28,0) 100%)',
          borderLeft: '4px solid var(--sds-primary)',
          padding: 'var(--sds-space-24)',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--sds-primary)',
              fontWeight: 600,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Daily Command Center
          </span>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 600,
              marginTop: '4px',
              color: 'var(--sds-text-heading)',
            }}
          >
            Good Morning, Sanket 👋
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--sds-text-muted)', marginTop: '2px' }}>
            Welcome back. Last session: Yesterday at 7:42 PM
          </p>
        </div>
        <button
          onClick={() => setActiveWorkspace('analyze')}
          className="sds-btn sds-btn-primary"
          style={{ height: 'fit-content' }}
        >
          Continue Working <ArrowRight size={14} />
        </button>
      </div>

      {/* Grid Layout for Main Content */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 'var(--sds-space-24)',
        }}
      >
        {/* Left Column: Current Project, Today's Work, Project Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-24)' }}>
          {/* Section 2: Current Project Hero Card */}
          <div
            className="sds-card"
            onClick={() => setInspectorObject({ type: 'project', data: activeProject })}
            onKeyDown={(e) =>
              handleKeyDown(e, () => setInspectorObject({ type: 'project', data: activeProject }))
            }
            tabIndex={0}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-12)' }}>
              <div>
                <span
                  style={{
                    fontSize: '10px',
                    color: 'var(--sds-text-muted)',
                    fontWeight: 600,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                  }}
                >
                  Active Repository
                </span>
                <h2
                  style={{ fontSize: '24px', color: 'var(--sds-text-heading)', marginTop: '2px' }}
                >
                  {activeProject.name}
                </h2>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}
                >
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px',
                      fontFamily: 'var(--sds-font-mono)',
                      color: 'var(--sds-text)',
                    }}
                  >
                    <GitBranch size={12} color="var(--sds-primary)" />
                    {activeProject.branch}
                  </span>
                  <span style={{ color: 'var(--sds-border)' }}>|</span>
                  <span style={{ fontSize: '12px', color: 'var(--sds-text-muted)' }}>
                    Scan: 2 min ago
                  </span>
                </div>
              </div>

              {/* Commit Readiness Banner */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 12px',
                  backgroundColor:
                    blockingIssues.length === 0 ? 'var(--sds-success-bg)' : 'var(--sds-danger-bg)',
                  borderRadius: 'var(--sds-radius-md)',
                  border: `1px solid ${
                    blockingIssues.length === 0
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'rgba(239, 68, 68, 0.2)'
                  }`,
                  width: 'fit-content',
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor:
                      blockingIssues.length === 0 ? 'var(--sds-success)' : 'var(--sds-danger)',
                  }}
                />
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: blockingIssues.length === 0 ? 'var(--sds-success)' : 'var(--sds-danger)',
                  }}
                >
                  {blockingIssues.length === 0 ? '✓ Ready to Commit' : '⚠️ Blockers Exist'}
                </span>
              </div>
            </div>

            <div>
              <QualityGauge
                score={activeProject.quality}
                size={110}
                strokeWidth={8}
                label="Quality"
              />
            </div>
          </div>

          {/* Section 3: Today's Focus Panel */}
          <div
            className="sds-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--sds-space-16)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--sds-warning)" />
                <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Today's Work</h3>
              </div>
              <span className="sds-badge sds-badge-info">Persistent Focus</span>
            </div>

            {/* List of Prioritized Task Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Task 1: Review Memory Issues */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px var(--sds-space-16)',
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  borderRadius: 'var(--sds-radius-md)',
                  border: '1px solid var(--sds-border)',
                  borderLeft: '4px solid var(--sds-danger)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onClick={() => {
                  const memIssue = issues.find((i) => i.category === 'Memory') || issues[0];
                  if (memIssue) setInspectorObject({ type: 'issue', data: memIssue });
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--sds-surface-hover)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.15)')}
              >
                <div>
                  <h4
                    style={{ fontSize: '13px', color: 'var(--sds-text-heading)', fontWeight: 600 }}
                  >
                    Review Memory Issues
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--sds-text-muted)', marginTop: '2px' }}>
                    Investigate 2 potential leaks in memory buffers
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>3 min</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveWorkspace('analyze');
                    }}
                    className="sds-btn sds-btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    Review
                  </button>
                </div>
              </div>

              {/* Task 2: Apply Safe Fixes */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px var(--sds-space-16)',
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  borderRadius: 'var(--sds-radius-md)',
                  border: '1px solid var(--sds-border)',
                  borderLeft: '4px solid var(--sds-info)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onClick={() => {
                  const safeIssue = issues.find((i) => i.fix) || issues[0];
                  if (safeIssue) setInspectorObject({ type: 'issue', data: safeIssue });
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--sds-surface-hover)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.15)')}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4
                      style={{
                        fontSize: '13px',
                        color: 'var(--sds-text-heading)',
                        fontWeight: 600,
                      }}
                    >
                      Apply Safe Fixes
                    </h4>
                    <span style={{ color: 'var(--sds-warning)', fontSize: '11px' }}>★★★★★</span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--sds-text-muted)', marginTop: '2px' }}>
                    {safeFixes.length} auto-repairable issues ready to apply safely
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>20 sec</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveWorkspace('fix');
                    }}
                    className="sds-btn sds-btn-primary"
                    style={{
                      fontSize: '11px',
                      padding: '4px 10px',
                      backgroundColor: 'var(--sds-success)',
                      color: '#fff',
                    }}
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Task 3: Run Scan */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px var(--sds-space-16)',
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  borderRadius: 'var(--sds-radius-md)',
                  border: '1px solid var(--sds-border)',
                  borderLeft: '4px solid var(--sds-primary)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onClick={() => setInspectorObject({ type: 'project', data: activeProject })}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--sds-surface-hover)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.15)')}
              >
                <div>
                  <h4
                    style={{ fontSize: '13px', color: 'var(--sds-text-heading)', fontWeight: 600 }}
                  >
                    Run Scan
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--sds-text-muted)', marginTop: '2px' }}>
                    Scan 5 changed files in local git branch
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>1 min</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRunScan();
                    }}
                    disabled={isScanning}
                    className="sds-btn sds-btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    {isScanning ? 'Scanning...' : 'Scan'}
                  </button>
                </div>
              </div>

              {/* Task 4: Review Performance */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px var(--sds-space-16)',
                  backgroundColor: 'rgba(0,0,0,0.15)',
                  borderRadius: 'var(--sds-radius-md)',
                  border: '1px solid var(--sds-border)',
                  borderLeft: '4px solid var(--sds-warning)',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
                onClick={() => {
                  const perfIssue = issues.find((i) => i.category === 'Performance') || issues[0];
                  if (perfIssue) setInspectorObject({ type: 'issue', data: perfIssue });
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--sds-surface-hover)')
                }
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.15)')}
              >
                <div>
                  <h4
                    style={{ fontSize: '13px', color: 'var(--sds-text-heading)', fontWeight: 600 }}
                  >
                    Review Performance
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--sds-text-muted)', marginTop: '2px' }}>
                    Audit vector reallocations in hot loops
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>5 min</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveWorkspace('insights');
                    }}
                    className="sds-btn sds-btn-secondary"
                    style={{ fontSize: '11px', padding: '4px 10px' }}
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Project Health Metrics */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-12)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600 }}>Project Health</h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '12px',
              }}
            >
              {[
                { name: 'Quality', score: activeProject.quality, key: 'quality' },
                { name: 'Performance', score: 94, key: 'perf' },
                { name: 'Memory', score: 91, key: 'mem' },
                { name: 'Security', score: 100, key: 'sec' },
                { name: 'Architecture', score: 92, key: 'arch' },
              ].map((metric) => (
                <div
                  key={metric.key}
                  className="sds-card"
                  onClick={() => setActiveWorkspace('insights')}
                  style={{
                    padding: '12px 6px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                  title={`Click to open historical ${metric.name} insights.`}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      color: 'var(--sds-text-muted)',
                      textAlign: 'center',
                    }}
                  >
                    {metric.name}
                  </span>
                  <span
                    style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color:
                        metric.score >= 90
                          ? 'var(--sds-success)'
                          : metric.score >= 75
                            ? 'var(--sds-primary)'
                            : 'var(--sds-warning)',
                      marginTop: '4px',
                    }}
                  >
                    {Math.round(metric.score)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Activity Timeline, Recommendations, Recent Projects */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-24)' }}>
          {/* Section 5: Activity Timeline */}
          <div
            className="sds-card"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-12)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award size={16} color="var(--sds-success)" />
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Activity Timeline</h3>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                borderLeft: '1px solid var(--sds-border)',
                paddingLeft: '16px',
                marginLeft: '8px',
                marginTop: '4px',
              }}
            >
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '-21px',
                    top: '4px',
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--sds-success)',
                    border: '2px solid var(--sds-surface)',
                  }}
                />
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--sds-text-heading)',
                  }}
                >
                  Yesterday
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--sds-text-muted)',
                    marginTop: '2px',
                    lineHeight: '1.4',
                  }}
                >
                  Applied 12 Safe Fixes $\rightarrow$ Quality{' '}
                  <strong style={{ color: 'var(--sds-success)' }}>+2%</strong> $\rightarrow$ Memory
                  Improved $\rightarrow$ Plugin Updated.
                </div>
              </div>

              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '-21px',
                    top: '4px',
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--sds-info)',
                    border: '2px solid var(--sds-surface)',
                  }}
                />
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--sds-text-heading)',
                  }}
                >
                  2 days ago
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--sds-text-muted)',
                    marginTop: '2px',
                    lineHeight: '1.4',
                  }}
                >
                  Initial workspace repository scanned successfully. Computed baseline scores.
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Actionable Recommendations */}
          <div
            className="sds-card"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-12)' }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Recommendations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Rec 1: Install IWYU */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--sds-border)',
                  borderRadius: 'var(--sds-radius-md)',
                  cursor: 'pointer',
                  transition: 'border-color var(--sds-transition-fast)',
                }}
                onClick={() =>
                  setInspectorObject({
                    type: 'recommendation',
                    data: {
                      title: 'Install IWYU (Include What You Use)',
                      description:
                        'Cleans up redundant header includes in project C++ source files.',
                      category: 'Performance',
                      effort: '2 min',
                      target: 'Toolchain',
                    },
                  })
                }
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--sds-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--sds-border)')}
              >
                <div>
                  <div
                    style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sds-text-heading)' }}
                  >
                    Install IWYU
                  </div>
                  <div
                    style={{ fontSize: '11px', color: 'var(--sds-text-muted)', marginTop: '2px' }}
                  >
                    Estimated Effort: 2 min
                  </div>
                </div>
                <button
                  className="sds-btn sds-btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download size={10} style={{ marginRight: '4px' }} /> Install
                </button>
              </div>

              {/* Rec 2: Enable MISRA Profile */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(255,255,255,0.01)',
                  border: '1px solid var(--sds-border)',
                  borderRadius: 'var(--sds-radius-md)',
                  cursor: 'pointer',
                  transition: 'border-color var(--sds-transition-fast)',
                }}
                onClick={() =>
                  setInspectorObject({
                    type: 'recommendation',
                    data: {
                      title: 'Enable MISRA C++ Rules Profile',
                      description:
                        'Activates standard safety rules required for critical aerospace/automotive C++ code.',
                      category: 'Safety',
                      effort: '1 click',
                      target: 'Configuration',
                    },
                  })
                }
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--sds-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--sds-border)')}
              >
                <div>
                  <div
                    style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sds-text-heading)' }}
                  >
                    Enable MISRA Profile
                  </div>
                  <div
                    style={{ fontSize: '11px', color: 'var(--sds-text-muted)', marginTop: '2px' }}
                  >
                    Estimated Effort: 1 click
                  </div>
                </div>
                <button
                  className="sds-btn sds-btn-secondary"
                  style={{ fontSize: '11px', padding: '4px 10px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Plus size={10} style={{ marginRight: '4px' }} /> Enable
                </button>
              </div>
            </div>
          </div>

          {/* Section 7: Recent Projects List */}
          <div
            className="sds-card"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-12)' }}
          >
            <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Recent Projects</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderBottom: '1px solid rgba(255,255,255,0.02)',
                    fontSize: '12px',
                    cursor: 'pointer',
                  }}
                  onClick={() => onProjectChange(proj.id)}
                >
                  <span style={{ fontWeight: 500, color: 'var(--sds-text-heading)' }}>
                    {proj.name}
                  </span>
                  <span style={{ color: 'var(--sds-text-muted)' }}>
                    {proj.id === activeProject.id ? 'Today' : 'Yesterday'}
                  </span>
                  <span
                    style={{
                      fontWeight: 600,
                      color: proj.quality >= 90 ? 'var(--sds-success)' : 'var(--sds-warning)',
                    }}
                  >
                    {Math.round(proj.quality)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
