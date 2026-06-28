import React from 'react';
import {
  Home,
  FolderGit2,
  SearchCode,
  Wrench,
  TrendingUp,
  Puzzle,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  activeItem: string;
  onItemSelect: (item: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  openIssuesCount: number;
  autofixesCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeItem,
  onItemSelect,
  isCollapsed,
  onToggleCollapse,
  openIssuesCount,
  autofixesCount,
}) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    {
      id: 'analyze',
      label: 'Analyze',
      icon: SearchCode,
      badge: openIssuesCount > 0 ? openIssuesCount : undefined,
    },
    {
      id: 'fix',
      label: 'Fix',
      icon: Wrench,
      badge: autofixesCount > 0 ? autofixesCount : undefined,
    },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'extensions', label: 'Extensions', icon: Puzzle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      style={{
        backgroundColor: 'var(--sds-surface)',
        borderRight: '1px solid var(--sds-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: isCollapsed ? '72px' : '240px',
        padding: 'var(--sds-space-16) 0',
        transition: 'width var(--sds-transition-normal)',
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      {/* Navigation Links */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          flex: 1,
          padding: '0 var(--sds-space-12)',
        }}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onItemSelect(item.id)}
              title={
                isCollapsed ? `${item.label}${item.badge ? ` (${item.badge})` : ''}` : undefined
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: isCollapsed ? '0' : 'var(--sds-space-12)',
                width: '100%',
                height: '44px',
                padding: isCollapsed ? '0' : '0 var(--sds-space-16)',
                borderRadius: 'var(--sds-radius-md)',
                border: 'none',
                backgroundColor: isActive ? 'var(--sds-surface-active)' : 'transparent',
                color: isActive ? 'var(--sds-text-heading)' : 'var(--sds-text)',
                cursor: 'pointer',
                fontFamily: 'var(--sds-font-sans)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                textAlign: 'left',
                transition: 'all var(--sds-transition-fast)',
                outline: 'none',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--sds-surface-hover)';
                  e.currentTarget.style.color = 'var(--sds-text-heading)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--sds-text)';
                }
              }}
            >
              <Icon
                size={18}
                color={isActive ? 'var(--sds-primary)' : 'currentColor'}
                style={{ flexShrink: 0 }}
              />

              {/* Text label - hidden when collapsed */}
              {!isCollapsed && (
                <span
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    flex: 1,
                  }}
                >
                  {item.label}
                </span>
              )}

              {/* Badge indicator */}
              {item.badge && (
                <span
                  style={{
                    position: isCollapsed ? 'absolute' : 'static',
                    top: isCollapsed ? '4px' : 'auto',
                    right: isCollapsed ? '4px' : 'auto',
                    minWidth: isCollapsed ? '8px' : '18px',
                    height: isCollapsed ? '8px' : '18px',
                    borderRadius: '50%',
                    backgroundColor:
                      item.id === 'analyze' ? 'var(--sds-danger)' : 'var(--sds-primary)',
                    color: '#ffffff',
                    fontSize: isCollapsed ? '0' : '10px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: isCollapsed ? '0' : '0 4px',
                    boxShadow: '0 0 6px rgba(0,0,0,0.5)',
                  }}
                >
                  {isCollapsed ? '' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse/Expand Toggle Button at the bottom */}
      <div
        style={{
          padding: '0 var(--sds-space-12)',
          marginTop: 'auto',
        }}
      >
        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand Navigation' : 'Collapse Navigation'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '40px',
            backgroundColor: 'transparent',
            border: '1px solid var(--sds-border)',
            borderRadius: 'var(--sds-radius-md)',
            color: 'var(--sds-text-muted)',
            cursor: 'pointer',
            transition: 'all var(--sds-transition-fast)',
            outline: 'none',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--sds-text-heading)';
            e.currentTarget.style.backgroundColor = 'var(--sds-surface-hover)';
            e.currentTarget.style.borderColor = 'var(--sds-border-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--sds-text-muted)';
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.borderColor = 'var(--sds-border)';
          }}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
};
