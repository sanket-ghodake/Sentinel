import React from 'react';
import { GitBranch, AlertTriangle, ShieldCheck, FileText } from 'lucide-react';
import type { Project } from '../services/clientApi';
import { QualityGauge } from './QualityGauge';

interface HealthCardProps {
  project: Project;
}

export const HealthCard: React.FC<HealthCardProps> = ({ project }) => {
  const isHealthy = project.quality >= 90;
  const isWarning = project.quality >= 75 && project.quality < 90;

  // Compute release readiness rating
  const readiness = Math.round(project.quality);

  return (
    <div
      className="sds-card"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 'var(--sds-space-32)',
        alignItems: 'center',
      }}
    >
      {/* Left side: Project Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sds-space-16)' }}>
        <div>
          <span
            style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              color: 'var(--sds-primary)',
              fontWeight: 600,
            }}
          >
            Project Quality Overview
          </span>
          <h2 style={{ fontSize: '28px', marginTop: 'var(--sds-space-4)' }}>{project.name}</h2>
          <span
            style={{
              fontSize: '13px',
              color: 'var(--sds-text-muted)',
              fontFamily: 'var(--sds-font-mono)',
            }}
          >
            {project.path}
          </span>
        </div>

        {/* Info Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--sds-space-16)',
            marginTop: 'var(--sds-space-4)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>GIT BRANCH</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                color: 'var(--sds-text-heading)',
                fontWeight: 500,
              }}
            >
              <GitBranch size={14} color="var(--sds-primary)" />
              {project.branch}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>
              FILESYSTEM SIZE
            </span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                color: 'var(--sds-text-heading)',
                fontWeight: 500,
              }}
            >
              <FileText size={14} color="var(--sds-text-muted)" />
              {project.totalFiles} files ({project.totalLines.toLocaleString()} lines)
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '11px', color: 'var(--sds-text-muted)' }}>STATUS</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                color: 'var(--sds-text-heading)',
                fontWeight: 500,
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor:
                    project.gitStatus === 'clean' ? 'var(--sds-success)' : 'var(--sds-warning)',
                }}
              />
              <span style={{ textTransform: 'capitalize' }}>{project.gitStatus}</span>
            </div>
          </div>
        </div>

        {/* Safety / Readiness Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sds-space-12)',
            padding: 'var(--sds-space-12) var(--sds-space-16)',
            borderRadius: 'var(--sds-radius-md)',
            backgroundColor: isHealthy
              ? 'var(--sds-success-bg)'
              : isWarning
                ? 'var(--sds-warning-bg)'
                : 'var(--sds-danger-bg)',
            border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.2)' : isWarning ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
            marginTop: 'var(--sds-space-8)',
          }}
        >
          {isHealthy ? (
            <ShieldCheck size={20} color="var(--sds-success)" />
          ) : (
            <AlertTriangle
              size={20}
              color={isWarning ? 'var(--sds-warning)' : 'var(--sds-danger)'}
            />
          )}
          <div style={{ fontSize: '13px' }}>
            {isHealthy ? (
              <span style={{ color: 'var(--sds-success)', fontWeight: 500 }}>
                Release Ready. This project exceeds quality gate thresholds of 90%.
              </span>
            ) : isWarning ? (
              <span style={{ color: 'var(--sds-warning)', fontWeight: 500 }}>
                Needs Attention. Ready rating is {readiness}%. Minor style or documentation issues
                found.
              </span>
            ) : (
              <span style={{ color: 'var(--sds-danger)', fontWeight: 500 }}>
                Critical Issues blocking. Security vulnerability scans failed.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Circular Gauge */}
      <div>
        <QualityGauge score={project.quality} size={130} strokeWidth={10} label="Quality Score" />
      </div>
    </div>
  );
};
