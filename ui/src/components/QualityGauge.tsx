import React from 'react';

interface QualityGaugeProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const QualityGauge: React.FC<QualityGaugeProps> = ({
  score,
  size = 120,
  strokeWidth = 10,
  label = 'Score',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset =
    circumference - (Math.min(100, Math.max(0, score)) / 100) * circumference;

  // Determine color based on score
  let color = 'var(--sds-danger)';
  if (score >= 90) color = 'var(--sds-success)';
  else if (score >= 75) color = 'var(--sds-primary)';
  else if (score >= 50) color = 'var(--sds-warning)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--sds-space-8)',
      }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="var(--sds-border)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: size / 4,
              fontWeight: 700,
              color: 'var(--sds-text-heading)',
            }}
          >
            {score.toFixed(1)}%
          </span>
          <span
            style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              color: 'var(--sds-text-muted)',
            }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};
