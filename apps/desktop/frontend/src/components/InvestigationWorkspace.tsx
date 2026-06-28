import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Shield,
  Activity,
  Wrench,
  Bookmark,
  ExternalLink,
  Share2,
  GitCommit,
  History,
  FileText,
  MessageSquare,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Eye,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import type { Recommendation, Project } from '../services/clientApi';
import type { InspectorObject } from './Inspector';

interface InvestigationWorkspaceProps {
  activeProject: Project;
  recommendations: Recommendation[];
  activeRecommendationId: string;
  onClose: () => void;
  onApplyFix: (id: string) => Promise<void>;
  isApplying: boolean;
  setInspectorObject: (obj: InspectorObject | null) => void;
}

type PanelId =
  | 'summary'
  | 'why'
  | 'call_flow'
  | 'ownership'
  | 'related'
  | 'git'
  | 'reasoning'
  | 'preview'
  | 'docs'
  | 'discussion';

type ExplainLevel = 'Simple' | 'Technical' | 'Expert';

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  activeProject,
  recommendations,
  activeRecommendationId,
  onClose,
  onApplyFix,
  isApplying,
  setInspectorObject,
}) => {
  const [currentRecId, setCurrentRecId] = useState(activeRecommendationId);
  const [activePanel, setActivePanel] = useState<PanelId>('summary');
  const [explainLevel, setExplainLevel] = useState<ExplainLevel>('Technical');
  const [showTeachMe, setShowTeachMe] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [compareWithId, setCompareWithId] = useState<string | null>(null);

  // Custom interactive mock data states
  const [comments, setComments] = useState<string[]>([
    'Sanket: Verified this conforms to AUTOSAR rule A15-0-2.',
  ]);
  const [newComment, setNewComment] = useState('');
  const [selectedCallNode, setSelectedCallNode] = useState<string>('handleQuery');

  const currentRecIndex = recommendations.findIndex((r) => r.id === currentRecId);
  const currentRec = recommendations[currentRecIndex] || recommendations[0];

  // Sync right-hand Inspector context depending on active panel or call nodes
  useEffect(() => {
    if (!currentRec) return;

    if (activePanel === 'summary') {
      setInspectorObject({
        type: 'recommendation',
        data: {
          title: currentRec.title,
          description: currentRec.description,
          category: currentRec.origin.split('/')[0],
          effort: currentRec.estimatedEffort,
          target: currentRec.evidence.fileId,
          impact: currentRec.estimatedImpact,
        },
      });
    } else if (activePanel === 'git') {
      setInspectorObject({
        type: 'profile',
        data: {
          name: 'Sanket Ghodake',
          role: 'Lead Architect',
          commit: 'e5f67b2d',
          date: '2 days ago',
          churn: 'Low',
          details: 'Introduced in commit: Initialize database query interface.',
        },
      });
    } else if (activePanel === 'call_flow') {
      const nodeDetails: Record<string, { params: string; owner: string; complexity: number }> = {
        main: { params: 'int argc, char** argv', owner: 'Platform', complexity: 2 },
        dispatch: { params: 'const Request& req', owner: 'IPC Routing', complexity: 5 },
        handleQuery: {
          params: 'std::string queryText',
          owner: 'Database Controller',
          complexity: 8,
        },
      };
      const details = nodeDetails[selectedCallNode] || nodeDetails.handleQuery;
      setInspectorObject({
        type: 'recommendation',
        data: {
          title: `Function: ${selectedCallNode}()`,
          description: `Active trace node inside module ${activeProject.name}.`,
          category: 'Call Flow Node',
          effort: `Complexity: ${details.complexity}`,
          target: `Parameters: (${details.params})`,
          impact: `Owner: ${details.owner}`,
        },
      });
    } else {
      setInspectorObject({
        type: 'recommendation',
        data: {
          title: currentRec.title,
          description: `Active Panel: ${activePanel.toUpperCase().replace('_', ' ')}`,
          category: currentRec.origin,
          effort: currentRec.estimatedEffort,
          target: currentRec.evidence.fileId,
        },
      });
    }
  }, [activePanel, currentRecId, selectedCallNode]);

  // Keyboard Navigation hooks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'j': // Next Issue
          if (currentRecIndex < recommendations.length - 1) {
            setCurrentRecId(recommendations[currentRecIndex + 1].id);
          }
          break;
        case 'k': // Previous Issue
          if (currentRecIndex > 0) {
            setCurrentRecId(recommendations[currentRecIndex - 1].id);
          }
          break;
        case 'arrowleft': // Back to standard list
          onClose();
          break;
        case 'arrowright': {
          // Cycle active panel
          const panels: PanelId[] = [
            'summary',
            'why',
            'call_flow',
            'ownership',
            'related',
            'git',
            'reasoning',
            'preview',
            'docs',
            'discussion',
          ];
          const nextIdx = (panels.indexOf(activePanel) + 1) % panels.length;
          setActivePanel(panels[nextIdx]);
          break;
        }
        case 'f': // Focus Preview Panel
          setActivePanel('preview');
          break;
        case 'g': // Focus Git Panel
          setActivePanel('git');
          break;
        case 'd': // Focus Documentation Panel
          setActivePanel('docs');
          break;
        case 't': // Toggle Teach Me
          setShowTeachMe((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentRecIndex, recommendations, activePanel, onClose]);

  if (!currentRec) return null;

  const compareRec = recommendations.find((r) => r.id === compareWithId);

  const getExplainText = () => {
    if (explainLevel === 'Simple') return currentRec.explanation.simple;
    if (explainLevel === 'Technical') return currentRec.explanation.technical;
    return currentRec.explanation.expert;
  };

  const addComment = () => {
    if (newComment.trim()) {
      setComments((prev) => [...prev, `Developer: ${newComment}`]);
      setNewComment('');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        gap: 'var(--sds-space-16)',
        color: 'var(--sds-text)',
      }}
    >
      {/* 1. Breadcrumbs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11px',
          color: 'var(--sds-text-muted)',
          paddingBottom: '4px',
          borderBottom: '1px solid var(--sds-border)',
        }}
      >
        <span
          onClick={onClose}
          style={{ cursor: 'pointer' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--sds-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--sds-text-muted)')}
        >
          {activeProject.name}
        </span>
        <ChevronRight size={10} />
        <span>Module</span>
        <ChevronRight size={10} />
        <span>{currentRec.evidence.fileId}</span>
        <ChevronRight size={10} />
        <span style={{ color: 'var(--sds-text-heading)' }}>{currentRec.title}</span>
      </div>

      {/* 2. Investigation Toolbar */}
      <div
        className="sds-card"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px var(--sds-space-16)',
          background: 'linear-gradient(90deg, rgba(99,102,241,0.06) 0%, rgba(18,20,28,0.4) 100%)',
          borderColor: 'rgba(99,102,241,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onClose}
            className="sds-btn sds-btn-secondary"
            style={{
              padding: '6px 12px',
              minWidth: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ArrowLeft size={13} /> Back
          </button>

          <button
            disabled={currentRecIndex === 0}
            onClick={() => setCurrentRecId(recommendations[currentRecIndex - 1].id)}
            className="sds-btn sds-btn-secondary"
            style={{ padding: '6px 12px', minWidth: 'auto' }}
          >
            Prev
          </button>
          <button
            disabled={currentRecIndex === recommendations.length - 1}
            onClick={() => setCurrentRecId(recommendations[currentRecIndex + 1].id)}
            className="sds-btn sds-btn-secondary"
            style={{ padding: '6px 12px', minWidth: 'auto' }}
          >
            Next
          </button>

          <div style={{ height: '16px', width: '1px', backgroundColor: 'var(--sds-border)' }} />

          {/* Explain Cycle Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>Explain:</span>
            <select
              value={explainLevel}
              onChange={(e) => setExplainLevel(e.target.value as ExplainLevel)}
              style={{
                backgroundColor: 'var(--sds-surface-hover)',
                border: '1px solid var(--sds-border)',
                color: 'var(--sds-text-heading)',
                fontSize: '11px',
                borderRadius: 'var(--sds-radius-sm)',
                padding: '4px 8px',
                outline: 'none',
              }}
            >
              <option value="Simple">Simple (Layman)</option>
              <option value="Technical">Technical (Engineer)</option>
              <option value="Expert">Expert (Principal)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowTeachMe(true)}
            className="sds-btn sds-btn-secondary"
            style={{
              padding: '6px 12px',
              minWidth: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderColor: 'var(--sds-success)',
              color: 'var(--sds-success)',
            }}
          >
            <Sparkles size={13} /> Teach Me
          </button>

          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="sds-btn sds-btn-secondary"
            style={{
              padding: '6px 12px',
              minWidth: 'auto',
              color: isBookmarked ? 'var(--sds-primary)' : 'var(--sds-text-muted)',
            }}
          >
            <Bookmark size={13} style={{ fill: isBookmarked ? 'var(--sds-primary)' : 'none' }} />
          </button>

          <button
            onClick={() => window.open(`vscode://file${currentRec.evidence.fileId}`)}
            className="sds-btn sds-btn-secondary"
            style={{ padding: '6px 12px', minWidth: 'auto' }}
            title="Open file in Local VS Code"
          >
            <ExternalLink size={13} />
          </button>

          <button
            onClick={() => alert(`Copied Investigation Link: sentinel://rec/${currentRec.id}`)}
            className="sds-btn sds-btn-secondary"
            style={{ padding: '6px 12px', minWidth: 'auto' }}
          >
            <Share2 size={13} />
          </button>

          {currentRec.safeAutomationLevel !== 'NO' && (
            <button
              onClick={() => onApplyFix(currentRec.id)}
              disabled={isApplying}
              className="sds-btn sds-btn-primary"
              style={{
                padding: '6px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor:
                  currentRec.safeAutomationLevel === 'YES'
                    ? 'var(--sds-success)'
                    : 'var(--sds-primary)',
              }}
            >
              <Wrench size={13} />
              {isApplying
                ? 'Applying...'
                : currentRec.safeAutomationLevel === 'YES'
                  ? 'Auto-Apply'
                  : 'Apply Fix'}
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Split Workspace */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--sds-space-16)',
          flex: 1,
          minHeight: '400px',
        }}
      >
        {/* Left Vertical Panel Selector */}
        <div
          style={{
            width: '180px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            borderRight: '1px solid var(--sds-border)',
            paddingRight: '12px',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--sds-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
              paddingLeft: '8px',
            }}
          >
            Investigation Panels
          </span>
          {(
            [
              { id: 'summary', label: '1. Summary', icon: <Info size={12} /> },
              { id: 'why', label: '2. Why Flow', icon: <Layers size={12} /> },
              { id: 'call_flow', label: '3. Call Flow', icon: <GitCommit size={12} /> },
              { id: 'ownership', label: '4. Ownership', icon: <Shield size={12} /> },
              { id: 'related', label: '5. Related', icon: <Activity size={12} /> },
              { id: 'git', label: '6. Git History', icon: <History size={12} /> },
              { id: 'reasoning', label: '7. Reasoning', icon: <Lightbulb size={12} /> },
              { id: 'preview', label: '8. Preview Diff', icon: <Eye size={12} /> },
              { id: 'docs', label: '9. Documentation', icon: <FileText size={12} /> },
              { id: 'discussion', label: '10. Discussion', icon: <MessageSquare size={12} /> },
            ] as { id: PanelId; label: string; icon: React.ReactNode }[]
          ).map((panel) => (
            <button
              key={panel.id}
              onClick={() => setActivePanel(panel.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 12px',
                borderRadius: 'var(--sds-radius-md)',
                border: 'none',
                backgroundColor: activePanel === panel.id ? 'rgba(99,102,241,0.08)' : 'transparent',
                color: activePanel === panel.id ? 'var(--sds-primary)' : 'var(--sds-text)',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: activePanel === panel.id ? 600 : 500,
                cursor: 'pointer',
                transition: 'all var(--sds-transition-fast)',
              }}
            >
              {panel.icon}
              {panel.label}
            </button>
          ))}

          <div
            style={{
              marginTop: 'auto',
              paddingTop: '16px',
              borderTop: '1px solid var(--sds-border)',
            }}
          >
            <span style={{ fontSize: '10px', color: 'var(--sds-text-muted)' }}>
              Comparison Tool
            </span>
            <select
              value={compareWithId || ''}
              onChange={(e) => setCompareWithId(e.target.value || null)}
              style={{
                width: '100%',
                backgroundColor: 'var(--sds-surface)',
                border: '1px solid var(--sds-border)',
                color: 'var(--sds-text)',
                fontSize: '11px',
                marginTop: '6px',
                padding: '4px',
                borderRadius: 'var(--sds-radius-sm)',
              }}
            >
              <option value="">Compare with...</option>
              {recommendations
                .filter((r) => r.id !== currentRec.id)
                .map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Center Panel Content Display */}
        <div
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 'var(--sds-radius-lg)',
            border: '1px solid var(--sds-border)',
            padding: 'var(--sds-space-20)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
          }}
        >
          {/* Active Panel Rendering */}

          {/* Panel 1: Summary */}
          {activePanel === 'summary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <h3
                    style={{ fontSize: '16px', fontWeight: 600, color: 'var(--sds-text-heading)' }}
                  >
                    {currentRec.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--sds-text-muted)', marginTop: '4px' }}>
                    Origin Rule: <code>{currentRec.origin}</code>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span
                    className={`sds-badge sds-badge-${currentRec.confidence.level === 'High' ? 'success' : 'warning'}`}
                  >
                    Confidence: {currentRec.confidence.score}%
                  </span>
                  <span className="sds-badge sds-badge-info">
                    Effort: {currentRec.estimatedEffort}
                  </span>
                </div>
              </div>

              {/* Explain Level Content */}
              <div
                style={{
                  padding: '12px',
                  backgroundColor: 'var(--sds-surface-hover)',
                  borderLeft: '4px solid var(--sds-primary)',
                  borderRadius: 'var(--sds-radius-md)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    color: 'var(--sds-text-muted)',
                    marginBottom: '6px',
                  }}
                >
                  <Sparkles size={12} color="var(--sds-primary)" />
                  <span>
                    Explainability Tier: <strong>{explainLevel}</strong>
                  </span>
                </div>
                <p
                  style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--sds-text-heading)' }}
                >
                  {getExplainText()}
                </p>
              </div>

              {/* Evidence Section */}
              <div
                style={{
                  backgroundColor: '#07080b',
                  border: '1px solid var(--sds-border)',
                  borderRadius: 'var(--sds-radius-md)',
                  padding: '12px',
                  fontFamily: 'var(--sds-font-mono)',
                  fontSize: '11px',
                }}
              >
                <span
                  style={{
                    color: 'var(--sds-text-muted)',
                    fontSize: '10px',
                    textTransform: 'uppercase',
                  }}
                >
                  Evidence Match
                </span>
                <div style={{ color: 'var(--sds-success)', marginTop: '4px' }}>
                  File: {currentRec.evidence.fileId} | Line: {currentRec.evidence.line}
                </div>
                <div style={{ color: 'var(--sds-danger)', marginTop: '4px' }}>
                  Matched pattern: <code>{currentRec.evidence.matchedPattern}</code>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Blast Radius */}
                <div className="sds-card" style={{ padding: '12px' }}>
                  <h4
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--sds-text-heading)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <AlertTriangle size={13} color="var(--sds-warning)" /> Blast Radius Impact
                  </h4>
                  <ul
                    style={{
                      fontSize: '12px',
                      paddingLeft: '20px',
                      marginTop: '8px',
                      lineHeight: '1.6',
                    }}
                  >
                    <li>Affected Files: {currentRec.blastRadius.affectedFiles}</li>
                    <li>Module: {currentRec.blastRadius.affectedModule}</li>
                    <li>
                      Public API Modified: {currentRec.blastRadius.publicApiChanged ? 'YES' : 'NO'}
                    </li>
                    <li>Tests Impacted: {currentRec.blastRadius.testsImpacted}</li>
                    <li>Binary Compatibility: {currentRec.blastRadius.binaryCompatibility}</li>
                  </ul>
                </div>

                {/* Why Now */}
                <div className="sds-card" style={{ padding: '12px' }}>
                  <h4
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--sds-text-heading)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Info size={13} color="var(--sds-primary)" /> Why Now?
                  </h4>
                  <ul
                    style={{
                      fontSize: '12px',
                      paddingLeft: '20px',
                      marginTop: '8px',
                      lineHeight: '1.6',
                    }}
                  >
                    {currentRec.whyNow.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Panel 2: Why Flow */}
          {activePanel === 'why' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>
                Concurrency/Memory Timeline Visualization
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative',
                  paddingLeft: '24px',
                  borderLeft: '2px dashed var(--sds-border)',
                }}
              >
                {[
                  {
                    title: 'Allocation',
                    desc: 'Object allocated heap memory at main entry flow.',
                    time: '0ms',
                  },
                  {
                    title: 'Ownership Transfer',
                    desc: 'Raw pointer passed to dispatch Routing module.',
                    time: '+12ms',
                  },
                  {
                    title: 'Safety Violation',
                    desc: 'Raw string concatenation injected without parameter placeholder.',
                    time: '+15ms',
                  },
                  {
                    title: 'Leak / Risk Vector',
                    desc: 'Database execute called. Stack context frame drops.',
                    time: 'Execution',
                  },
                ].map((step, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: '-31px',
                        top: '4px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor:
                          idx === 2 ? 'var(--sds-danger)' : 'var(--sds-border-hover)',
                        border: '3px solid var(--sds-surface)',
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: '12px',
                          color: idx === 2 ? 'var(--sds-danger)' : 'var(--sds-text-heading)',
                        }}
                      >
                        {step.title}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--sds-text-muted)' }}>
                        {step.time}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: '2px 0 0 0',
                        fontSize: '12px',
                        color: 'var(--sds-text-muted)',
                      }}
                    >
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Panel 3: Call Flow */}
          {activePanel === 'call_flow' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>
                Interactive Call Trace (Click nodes to inspect)
              </h3>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  border: '1px dashed var(--sds-border)',
                  borderRadius: 'var(--sds-radius-md)',
                  padding: '24px',
                }}
              >
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                  {['main', 'dispatch', 'handleQuery'].map((node, i) => (
                    <React.Fragment key={node}>
                      <button
                        onClick={() => setSelectedCallNode(node)}
                        style={{
                          padding: '12px 18px',
                          backgroundColor:
                            selectedCallNode === node
                              ? 'rgba(99,102,241,0.15)'
                              : 'var(--sds-surface)',
                          border:
                            selectedCallNode === node
                              ? '2px solid var(--sds-primary)'
                              : '1px solid var(--sds-border)',
                          color:
                            selectedCallNode === node
                              ? 'var(--sds-primary)'
                              : 'var(--sds-text-heading)',
                          fontFamily: 'var(--sds-font-mono)',
                          fontSize: '12px',
                          borderRadius: 'var(--sds-radius-md)',
                          cursor: 'pointer',
                          boxShadow:
                            selectedCallNode === node ? '0 0 10px rgba(99,102,241,0.3)' : 'none',
                        }}
                      >
                        {node}()
                        {node === 'handleQuery' && (
                          <span style={{ color: 'var(--sds-danger)', marginLeft: '4px' }}>⚠️</span>
                        )}
                      </button>
                      {i < 2 && <span style={{ color: 'var(--sds-border-hover)' }}>➔</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Panel 4: Ownership Flow */}
          {activePanel === 'ownership' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>
                Pointer Ownership Lifecycle Flowchart
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: 'var(--sds-surface-hover)',
                  borderRadius: 'var(--sds-radius-md)',
                }}
              >
                {[
                  {
                    phase: 'CREATE',
                    desc: 'Raw memory scope allocation.',
                    scope: 'IpcServer.cpp:L38',
                  },
                  {
                    phase: 'PASS (RAW)',
                    desc: 'Passed as non-owning raw pointer parameter.',
                    scope: 'dispatch():L45',
                  },
                  {
                    phase: 'VIOLATION',
                    desc: 'Lifetime scope ends, pointer goes out of bound.',
                    scope: 'handleQuery():L52',
                  },
                ].map((life, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      borderBottom: '1px solid rgba(255,255,255,0.03)',
                      paddingBottom: '6px',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontWeight: 700,
                          color: i === 2 ? 'var(--sds-danger)' : 'var(--sds-primary)',
                          marginRight: '8px',
                        }}
                      >
                        [{life.phase}]
                      </span>
                      <span>{life.desc}</span>
                    </div>
                    <code style={{ fontSize: '10px', color: 'var(--sds-text-muted)' }}>
                      {life.scope}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Panel 5: Related Knowledge */}
          {activePanel === 'related' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>
                Related Warnings and Knowledge Bases
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="sds-card" style={{ padding: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--sds-primary)', fontWeight: 600 }}>
                    Rule Correlation
                  </span>
                  <p style={{ fontSize: '12px', marginTop: '6px' }}>
                    3 other modules triggered <code>{currentRec.origin}</code> this week.
                  </p>
                </div>
                <div className="sds-card" style={{ padding: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--sds-success)', fontWeight: 600 }}>
                    Pattern Correlation
                  </span>
                  <p style={{ fontSize: '12px', marginTop: '6px' }}>
                    Similar logic found in <code>DatabaseConnector.cpp</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Panel 6: Git History */}
          {activePanel === 'git' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>
                Git Blame & History introducing this warning
              </h3>
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--sds-surface-hover)',
                  borderRadius: 'var(--sds-radius-md)',
                  border: '1px solid var(--sds-border)',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span
                    style={{ fontWeight: 600, fontSize: '13px', color: 'var(--sds-text-heading)' }}
                  >
                    Sanket Ghodake
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                    Date: June 26, 2026
                  </span>
                </div>
                <code
                  style={{
                    fontSize: '11px',
                    color: 'var(--sds-primary)',
                    display: 'block',
                    margin: '6px 0',
                  }}
                >
                  commit e5f67b2d56a3109d94
                </code>
                <p style={{ margin: 0, fontSize: '12px', lineHeight: '1.4' }}>
                  "Initialize database query interface and add SQL routing event handler callbacks."
                </p>
              </div>
            </div>
          )}

          {/* Panel 7: Analyzer Reasoning */}
          {activePanel === 'reasoning' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>
                Analyzer Diagnostic Logical Flow
              </h3>
              <div
                style={{
                  fontFamily: 'var(--sds-font-mono)',
                  fontSize: '11px',
                  padding: '12px',
                  backgroundColor: '#07080b',
                  border: '1px solid var(--sds-border)',
                  borderRadius: 'var(--sds-radius-md)',
                }}
              >
                <div>
                  [1] Match node rule: <code>sqlite3_prepare_v2</code>
                </div>
                <div>[2] Scan input argument tree logic...</div>
                <div style={{ color: 'var(--sds-danger)' }}>
                  ➔ Condition matches: string concatenation (operator +) inside query arguments.
                </div>
                <div style={{ color: 'var(--sds-success)' }}>
                  ➔ Result: Injection Vulnerability detected (Certainty: High).
                </div>
              </div>
            </div>
          )}

          {/* Panel 8: Preview */}
          {activePanel === 'preview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <h3 style={{ fontSize: '14px', fontWeight: 600 }}>
                  Proposed Fix Preview (Side-by-side)
                </h3>
                <span className="sds-badge sds-badge-success">Compile Risk: Safe</span>
              </div>

              <div
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--sds-danger)' }}>Current Code</span>
                  <pre
                    style={{
                      flex: 1,
                      margin: 0,
                      padding: '12px',
                      backgroundColor: '#0d0202',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      borderRadius: 'var(--sds-radius-md)',
                      fontFamily: 'var(--sds-font-mono)',
                      fontSize: '11px',
                      color: 'var(--sds-text)',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {currentRec.preview.currentCode}
                  </pre>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--sds-success)' }}>
                    Suggested Code
                  </span>
                  <pre
                    style={{
                      flex: 1,
                      margin: 0,
                      padding: '12px',
                      backgroundColor: '#020d04',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: 'var(--sds-radius-md)',
                      fontFamily: 'var(--sds-font-mono)',
                      fontSize: '11px',
                      color: 'var(--sds-text)',
                      overflow: 'auto',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {currentRec.preview.suggestedCode}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Panel 9: Documentation */}
          {activePanel === 'docs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>
                Compliance Standards & Guidelines
              </h3>
              <div className="sds-card" style={{ padding: '16px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--sds-text-heading)' }}>
                  {currentRec.learningMode.concept}
                </h4>
                <p style={{ fontSize: '13px', marginTop: '8px', lineHeight: '1.4' }}>
                  {currentRec.learningMode.rationale}
                </p>
                <div
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.1)',
                    borderRadius: 'var(--sds-radius-md)',
                    padding: '12px',
                    marginTop: '12px',
                    fontSize: '12px',
                  }}
                >
                  <strong>Best Practice:</strong> {currentRec.learningMode.bestPractice}
                </div>
                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                    References:
                  </span>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    {currentRec.learningMode.references.map((ref, idx) => (
                      <span key={idx} className="sds-badge sds-badge-info">
                        {ref}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Panel 10: Discussion */}
          {activePanel === 'discussion' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600 }}>Shared Notes & Code Reviews</h3>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  overflowY: 'auto',
                }}
              >
                {comments.map((comment, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: 'var(--sds-surface-hover)',
                      borderRadius: 'var(--sds-radius-sm)',
                      fontSize: '12px',
                      border: '1px solid var(--sds-border)',
                    }}
                  >
                    {comment}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Add note or review comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addComment()}
                  style={{
                    flex: 1,
                    backgroundColor: 'var(--sds-surface)',
                    border: '1px solid var(--sds-border)',
                    borderRadius: 'var(--sds-radius-md)',
                    color: 'var(--sds-text-heading)',
                    fontSize: '12px',
                    padding: '8px 12px',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={addComment}
                  className="sds-btn sds-btn-primary"
                  style={{ padding: '8px 16px', minWidth: 'auto' }}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Render Comparison View if selected */}
          {compareRec && (
            <div
              style={{
                marginTop: '16px',
                paddingTop: '16px',
                borderTop: '2px solid var(--sds-border)',
                backgroundColor: 'rgba(255,255,255,0.01)',
              }}
            >
              <h3
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--sds-primary)',
                  marginBottom: '8px',
                }}
              >
                Comparison: {compareRec.title}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--sds-text-muted)' }}>
                {compareRec.description}
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <span className="sds-badge sds-badge-info">
                  Confidence: {compareRec.confidence.score}%
                </span>
                <span className="sds-badge sds-badge-warning">
                  Safe Fix: {compareRec.safeAutomationLevel}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Teach Me Overlay (Learning Mode) */}
      {showTeachMe && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            className="sds-card"
            style={{
              maxWidth: '650px',
              width: '100%',
              backgroundColor: 'var(--sds-surface)',
              borderRadius: 'var(--sds-radius-lg)',
              border: '1px solid var(--sds-primary)',
              padding: '24px',
              boxShadow: '0 10px 30px rgba(99,102,241,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--sds-success)',
                }}
              >
                <Sparkles size={18} />
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--sds-text-heading)' }}>
                  Learning Mode: {currentRec.learningMode.concept}
                </h3>
              </div>
              <button
                onClick={() => setShowTeachMe(false)}
                className="sds-btn sds-btn-secondary"
                style={{ padding: '4px 8px', minWidth: 'auto' }}
              >
                Close
              </button>
            </div>

            <p style={{ fontSize: '13px', lineHeight: '1.5', color: 'var(--sds-text)' }}>
              {currentRec.learningMode.rationale}
            </p>

            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.04)',
                border: '1px solid rgba(16, 185, 129, 0.1)',
                borderRadius: 'var(--sds-radius-md)',
                padding: '16px',
              }}
            >
              <h4
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--sds-success)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle size={14} /> Rule & Best Practice Guidelines
              </h4>
              <p
                style={{
                  fontSize: '12px',
                  marginTop: '6px',
                  color: 'var(--sds-text-heading)',
                  lineHeight: '1.4',
                }}
              >
                {currentRec.learningMode.bestPractice}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                Example Compliant C++ Implementation:
              </span>
              <pre
                style={{
                  margin: 0,
                  padding: '12px',
                  backgroundColor: '#07080b',
                  borderRadius: 'var(--sds-radius-md)',
                  fontFamily: 'var(--sds-font-mono)',
                  fontSize: '11px',
                  color: 'var(--sds-text)',
                  overflowX: 'auto',
                }}
              >
                {`// Safe C++ implementation using Parameterized Bindings
std::string sql = "SELECT * FROM users WHERE name = ?;";
sqlite3_stmt* stmt;
if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr) == SQLITE_OK) {
    sqlite3_bind_text(stmt, 1, input_val.c_str(), -1, SQLITE_TRANSIENT);
    // Execute safety check...
}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
