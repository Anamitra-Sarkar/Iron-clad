import React from 'react';
import type { ArgumentFlaw } from '../useArgumentLinter';

interface ArgumentLinterDisplayProps {
  flaws: ArgumentFlaw[];
  isLinting: boolean;
}

export function ArgumentLinterDisplay({ flaws, isLinting }: ArgumentLinterDisplayProps) {
  if (flaws.length === 0 && !isLinting) {
    return null;
  }

  const severityColors: Record<'low' | 'medium' | 'high', string> = {
    low: 'var(--color-warning-subtle)',
    medium: 'var(--color-warning)',
    high: 'var(--color-danger)',
  };

  const severityBorders: Record<'low' | 'medium' | 'high', string> = {
    low: 'var(--color-warning-border)',
    medium: 'var(--color-warning-border)',
    high: 'var(--color-danger-border)',
  };

  return (
    <div
      style={{
        marginTop: '12px',
        animation: 'pageFadeIn 300ms ease forwards',
      }}
    >
      {isLinting && (
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px' }}>
          Analyzing for reasoning flaws...
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {flaws.map((flaw, idx) => (
          <div
            key={flaw.id}
            className="argument-flaw-chip"
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: severityColors[flaw.severity],
              borderLeft: `3px solid ${severityBorders[flaw.severity]}`,
              fontSize: '12px',
              color: 'var(--text-primary)',
              animation: `pageFadeIn 200ms ease forwards ${idx * 50}ms`,
              animationFillMode: 'both',
            }}
          >
            <span style={{ fontWeight: 600, textTransform: 'capitalize', marginRight: '6px' }}>
              {flaw.severity}:
            </span>
            {flaw.flaw}
          </div>
        ))}
      </div>
    </div>
  );
}
