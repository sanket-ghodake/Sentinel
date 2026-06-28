import React, { useState } from 'react';
import {
  ShieldAlert,
  Cpu,
  Wrench,
  Eye,
  Info,
  Clock,
  Folder,
  FileCode,
  Shield,
  Activity,
  User,
  Calendar,
  X,
  Puzzle,
  FileText,
  HelpCircle,
} from 'lucide-react';
import type { Issue } from '../services/clientApi';

interface InspectorProject {
  id: string;
  name: string;
  branch: string;
  status: string;
  language: string;
  quality: number;
}

interface InspectorFile {
  name: string;
  path: string;
  issuesCount: number;
}

interface InspectorFolder {
  name: string;
  path: string;
}

interface InspectorPlugin {
  name: string;
  version: string;
  status?: string;
}

interface InspectorRecommendation {
  title: string;
  description: string;
  category: string;
  effort: string;
  target: string;
}

export interface InspectorObject {
  type:
    | 'project'
    | 'folder'
    | 'file'
    | 'module'
    | 'issue'
    | 'rule'
    | 'plugin'
    | 'report'
    | 'recommendation'
    | 'profile'
    | 'home_context';
  data: unknown;
}

interface InspectorProps {
  inspectorObject: InspectorObject | null;
  onApplyFix: (issueId: string) => void;
  isApplying: boolean;
  onNavigateToImprove: () => void;
  onClose: () => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  inspectorObject,
  onApplyFix,
  isApplying,
  onNavigateToImprove,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'properties' | 'actions'>('summary');

  if (!inspectorObject) {
    return (
      <aside
        style={{
          backgroundColor: 'var(--sds-surface)',
          borderLeft: '1px solid var(--sds-border)',
          padding: 'var(--sds-space-32) var(--sds-space-24)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          height: '100%',
          color: 'var(--sds-text-muted)',
        }}
      >
        <Info size={32} style={{ marginBottom: 'var(--sds-space-16)', opacity: 0.5 }} />
        <h3
          style={{
            fontSize: '15px',
            fontWeight: 500,
            color: 'var(--sds-text-heading)',
            marginBottom: 'var(--sds-space-8)',
          }}
        >
          No Context Selected
        </h3>
        <p style={{ fontSize: '12px', lineHeight: '1.4' }}>
          Select an issue, file, plugin, or click workspace items to inspect detailed diagnostics
          here.
        </p>
      </aside>
    );
  }

  const renderHeader = (
    icon: React.ReactNode,
    title: string,
    subtitle: string,
    badge?: { text: string; type: 'danger' | 'warning' | 'success' | 'info' },
  ) => {
    let badgeClass = 'sds-badge-info';
    if (badge) {
      if (badge.type === 'danger') badgeClass = 'sds-badge-danger';
      else if (badge.type === 'warning') badgeClass = 'sds-badge-warning';
      else if (badge.type === 'success') badgeClass = 'sds-badge-success';
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--sds-primary)',
            }}
          >
            {icon}
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              {inspectorObject.type}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {badge && <span className={`sds-badge ${badgeClass}`}>{badge.text}</span>}
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--sds-text-muted)',
                cursor: 'pointer',
                padding: '2px',
                borderRadius: 'var(--sds-radius-sm)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--sds-text-heading)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--sds-text-muted)')}
            >
              <X size={14} />
            </button>
          </div>
        </div>
        <div>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--sds-text-heading)',
              lineHeight: '1.3',
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: '11px',
              color: 'var(--sds-text-muted)',
              marginTop: '4px',
              wordBreak: 'break-all',
              fontFamily: 'var(--sds-font-mono)',
            }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    );
  };

  const renderTabs = () => (
    <div
      style={{
        display: 'flex',
        borderBottom: '1px solid var(--sds-border)',
        marginTop: '12px',
      }}
    >
      {(['summary', 'properties', 'actions'] as const).map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            borderBottom:
              activeTab === tab ? '2px solid var(--sds-primary)' : '2px solid transparent',
            color: activeTab === tab ? 'var(--sds-text-heading)' : 'var(--sds-text-muted)',
            padding: '8px 0',
            fontSize: '12px',
            fontWeight: activeTab === tab ? 600 : 500,
            cursor: 'pointer',
            textTransform: 'capitalize',
            transition: 'all var(--sds-transition-fast)',
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );

  const renderProperties = (
    props: { label: string; value: string | number; icon?: React.ReactNode }[],
  ) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {props.map((p, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
            paddingBottom: '8px',
            borderBottom: i < props.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
          }}
        >
          <span
            style={{
              color: 'var(--sds-text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {p.icon}
            {p.label}
          </span>
          <span
            style={{
              color: 'var(--sds-text-heading)',
              fontWeight: 500,
              fontFamily: 'var(--sds-font-mono)',
            }}
          >
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );

  let content: React.ReactNode = null;
  let header: React.ReactNode = null;

  switch (inspectorObject.type) {
    case 'issue': {
      const issue = inspectorObject.data as Issue;
      const severityType =
        issue.severity === 'Critical' || issue.severity === 'High'
          ? 'danger'
          : issue.severity === 'Medium'
            ? 'warning'
            : 'success';

      header = renderHeader(
        <ShieldAlert size={14} />,
        issue.title,
        `${issue.location.fileId}:${issue.location.line}`,
        { text: issue.severity, type: severityType },
      );

      if (activeTab === 'summary') {
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h4
                style={{
                  fontSize: '11px',
                  color: 'var(--sds-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '6px',
                }}
              >
                Diagnostic Description
              </h4>
              <p style={{ fontSize: '13px', lineHeight: '1.4', color: 'var(--sds-text)' }}>
                {issue.description}
              </p>
            </div>
            {issue.impact && (
              <div>
                <h4
                  style={{
                    fontSize: '11px',
                    color: 'var(--sds-text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '6px',
                  }}
                >
                  Impact
                </h4>
                <p style={{ fontSize: '13px', lineHeight: '1.4', color: 'var(--sds-text)' }}>
                  {issue.impact}
                </p>
              </div>
            )}
            {issue.fix && (
              <div
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.1)',
                  borderRadius: 'var(--sds-radius-md)',
                  padding: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--sds-success)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Wrench size={12} /> Safe Autofix Available
                </span>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'var(--sds-text)',
                    marginTop: '4px',
                    lineHeight: '1.4',
                  }}
                >
                  {issue.fix.description}
                </p>
              </div>
            )}
          </div>
        );
      } else if (activeTab === 'properties') {
        content = renderProperties([
          { label: 'Category', value: issue.category, icon: <Cpu size={12} /> },
          { label: 'Analyzer', value: issue.analyzerId, icon: <Activity size={12} /> },
          { label: 'Line', value: issue.location.line },
          { label: 'Column', value: issue.location.column },
          { label: 'Status', value: issue.status },
          { label: 'Safe Fix', value: issue.fix ? 'Yes' : 'No' },
        ]);
      } else if (activeTab === 'actions') {
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {issue.fix && issue.status === 'Open' ? (
              <>
                <button
                  onClick={onNavigateToImprove}
                  className="sds-btn sds-btn-secondary"
                  style={{ width: '100%' }}
                >
                  <Eye size={14} /> Preview Diff
                </button>
                <button
                  onClick={() => onApplyFix(issue.id)}
                  disabled={isApplying}
                  className="sds-btn sds-btn-primary"
                  style={{ width: '100%' }}
                >
                  <Wrench size={14} /> {isApplying ? 'Applying...' : 'Apply Safe Fix'}
                </button>
              </>
            ) : (
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--sds-text-muted)',
                  textAlign: 'center',
                  padding: '12px',
                }}
              >
                No actions available for this issue.
              </p>
            )}
          </div>
        );
      }
      break;
    }

    case 'project': {
      const proj = inspectorObject.data as InspectorProject;
      header = renderHeader(<Shield size={14} />, proj.name, `Branch: ${proj.branch}`, {
        text: proj.status === 'healthy' || proj.status === 'clean' ? 'Healthy' : 'Needs attention',
        type: proj.status === 'healthy' ? 'success' : 'warning',
      });

      if (activeTab === 'summary') {
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', lineHeight: '1.4' }}>
              Project <strong>{proj.name}</strong> is written in <strong>{proj.language}</strong>.
              Quality is scanned continuously under the active profile.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  padding: '12px',
                  borderRadius: 'var(--sds-radius-md)',
                  border: '1px solid var(--sds-border)',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                  Quality Score
                </span>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--sds-success)',
                    marginTop: '4px',
                  }}
                >
                  92%
                </div>
              </div>
              <div
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  padding: '12px',
                  borderRadius: 'var(--sds-radius-md)',
                  border: '1px solid var(--sds-border)',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                  Active Linters
                </span>
                <div
                  style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    color: 'var(--sds-primary)',
                    marginTop: '4px',
                  }}
                >
                  {proj.plugins?.length || 2}
                </div>
              </div>
            </div>
          </div>
        );
      } else if (activeTab === 'properties') {
        content = renderProperties([
          { label: 'Language', value: proj.language, icon: <Cpu size={12} /> },
          { label: 'Owner', value: proj.owner || 'Sanket Ghodake', icon: <User size={12} /> },
          { label: 'Files Tracked', value: proj.filesCount || 42 },
          { label: 'Active Profile', value: 'Security & Style' },
          { label: 'Branch', value: proj.branch },
        ]);
      } else if (activeTab === 'actions') {
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="sds-btn sds-btn-primary" style={{ width: '100%' }}>
              Run Full Scan
            </button>
            <button className="sds-btn sds-btn-secondary" style={{ width: '100%' }}>
              Configure Profile Rules
            </button>
          </div>
        );
      }
      break;
    }

    case 'file': {
      const file = inspectorObject.data as InspectorFile;
      header = renderHeader(<FileCode size={14} />, file.name, file.path, {
        text: file.issuesCount > 0 ? `${file.issuesCount} Issues` : 'Clean',
        type: file.issuesCount > 0 ? 'warning' : 'success',
      });

      if (activeTab === 'summary') {
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', lineHeight: '1.4' }}>
              File code is monitored for static analysis checks. Click on code highlights inside the
              workspace to inspect specific diagnostics.
            </p>
          </div>
        );
      } else if (activeTab === 'properties') {
        content = renderProperties([
          { label: 'Filename', value: file.name },
          { label: 'Full Path', value: file.path },
          { label: 'Issues Count', value: file.issuesCount },
          { label: 'Lines of Code', value: file.loc || 240 },
          {
            label: 'Last Modified',
            value: file.lastModified || '10 mins ago',
            icon: <Calendar size={12} />,
          },
        ]);
      } else if (activeTab === 'actions') {
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="sds-btn sds-btn-primary" style={{ width: '100%' }}>
              Re-Scan This File
            </button>
          </div>
        );
      }
      break;
    }

    case 'folder': {
      const folder = inspectorObject.data as InspectorFolder;
      header = renderHeader(<Folder size={14} />, folder.name, folder.path);

      if (activeTab === 'summary') {
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', lineHeight: '1.4' }}>
              Directory folder tracked inside Sentinel. All sub-folders and contained source code
              are scanned.
            </p>
          </div>
        );
      } else if (activeTab === 'properties') {
        content = renderProperties([
          { label: 'Directory Name', value: folder.name },
          { label: 'Path', value: folder.path },
          { label: 'Subdirectories', value: folder.subdirsCount || 2 },
          { label: 'Total Files', value: folder.filesCount || 8 },
        ]);
      } else if (activeTab === 'actions') {
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="sds-btn sds-btn-primary" style={{ width: '100%' }}>
              Scan Directory
            </button>
          </div>
        );
      }
      break;
    }

    case 'plugin': {
      const plugin = inspectorObject.data as InspectorPlugin;
      header = renderHeader(<Puzzle size={14} />, plugin.name, `Version: ${plugin.version}`, {
        text: plugin.status || 'Active',
        type: 'success',
      });

      if (activeTab === 'summary') {
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', lineHeight: '1.4', color: 'var(--sds-text)' }}>
              {plugin.description}
            </p>
          </div>
        );
      } else if (activeTab === 'properties') {
        content = renderProperties([
          { label: 'Plugin Name', value: plugin.name },
          { label: 'Version', value: plugin.version },
          { label: 'Status', value: plugin.status || 'Active' },
          { label: 'Category', value: plugin.category || 'Static Analyzer' },
          { label: 'Dockerized', value: 'Yes' },
        ]);
      } else if (activeTab === 'actions') {
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="sds-btn sds-btn-secondary"
              style={{ width: '100%', color: 'var(--sds-danger)' }}
            >
              Deactivate Plugin
            </button>
          </div>
        );
      }
      break;
    }

    case 'recommendation': {
      const rec = inspectorObject.data as InspectorRecommendation;
      header = renderHeader(
        <FileText size={14} />,
        rec.title || 'Safe Recommendation',
        'Quality Engine Action',
      );

      if (activeTab === 'summary') {
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', lineHeight: '1.4' }}>
              {rec.description || 'Improve codebase design pattern alignment.'}
            </p>
            <div
              style={{
                backgroundColor: 'rgba(99,102,241,0.05)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(99,102,241,0.1)',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--sds-primary)' }}>
                Impact
              </span>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>
                {rec.impact || 'Reduces code coupling and satisfies compliance audits.'}
              </p>
            </div>
          </div>
        );
      } else if (activeTab === 'properties') {
        content = renderProperties([
          { label: 'Category', value: rec.category || 'Design Pattern' },
          { label: 'Est. Effort', value: rec.effort || '15 mins', icon: <Clock size={12} /> },
          { label: 'Target', value: rec.target || 'CoreEngine' },
        ]);
      } else if (activeTab === 'actions') {
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="sds-btn sds-btn-primary" style={{ width: '100%' }}>
              Implement Action
            </button>
          </div>
        );
      }
      break;
    }

    case 'profile': {
      header = renderHeader(<User size={14} />, 'Sanket Ghodake', 'Lead Developer');
      if (activeTab === 'summary') {
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ fontSize: '13px', lineHeight: '1.4' }}>
              Developer details and session logs. Commits on this machine will verify against the
              Sentinel pre-commit hooks inside Docker.
            </p>
          </div>
        );
      } else if (activeTab === 'properties') {
        content = renderProperties([
          { label: 'Developer', value: 'Sanket Ghodake' },
          { label: 'Role', value: 'Lead Architect' },
          { label: 'Workspace Host', value: 'Ubuntu Linux' },
          { label: 'Pre-commit Check', value: 'Enabled' },
        ]);
      } else if (activeTab === 'actions') {
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="sds-btn sds-btn-secondary" style={{ width: '100%' }}>
              View Developer Dashboard
            </button>
          </div>
        );
      }
      break;
    }

    case 'home_context': {
      header = renderHeader(<Info size={14} />, 'Home Workspace', 'Overview & Context');

      if (activeTab === 'summary') {
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.15)',
                borderRadius: 'var(--sds-radius-md)',
                padding: 'var(--sds-space-12)',
              }}
            >
              <h4
                style={{
                  fontSize: '11px',
                  color: 'var(--sds-primary)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                }}
              >
                Tip of the Day
              </h4>
              <p style={{ fontSize: '12px', lineHeight: '1.4', color: 'var(--sds-text)' }}>
                Avoid copying collections in loops. Use range-based for loops with{' '}
                <code>const auto&</code> to avoid unnecessary performance overhead.
              </p>
            </div>

            <div>
              <h4
                style={{
                  fontSize: '11px',
                  color: 'var(--sds-text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Plugin Updates Available
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 0',
                    borderBottom: '1px solid var(--sds-border)',
                  }}
                >
                  <span
                    style={{ fontSize: '12px', fontWeight: 500, color: 'var(--sds-text-heading)' }}
                  >
                    clang-tidy
                  </span>
                  <span className="sds-badge sds-badge-info">v17.0.1</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 0',
                  }}
                >
                  <span
                    style={{ fontSize: '12px', fontWeight: 500, color: 'var(--sds-text-heading)' }}
                  >
                    cppcheck
                  </span>
                  <span className="sds-badge sds-badge-info">v2.14</span>
                </div>
              </div>
            </div>

            <div>
              <h4
                style={{
                  fontSize: '11px',
                  color: 'var(--sds-text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}
              >
                Documentation Quick Links
              </h4>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}
              >
                <span
                  style={{
                    color: 'var(--sds-primary)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Sentinel C++ Style Guide
                </span>
                <span
                  style={{
                    color: 'var(--sds-primary)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Offline Compiler Setup
                </span>
              </div>
            </div>
          </div>
        );
      } else if (activeTab === 'properties') {
        content = renderProperties([
          { label: 'Platform Version', value: 'v0.1.0' },
          { label: 'Docker Environment', value: 'Connected' },
          { label: 'Active Analyzers', value: '3 Plugins' },
          { label: 'Local SQLite Cache', value: 'Ready' },
        ]);
      } else if (activeTab === 'actions') {
        content = (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="sds-btn sds-btn-secondary" style={{ width: '100%' }}>
              Browse Rule Directory
            </button>
            <button className="sds-btn sds-btn-secondary" style={{ width: '100%' }}>
              Export Global Report
            </button>
          </div>
        );
      }
      break;
    }

    default:
      header = renderHeader(<HelpCircle size={14} />, 'Unknown Object', 'Details not available');
      content = (
        <p style={{ fontSize: '12px', color: 'var(--sds-text-muted)' }}>
          Object details cannot be rendered.
        </p>
      );
  }

  return (
    <aside
      style={{
        backgroundColor: 'var(--sds-surface)',
        borderLeft: '1px solid var(--sds-border)',
        padding: 'var(--sds-space-24)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflowY: 'auto',
        gap: 'var(--sds-space-24)',
      }}
    >
      {header}
      {renderTabs()}
      <div style={{ flex: 1, marginTop: '8px' }}>{content}</div>
    </aside>
  );
};
