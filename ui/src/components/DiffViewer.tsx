import React from 'react';
import { Check, X, ArrowRight } from 'lucide-react';

interface DiffViewerProps {
  previewText: string;
  onApply?: () => void;
  onCancel?: () => void;
  isApplying?: boolean;
  status: 'Open' | 'Resolved';
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  previewText,
  onApply,
  onCancel,
  isApplying = false,
  status,
}) => {
  // Parse the custom diff block
  // Format:
  // <<<<
  // // BEFORE:
  // original lines
  // ====
  // // AFTER:
  // modified lines
  // >>>>
  let beforeLines: string[] = [];
  let afterLines: string[] = [];

  try {
    const cleaned = previewText.replace('<<<<', '').replace('>>>>', '');
    const parts = cleaned.split('====');

    if (parts.length >= 2) {
      beforeLines = parts[0]
        .split('\n')
        .filter((line, i) => i > 0 || !line.includes('BEFORE:')) // Skip the first header comment line
        .map((line) => line.trimEnd());

      afterLines = parts[1]
        .split('\n')
        .filter((line, i) => i > 0 || !line.includes('AFTER:')) // Skip the first header comment line
        .map((line) => line.trimEnd());
    } else {
      // Fallback
      beforeLines = [previewText];
      afterLines = [];
    }
  } catch (e) {
    beforeLines = ['Error parsing diff preview'];
    afterLines = [];
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--sds-surface)',
        border: '1px solid var(--sds-border)',
        borderRadius: 'var(--sds-radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--sds-space-12) var(--sds-space-24)',
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderBottom: '1px solid var(--sds-border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sds-space-12)' }}>
          <span style={{ fontWeight: 600, color: 'var(--sds-text-heading)' }}>
            Interactive Diff Review
          </span>
          <span
            className={`sds-badge ${status === 'Resolved' ? 'sds-badge-success' : 'sds-badge-warning'}`}
          >
            {status === 'Resolved' ? 'Changes Applied' : 'Pending Review'}
          </span>
        </div>

        {status === 'Open' && onApply && onCancel && (
          <div style={{ display: 'flex', gap: 'var(--sds-space-12)' }}>
            <button
              onClick={onCancel}
              className="sds-btn sds-btn-ghost"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <X size={14} />
              Cancel
            </button>
            <button
              onClick={onApply}
              disabled={isApplying}
              className="sds-btn sds-btn-primary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <Check size={14} />
              {isApplying ? 'Applying...' : 'Apply Fix'}
            </button>
          </div>
        )}
      </div>

      {/* Split Panels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          flex: 1,
          overflow: 'hidden',
          backgroundColor: '#07080b',
        }}
      >
        {/* Before / Left Panel */}
        <div
          style={{
            borderRight: '1px solid var(--sds-border)',
            overflowY: 'auto',
            padding: 'var(--sds-space-16)',
            fontFamily: 'var(--sds-font-mono)',
            fontSize: '12px',
            lineHeight: '1.6',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--sds-danger)',
              marginBottom: '12px',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            <span>ORIGINAL CODE</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {beforeLines.map((line, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  backgroundColor:
                    line.startsWith('-') || line.includes('BEFORE') || beforeLines.length > 1
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'transparent',
                  padding: '2px 8px',
                  borderRadius: '2px',
                }}
              >
                <span
                  style={{
                    width: '24px',
                    color: 'var(--sds-text-muted)',
                    userSelect: 'none',
                    textAlign: 'right',
                    paddingRight: '8px',
                  }}
                >
                  {idx + 1}
                </span>
                <span style={{ color: '#f8fafc', whiteSpace: 'pre', overflowX: 'auto' }}>
                  {line}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* After / Right Panel */}
        <div
          style={{
            overflowY: 'auto',
            padding: 'var(--sds-space-16)',
            fontFamily: 'var(--sds-font-mono)',
            fontSize: '12px',
            lineHeight: '1.6',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--sds-success)',
              marginBottom: '12px',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            <ArrowRight size={12} />
            <span>PROPOSED FIX</span>
          </div>
          {afterLines.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {afterLines.map((line, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    backgroundColor:
                      line.startsWith('+') || line.includes('AFTER') || afterLines.length > 1
                        ? 'rgba(16, 185, 129, 0.15)'
                        : 'transparent',
                    padding: '2px 8px',
                    borderRadius: '2px',
                  }}
                >
                  <span
                    style={{
                      width: '24px',
                      color: 'var(--sds-text-muted)',
                      userSelect: 'none',
                      textAlign: 'right',
                      paddingRight: '8px',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ color: '#f8fafc', whiteSpace: 'pre', overflowX: 'auto' }}>
                    {line}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                height: '80%',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--sds-text-muted)',
              }}
            >
              {status === 'Resolved'
                ? 'Changes successfully written to file.'
                : 'No modified preview lines.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
