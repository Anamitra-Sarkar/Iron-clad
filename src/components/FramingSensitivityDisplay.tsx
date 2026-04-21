import React from 'react';
import type { FramingSensitivityResult } from '../useFramingSensitivity';

interface FramingSensitivityDisplayProps {
  sensitivity: FramingSensitivityResult | null;
  visible: boolean;
}

const statusToColor: Record<string, string> = {
  'SURVIVES': 'var(--color-success)',
  'PARTIALLY SURVIVES': 'var(--color-warning)',
  'DOES NOT SURVIVE': 'var(--color-danger)',
};

const statusToShade: Record<string, string> = {
  'SURVIVES': 'var(--color-success-faint)',
  'PARTIALLY SURVIVES': 'var(--color-warning-faint)',
  'DOES NOT SURVIVE': 'var(--color-danger-faint)',
};

export function FramingSensitivityDisplay({ sensitivity, visible }: FramingSensitivityDisplayProps) {
  if (!visible || !sensitivity || !sensitivity.hasSensitivity) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: '24px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        animation: 'pageFadeIn 400ms ease forwards',
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '16px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Framing Sensitivity Detected
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
        }}
      >
        {[
          { label: 'Original', verdict: sensitivity.originalVerdict },
          { label: 'Optimistic Frame', verdict: sensitivity.optimisticVerdict },
          { label: 'Pessimistic Frame', verdict: sensitivity.pessimisticVerdict },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              padding: '12px',
              borderRadius: '6px',
              backgroundColor: statusToShade[item.verdict.status],
              border: `1px solid ${statusToColor[item.verdict.status]}`,
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 500 }}>
              {item.label}
            </div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: statusToColor[item.verdict.status],
                textTransform: 'uppercase',
                marginBottom: '4px',
              }}
            >
              {item.verdict.status}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.3 }}>
              {item.verdict.reason.substring(0, 80)}...
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: '12px',
          padding: '8px 12px',
          borderRadius: '4px',
          backgroundColor: 'var(--bg-primary)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          borderLeft: '2px solid var(--accent)',
        }}
      >
        Your verdict changes depending on how the argument is framed. Consider testing different framings to strengthen your position.
      </div>
    </div>
  );
}
