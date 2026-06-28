import React from 'react';
import {
  Home,
  FolderGit2,
  SearchCode,
  Wrench,
  TrendingUp,
  Puzzle,
  Settings,
  Shield,
} from 'lucide-react';

interface SidebarProps {
  activeItem: string;
  onItemSelect: (item: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem, onItemSelect }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'analyze', label: 'Analyze', icon: SearchCode },
    { id: 'fix', label: 'Fix', icon: Wrench },
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
        padding: 'var(--sds-space-16) 0',
      }}
    >
      {/* Brand / Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sds-space-12)',
          padding: '0 var(--sds-space-24) var(--sds-space-24) var(--sds-space-24)',
          borderBottom: '1px solid var(--sds-border)',
          marginBottom: 'var(--sds-space-16)',
        }}
      >
        <Shield size={24} color="var(--sds-primary)" />
        <span
          style={{
            fontFamily: 'var(--sds-font-sans)',
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--sds-text-heading)',
            letterSpacing: '0.5px',
          }}
        >
          SENTINEL
        </span>
        <span
          style={{
            fontSize: '9px',
            backgroundColor: 'var(--sds-primary-hover)',
            color: '#fff',
            padding: '2px 6px',
            borderRadius: 'var(--sds-radius-pill)',
            fontWeight: 600,
          }}
        >
          v0.1
        </span>
      </div>

      {/* Navigation Links */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--sds-space-12)',
                width: '100%',
                padding: 'var(--sds-space-12) var(--sds-space-16)',
                borderRadius: 'var(--sds-radius-md)',
                border: 'none',
                backgroundColor: isActive ? 'var(--sds-surface-active)' : 'transparent',
                color: isActive ? 'var(--sds-text-heading)' : 'var(--sds-text)',
                cursor: 'pointer',
                fontFamily: 'var(--sds-font-sans)',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                textAlign: 'left',
                transition: 'all var(--sds-transition-fast)',
                outline: 'none',
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
              <Icon size={18} color={isActive ? 'var(--sds-primary)' : 'currentColor'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer / Developer profile summary */}
      <div
        style={{
          padding: 'var(--sds-space-16) var(--sds-space-24) 0 var(--sds-space-24)',
          borderTop: '1px solid var(--sds-border)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--sds-space-12)',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--sds-primary)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          S
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--sds-text-heading)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Sanket Ghodake
          </span>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--sds-text-muted)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            Lead Developer
          </span>
        </div>
      </div>
    </aside>
  );
};
