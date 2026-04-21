import React from 'react';
import type { EpistemicFrictionScore } from '../useEpistemicFriction';

interface EpistemicFrictionBadgeProps {
  score: EpistemicFrictionScore | null;
  showBadge: boolean;
}

export function EpistemicFrictionBadge({ score, showBadge }: EpistemicFrictionBadgeProps) {
  if (!showBadge || !score) {
    return null;
  }

  const levelColors: Record<string, string> = {
    none: 'var(--text-muted)',
    low: 'var(--text-muted)',
    medium: 'var(--accent)',
    high: 'var(--accent)',
  };

  const levelLabels: Record<string, string> = {
    none: 'No friction detected',
    low: 'Low friction',
    medium: 'Medium friction',
    high: 'High friction',
  };

  return (
    <div
      style={{
        background: 'var(--accent-faint)',
        color: levelColors[score.level],
        fontSize: '11px',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        padding: '6px 12px',
        borderRadius: '999px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        border: `1px solid ${levelColors[score.level]}40`,
      }}
    >
      <span>🧠</span>
      {levelLabels[score.level]} ({score.score})
    </div>
  );
}
