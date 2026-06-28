import React, { useState } from 'react';
import { ToggleRight, ToggleLeft, Star, ArrowDownToLine } from 'lucide-react';

export interface PluginCard {
  id: string;
  name: string;
  category: string;
  version: string;
  author: string;
  downloads: string;
  rating: number;
  description: string;
  installed: boolean;
  enabled: boolean;
}

interface PluginMarketplaceProps {
  onPluginSelect: (plugin: PluginCard) => void;
  selectedPluginId: string;
}

export const PluginMarketplace: React.FC<PluginMarketplaceProps> = ({
  onPluginSelect,
  selectedPluginId,
}) => {
  const [plugins, setPlugins] = useState<PluginCard[]>([
    {
      id: 'plugin-sql-injection',
      name: 'SQL Injection Guard',
      category: 'Security Auditing',
      version: '1.4.2',
      author: 'Sentinel Security Team',
      downloads: '1.2K',
      rating: 4.9,
      description:
        'Advanced AST matchers analyzing query parameters to detect raw sqlite3 concatenations and dynamic formatting vulnerabilities.',
      installed: true,
      enabled: true,
    },
    {
      id: 'plugin-clang-tidy',
      name: 'LLVM Clang-Tidy Integrator',
      category: 'Linters',
      version: '3.1.0',
      author: 'LLVM community',
      downloads: '8.4K',
      rating: 4.8,
      description:
        'Executes clang-tidy checks directly inside the sandbox container mapping compiler headers dynamically.',
      installed: true,
      enabled: true,
    },
    {
      id: 'plugin-autosar',
      name: 'AUTOSAR C++14 Compliance Pack',
      category: 'Safety Standards',
      version: '0.8.5',
      author: 'Safe Code Inc.',
      downloads: '320',
      rating: 4.7,
      description:
        'Ensures strict conformance with automotive mission-critical software standards (e.g. pointer limits, memory models).',
      installed: false,
      enabled: false,
    },
    {
      id: 'plugin-unused-vars',
      name: 'Dead Code & Variable Scanner',
      category: 'Optimization',
      version: '2.0.1',
      author: 'Sentinel Optimization Lab',
      downloads: '3.1K',
      rating: 4.6,
      description:
        'Trims redundancy from build parameters identifying local declarations that consume stack frames without being read.',
      installed: true,
      enabled: false,
    },
  ]);

  const toggleEnable = (id: string) => {
    setPlugins((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  };

  const handleInstall = (id: string) => {
    setPlugins((prev) =>
      prev.map((p) => (p.id === id ? { ...p, installed: true, enabled: true } : p)),
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-24)' }}>
      {/* Title section */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--sds-text-heading)' }}>
          Rule Packs & Extension Store
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--sds-text-muted)', marginTop: '4px' }}>
          Discover and download static analyzer rule packs or safety standard conformance engines.
        </p>
      </div>

      {/* Grid List */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--sds-space-16)',
        }}
      >
        {plugins.map((plugin) => {
          const isSelected = selectedPluginId === plugin.id;
          return (
            <div
              key={plugin.id}
              onClick={() => onPluginSelect(plugin)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: 'var(--sds-space-16)',
                backgroundColor: isSelected ? 'var(--sds-surface-hover)' : 'var(--sds-surface)',
                border: '1px solid',
                borderColor: isSelected ? 'var(--sds-primary)' : 'var(--sds-border)',
                borderRadius: 'var(--sds-radius-lg)',
                cursor: 'pointer',
                transition: 'all var(--sds-transition-fast)',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = 'var(--sds-border-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = 'var(--sds-border)';
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: '14.5px',
                      fontWeight: 600,
                      color: 'var(--sds-text-heading)',
                    }}
                  >
                    {plugin.name}
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
                    by {plugin.author}
                  </span>
                </div>
                {plugin.installed ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEnable(plugin.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: plugin.enabled ? 'var(--sds-success)' : 'var(--sds-text-muted)',
                    }}
                  >
                    {plugin.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleInstall(plugin.id);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
                      color: 'var(--sds-primary)',
                      border: '1px solid rgba(99, 102, 241, 0.3)',
                      borderRadius: 'var(--sds-radius-md)',
                      cursor: 'pointer',
                    }}
                  >
                    <ArrowDownToLine size={12} />
                    <span>Get</span>
                  </button>
                )}
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: '12px',
                  color: 'var(--sds-text-muted)',
                  lineHeight: '1.45',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  margin: 0,
                }}
              >
                {plugin.description}
              </p>

              {/* Footer stats */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '11px',
                  color: 'var(--sds-text-muted)',
                  marginTop: 'auto',
                  borderTop: '1px solid rgba(255,255,255,0.03)',
                  paddingTop: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Star size={11} fill="currentColor" color="var(--sds-warning)" />
                  <span>{plugin.rating}</span>
                </div>
                <span>{plugin.downloads} installs</span>
                <span style={{ marginLeft: 'auto', color: 'var(--sds-primary)', fontWeight: 500 }}>
                  {plugin.category}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
