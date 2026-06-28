import React from 'react';
import { Terminal, FileCode, GitPullRequest, Code2, AlertCircle } from 'lucide-react';
import { DiffViewer } from './DiffViewer';
import type { Issue } from '../services/clientApi';

interface BottomDrawerProps {
  selectedIssue: Issue | null;
  selectedFile: string;
  activeTab: 'code' | 'diff' | 'logs' | 'rules' | 'git';
  onTabChange: (tab: 'code' | 'diff' | 'logs' | 'rules' | 'git') => void;
  isScanning: boolean;
  scanProgress: number;
  onApplyFix: (id: string) => Promise<void>;
}

export const BottomDrawer: React.FC<BottomDrawerProps> = ({
  selectedIssue,
  selectedFile,
  activeTab,
  onTabChange,
  isScanning,
  scanProgress,
  onApplyFix,
}) => {
  // Mock logs for scanning
  const getLogs = () => {
    if (isScanning) {
      return [
        `[INFO] [${new Date().toLocaleTimeString()}] Starting Sentinel Core scan...`,
        '[INFO] Loading analyzers: [cppcheck, clang-tidy]',
        '[INFO] Processing rules: [rule-sql-injection, rule-unused-variable]',
        `[RUN ] Scanning codebase files: ${Math.floor(scanProgress / 2.5)}/42 files checked...`,
        scanProgress > 30 ? '[WARN] clang-tidy: Found security warning in IpcServer.cpp:42' : null,
        scanProgress > 60 ? '[WARN] cppcheck: Found dead code in JsonRpcHandler.cpp:85' : null,
        scanProgress >= 100 ? '[INFO] Scan completed successfully. Total issues found: 2.' : null,
      ].filter(Boolean) as string[];
    }
    return [
      '[INFO] Sentinel Engine idle. Ready for command.',
      '[INFO] Active workspace branch: main',
      '[INFO] Pre-commit security audit status: PASS',
    ];
  };

  // Mock code around line of issue
  const getCodeSnippet = () => {
    if (selectedFile === 'IpcServer.cpp') {
      return {
        lines: [
          '#include "IpcServer.h"',
          '#include <sqlite3.h>',
          '#include <string>',
          '',
          'void IpcServer::handleQuery(const std::string& input_val) {',
          '    // Security warning inside this handler',
          '    std::string sql = "SELECT * FROM users WHERE name = \'" + input_val + "\';";',
          '    sqlite3_stmt* stmt;',
          '    int rc = sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, nullptr);',
          '    if (rc == SQLITE_OK) {',
          '        sqlite3_step(stmt);',
          '    }',
          '    sqlite3_finalize(stmt);',
          '}',
        ],
        errorLine: 7,
      };
    } else if (selectedFile === 'JsonRpcHandler.cpp') {
      return {
        lines: [
          '#include "JsonRpcHandler.h"',
          '#include <iostream>',
          '',
          'void JsonRpcHandler::processRequest(const std::string& method, const std::string& params) {',
          '    std::cout << "Received Rpc method: " << method << std::endl;',
          '    int tempCode = 5; // local unused variable warning',
          '    if (method == "ping") {',
          '        sendResponse("pong");',
          '    }',
          '}',
        ],
        errorLine: 6,
      };
    } else {
      // Default fallback code for current file
      return {
        lines: [
          `// Viewing file: ${selectedFile}`,
          '#include <iostream>',
          '#include <vector>',
          '',
          'int main() {',
          '    std::vector<std::string> msg {"Hello", "Sentinel", "World"};',
          '    for (const std::string& word : msg) {',
          '        std::cout << word << " ";',
          '    }',
          '    std::cout << std::endl;',
          '    return 0;',
          '}',
        ],
        errorLine: -1,
      };
    }
  };

  const codeInfo = getCodeSnippet();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--sds-surface)',
        borderTop: '1px solid var(--sds-border)',
      }}
    >
      {/* Tab bar header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.15)',
          borderBottom: '1px solid var(--sds-border)',
          padding: '0 var(--sds-space-16)',
          height: '38px',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', gap: '4px', height: '100%' }}>
          {[
            { id: 'code', label: 'Code Preview', icon: <FileCode size={13} /> },
            { id: 'diff', label: 'Diff Preview', icon: <GitPullRequest size={13} /> },
            { id: 'logs', label: 'Execution Logs', icon: <Terminal size={13} /> },
            { id: 'rules', label: 'Rule Output', icon: <Code2 size={13} /> },
            { id: 'git', label: 'Git Changes', icon: <GitPullRequest size={13} /> },
          ].map((tab) => {
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id as 'code' | 'diff' | 'logs' | 'rules' | 'git')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: isSelected ? 'var(--sds-bg)' : 'transparent',
                  color: isSelected ? 'var(--sds-primary)' : 'var(--sds-text-muted)',
                  border: 'none',
                  borderTop: isSelected ? '2px solid var(--sds-primary)' : '2px solid transparent',
                  padding: '0 16px',
                  fontSize: '11.5px',
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'all var(--sds-transition-fast)',
                }}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div
          style={{
            fontSize: '11px',
            color: 'var(--sds-text-muted)',
            fontFamily: 'var(--sds-font-mono)',
          }}
        >
          {selectedFile ? `Active File: ${selectedFile}` : 'No active file context'}
        </div>
      </div>

      {/* Drawer content pane */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '12px' }}>
        {activeTab === 'code' && (
          <div
            style={{
              height: '100%',
              overflowY: 'auto',
              backgroundColor: '#07080b',
              border: '1px solid var(--sds-border)',
              borderRadius: 'var(--sds-radius-md)',
              padding: '12px',
              fontFamily: 'var(--sds-font-mono)',
              fontSize: '12px',
              lineHeight: '1.6',
            }}
          >
            {codeInfo.lines.map((line, idx) => {
              const isErrorLine = idx + 1 === codeInfo.errorLine;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    backgroundColor: isErrorLine ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                    borderLeft: isErrorLine
                      ? '3px solid var(--sds-danger)'
                      : '3px solid transparent',
                    padding: '1px 8px',
                  }}
                >
                  <span
                    style={{
                      width: '24px',
                      color: isErrorLine ? 'var(--sds-danger)' : 'var(--sds-text-muted)',
                      textAlign: 'right',
                      paddingRight: '12px',
                      userSelect: 'none',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ color: isErrorLine ? '#ffb3b3' : '#f8fafc', whiteSpace: 'pre' }}>
                    {line}
                  </span>
                  {isErrorLine && selectedIssue && (
                    <span
                      style={{
                        marginLeft: '16px',
                        color: 'var(--sds-danger)',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontStyle: 'italic',
                      }}
                    >
                      <AlertCircle size={10} /> {selectedIssue.title}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'diff' && (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {selectedIssue && selectedIssue.fix ? (
              <DiffViewer
                previewText={selectedIssue.fix.actions[0]?.preview || ''}
                status={selectedIssue.status}
                onApply={() => onApplyFix(selectedIssue.id)}
                onCancel={() => {}}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  height: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--sds-text-muted)',
                  border: '1px dashed var(--sds-border)',
                  borderRadius: 'var(--sds-radius-md)',
                  fontSize: '12px',
                }}
              >
                No automated fix recommendation available for selected item.
              </div>
            )}
          </div>
        )}

        {activeTab === 'logs' && (
          <div
            style={{
              height: '100%',
              overflowY: 'auto',
              backgroundColor: '#050508',
              border: '1px solid var(--sds-border)',
              borderRadius: 'var(--sds-radius-md)',
              padding: '12px',
              fontFamily: 'var(--sds-font-mono)',
              fontSize: '11.5px',
              lineHeight: '1.7',
              color: '#d1d5db',
            }}
          >
            {getLogs().map((log, idx) => {
              const isWarn = log.includes('[WARN]');
              return (
                <div key={idx} style={{ color: isWarn ? 'var(--sds-warning)' : '#d1d5db' }}>
                  {log}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'rules' && (
          <div
            style={{
              height: '100%',
              overflowY: 'auto',
              backgroundColor: '#07080b',
              border: '1px solid var(--sds-border)',
              borderRadius: 'var(--sds-radius-md)',
              padding: '16px',
              fontSize: '12.5px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {selectedIssue ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--sds-border)',
                    paddingBottom: '8px',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--sds-text-heading)' }}>
                    {selectedIssue.ruleId} ({selectedIssue.analyzerId})
                  </span>
                  <span className="sds-badge sds-badge-info">
                    Confidence: {selectedIssue.confidence}
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>
                    <span
                      style={{ color: 'var(--sds-text-muted)', fontSize: '11px', display: 'block' }}
                    >
                      Trigger Condition
                    </span>
                    <code
                      style={{
                        fontFamily: 'var(--sds-font-mono)',
                        fontSize: '11px',
                        color: 'var(--sds-danger)',
                      }}
                    >
                      {selectedIssue.evidence}
                    </code>
                  </div>
                  <div>
                    <span
                      style={{ color: 'var(--sds-text-muted)', fontSize: '11px', display: 'block' }}
                    >
                      References
                    </span>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      {selectedIssue.references?.map((ref, idx) => (
                        <span
                          key={idx}
                          className="sds-badge"
                          style={{ backgroundColor: 'rgba(255,255,255,0.05)', fontSize: '10px' }}
                        >
                          {ref}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{ color: 'var(--sds-text-muted)', textAlign: 'center', marginTop: '30px' }}
              >
                Select an issue to inspect analyzer rule criteria.
              </div>
            )}
          </div>
        )}

        {activeTab === 'git' && (
          <div
            style={{
              height: '100%',
              overflowY: 'auto',
              backgroundColor: '#050508',
              border: '1px solid var(--sds-border)',
              borderRadius: 'var(--sds-radius-md)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                borderBottom: '1px solid var(--sds-border)',
                paddingBottom: '8px',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--sds-text-heading)' }}>
                Local Workspace Git Changes
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--sds-text-muted)',
                  fontFamily: 'var(--sds-font-mono)',
                }}
              >
                branch: main
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontFamily: 'var(--sds-font-mono)',
                fontSize: '12px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--sds-success)',
                }}
              >
                <span style={{ fontWeight: 600, width: '16px' }}>A</span>
                <span style={{ color: 'var(--sds-text)' }}>core/storage/Database.cpp</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--sds-warning)',
                }}
              >
                <span style={{ fontWeight: 600, width: '16px' }}>M</span>
                <span style={{ color: 'var(--sds-text)' }}>ui/src/App.tsx</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--sds-danger)',
                }}
              >
                <span style={{ fontWeight: 600, width: '16px' }}>D</span>
                <span style={{ color: 'var(--sds-text-muted)', textDecoration: 'line-through' }}>
                  tests/unit/test_fake_data.cpp
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
