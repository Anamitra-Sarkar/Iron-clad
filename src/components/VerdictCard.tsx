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

const REFUSAL_PATTERNS = [
  /i cannot provide a response that promotes/i,
  /i cannot provide a response that condones/i,
  /i cannot (and will not|help with|provide|create|generate|assist)/i,
  /i('m| am) not able to (provide|help|assist|create|generate)/i,
  /i('m| am) unable to (provide|help|assist|create|generate)/i,
  /this (request|content|topic|input) (violates|goes against|is against)/i,
  /i (won't|will not|don't|do not) (provide|help|assist|create|generate)/i,
  /i must (decline|refuse)/i,
  /cannot (promote|condone|glorify|endorse)/i,
  /i cannot engage in a conversation that/i,
  /is there anything else i can help you with/i,
  /i('m| am) not going to (provide|help|assist|create|generate)/i,
  /i do not generate content (that|which)/i,
];

const INTERVENTION_MESSAGE =
  '⚠️ This describes a serious crime that causes real harm to a real person. ' +
  'If you or someone you know is in danger, contact emergency services immediately ' +
  '(India Emergency: 112 | Women\'s Helpline: 1091 | Police: 100). ' +
  'Ironclad is designed to stress-test ideas — not crimes.';

function sanitize(text: string | undefined): string | undefined {
  if (!text) return text;
  const isRefusal = REFUSAL_PATTERNS.some((p) => p.test(text));
  return isRefusal ? INTERVENTION_MESSAGE : text;
}

export function VerdictCard({ verdict, visible, epistemicScore }: VerdictCardProps) {
  if (!visible) return null;

  const reason = sanitize(verdict.reason);
  const toFix = sanitize(verdict.toFix);
  const dnaTag = sanitize(verdict.dnaTag);
  const isIntervention = reason === INTERVENTION_MESSAGE || toFix === INTERVENTION_MESSAGE;

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

  const showBadge = epistemicScore && epistemicScore.score >= 2 && typeof window !== 'undefined' && window.innerWidth > 480;

  return (
    <div className="verdict-container animate-slide-up">
      <div className={`verdict-card ${typeClass}`}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '24px', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className={`verdict-badge ${badgeClass}`} style={{ marginBottom: 0 }}>{verdict.status}</div>
            {dnaTag && !isIntervention && (
              <div style={{ background: 'var(--accent-faint)', color: 'var(--accent)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '6px 12px', borderRadius: '999px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🧬</span> {dnaTag}
              </div>
            )}
          </div>
          {showBadge && <EpistemicFrictionBadge score={epistemicScore} showBadge={true} />}
        </div>

        <div className="verdict-section">
          <div className="verdict-label">Reason</div>
          {isIntervention ? (
            <p className="verdict-reason-text" style={{ color: 'var(--devil-color)', fontWeight: 500, lineHeight: 1.7 }}>{INTERVENTION_MESSAGE}</p>
          ) : (
            <p className="verdict-reason-text">{reason}</p>
          )}
        </div>

        {!isIntervention && (
          <div className="verdict-section">
            <div className="verdict-label">To Fix</div>
            <FormattedText text={toFix!} className="verdict-fix-text" />
          </div>
        )}
      </div>
    </div>
  );
}
