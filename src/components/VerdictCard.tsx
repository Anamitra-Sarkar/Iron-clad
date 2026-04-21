import React from 'react';
import { VerdictResult } from '../useGroq';
import { FormattedText } from './FormattedText';
import { EpistemicFrictionBadge } from './EpistemicFrictionBadge';
import type { EpistemicFrictionScore } from '../useEpistemicFriction';

interface VerdictCardProps {
  verdict: VerdictResult;
  visible: boolean;
  epistemicScore?: EpistemicFrictionScore | null;
}

export function VerdictCard({ verdict, visible, epistemicScore }: VerdictCardProps) {
  if (!visible) return null;

  let badgeClass = 'verdict-partial';
  let typeClass = 'verdict-type-partial';
  if (verdict.status.includes('DOES NOT SURVIVE')) {
    badgeClass = 'verdict-fails';
    typeClass = 'verdict-type-fails';
  } else if (verdict.status.includes('PARTIALLY')) {
    badgeClass = 'verdict-partial';
    typeClass = 'verdict-type-partial';
  } else if (verdict.status.includes('SURVIVES')) {
    badgeClass = 'verdict-survives';
    typeClass = 'verdict-type-survives';
  }

  // Show badge only if score >= 2 and viewport > 480px
  const showBadge = epistemicScore && epistemicScore.score >= 2 && typeof window !== 'undefined' && window.innerWidth > 480;

  return (
    <div className="verdict-container animate-slide-up">
      <div className={`verdict-card ${typeClass}`}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className={`verdict-badge ${badgeClass}`} style={{ marginBottom: 0 }}>{verdict.status}</div>
            {verdict.dnaTag && (
              <div style={{ background: 'var(--accent-faint)', color: 'var(--accent)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px', borderRadius: '999px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🧬</span> {verdict.dnaTag}
              </div>
            )}
          </div>
          {showBadge && <EpistemicFrictionBadge score={epistemicScore} showBadge={true} />}
        </div>
        
        <div className="verdict-section">
          <div className="verdict-label">Reason</div>
          <p className="verdict-reason-text">{verdict.reason}</p>
        </div>

        <div className="verdict-section">
          <div className="verdict-label">To Fix</div>
          <FormattedText text={verdict.toFix} className="verdict-fix-text" />
        </div>
      </div>
    </div>
  );
}
