import React, { useState } from 'react';
import { Folder, FileCode, ChevronDown, ChevronRight } from 'lucide-react';

interface ExplorerNode {
  name: string;
  path: string;
  type: 'folder' | 'file';
  issuesCount: number;
  children?: ExplorerNode[];
}

interface DirectoryExplorerProps {
  selectedFile: string;
  onFileSelect: (path: string) => void;
  issues: { fileId: string; severity: string }[];
}

export const DirectoryExplorer: React.FC<DirectoryExplorerProps> = ({
  selectedFile,
  onFileSelect,
  issues,
}) => {
  // Expanded nodes map
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    core: true,
    'core/fake_data': true,
    ui: true,
    'ui/src': true,
  });

  const getIssuesForPath = (path: string): number => {
    return issues.filter((i) => i.fileId === path || i.fileId.startsWith(path + '/')).length;
  };

  const toggleExpand = (path: string) => {
    setExpandedNodes((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  // Hardcoded project tree mapping standard repo layout
  const repositoryTree: ExplorerNode[] = [
    {
      name: 'core',
      path: 'core',
      type: 'folder',
      issuesCount: 0,
      children: [
        {
          name: 'analyzer',
          path: 'core/analyzer',
          type: 'folder',
          issuesCount: 0,
          children: [
            { name: 'PluginLoader.cpp', path: 'PluginLoader.cpp', type: 'file', issuesCount: 0 },
          ],
        },
        {
          name: 'event_bus',
          path: 'core/event_bus',
          type: 'folder',
          issuesCount: 0,
          children: [{ name: 'EventBus.cpp', path: 'EventBus.cpp', type: 'file', issuesCount: 0 }],
        },
        {
          name: 'fake_data',
          path: 'core/fake_data',
          type: 'folder',
          issuesCount: 0,
          children: [
            { name: 'FakeClientApi.cpp', path: 'FakeClientApi.cpp', type: 'file', issuesCount: 0 },
          ],
        },
        {
          name: 'storage',
          path: 'core/storage',
          type: 'folder',
          issuesCount: 0,
          children: [{ name: 'Database.cpp', path: 'Database.cpp', type: 'file', issuesCount: 0 }],
        },
        { name: 'IpcServer.cpp', path: 'IpcServer.cpp', type: 'file', issuesCount: 0 },
        { name: 'JsonRpcHandler.cpp', path: 'JsonRpcHandler.cpp', type: 'file', issuesCount: 0 },
      ],
    },
    {
      name: 'plugins',
      path: 'plugins',
      type: 'folder',
      issuesCount: 0,
      children: [
        {
          name: 'clang-tidy',
          path: 'plugins/clang-tidy',
          type: 'folder',
          issuesCount: 0,
          children: [
            {
              name: 'ClangTidyPlugin.cpp',
              path: 'plugins/clang-tidy/ClangTidyPlugin.cpp',
              type: 'file',
              issuesCount: 0,
            },
          ],
        },
        {
          name: 'cppcheck',
          path: 'plugins/cppcheck',
          type: 'folder',
          issuesCount: 0,
          children: [
            {
              name: 'CppcheckPlugin.cpp',
              path: 'plugins/cppcheck/CppcheckPlugin.cpp',
              type: 'file',
              issuesCount: 0,
            },
          ],
        },
      ],
    },
    {
      name: 'ui',
      path: 'ui',
      type: 'folder',
      issuesCount: 0,
      children: [
        {
          name: 'src',
          path: 'ui/src',
          type: 'folder',
          issuesCount: 0,
          children: [
            { name: 'App.tsx', path: 'App.tsx', type: 'file', issuesCount: 0 },
            {
              name: 'components',
              path: 'ui/src/components',
              type: 'folder',
              issuesCount: 0,
              children: [
                {
                  name: 'Topbar.tsx',
                  path: 'ui/src/components/Topbar.tsx',
                  type: 'file',
                  issuesCount: 0,
                },
                {
                  name: 'AnalyzeWorkspace.tsx',
                  path: 'ui/src/components/AnalyzeWorkspace.tsx',
                  type: 'file',
                  issuesCount: 0,
                },
              ],
            },
          ],
        },
        { name: 'package.json', path: 'ui/package.json', type: 'file', issuesCount: 0 },
      ],
    },
  ];

  const renderNode = (node: ExplorerNode, depth = 0) => {
    const isFolder = node.type === 'folder';
    const isExpanded = !!expandedNodes[node.path];
    const pathIssuesCount = isFolder
      ? getIssuesForPath(node.name)
      : issues.filter((i) => i.fileId === node.path).length;
    const isSelected = selectedFile === node.path;

    return (
      <div key={node.path} style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          onClick={() => {
            if (isFolder) {
              toggleExpand(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '5px 8px',
            marginLeft: `${depth * 10}px`,
            borderRadius: 'var(--sds-radius-sm)',
            cursor: 'pointer',
            backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
            color: isSelected ? 'var(--sds-primary)' : 'var(--sds-text)',
            fontSize: '12.5px',
            fontWeight: isSelected ? 600 : 500,
            transition: 'all var(--sds-transition-fast)',
            borderLeft: isSelected ? '2px solid var(--sds-primary)' : '2px solid transparent',
          }}
          onMouseEnter={(e) => {
            if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--sds-surface-hover)';
          }}
          onMouseLeave={(e) => {
            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {isFolder ? (
              <>
                {isExpanded ? (
                  <ChevronDown size={12} color="var(--sds-text-muted)" />
                ) : (
                  <ChevronRight size={12} color="var(--sds-text-muted)" />
                )}
                <Folder size={13} color="var(--sds-primary)" style={{ flexShrink: 0 }} />
              </>
            ) : (
              <>
                <span style={{ width: '12px' }} />
                <FileCode
                  size={13}
                  color={pathIssuesCount > 0 ? 'var(--sds-danger)' : 'var(--sds-text-muted)'}
                  style={{ flexShrink: 0 }}
                />
              </>
            )}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{node.name}</span>
          </div>

          {pathIssuesCount > 0 && (
            <span
              className="sds-badge"
              style={{
                padding: '1px 6px',
                fontSize: '9.5px',
                lineHeight: '1',
                backgroundColor: 'var(--sds-danger-bg)',
                color: 'var(--sds-danger)',
                borderColor: 'rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--sds-radius-pill)',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {pathIssuesCount}
            </span>
          )}
        </div>

        {isFolder && isExpanded && node.children && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {node.children.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {repositoryTree.map((node) => renderNode(node))}
    </div>
  );
};
