import React, { useState } from 'react';
import { FormattedText } from './FormattedText';

interface AttackCardProps {
  agentName: string;
  content: string | null;
  error: boolean;
  visible: boolean;
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

function sanitizeContent(content: string | null): string | null {
  if (!content) return content;
  const isRefusal = REFUSAL_PATTERNS.some((pattern) => pattern.test(content));
  return isRefusal ? INTERVENTION_MESSAGE : content;
}

export function AttackCard({ agentName, content, error, visible }: AttackCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (!visible) return null;

  const getAgentType = () => {
    const name = agentName.toLowerCase();
    if (name.includes('devil') || name.includes('advocate')) return 'devil';
    if (name.includes('pessimist')) return 'pessimist';
    return 'steelman';
  };

  const typeClasses = `agent-${getAgentType()}`;
  const sanitized = sanitizeContent(content);
  const isIntervention = sanitized === INTERVENTION_MESSAGE;
  const firstSentence = sanitized ? (sanitized.split(/[.!?]+/).shift() + '.') : '';

  return (
    <div className={`agent-card ${typeClasses} animate-appear-up`}>
      <div className="agent-card-header" onClick={() => !error && !isIntervention && setExpanded(!expanded)}>
        <div className="agent-label-group">
          <span className="agent-dot" />
          <span className="agent-label">{agentName}</span>
        </div>
        {!error && !isIntervention && (
          <button className="agent-toggle" aria-expanded={expanded}>
            {expanded ? 'Hide analysis' : 'Show full analysis'}
            <span className={`chevron ${expanded ? '^' : 'v'}`}>↓</span>
          </button>
        )}
      </div>

      <div className="agent-card-content">
        {error ? (
          <p className="agent-error-text">This critic couldn't reach a conclusion. Check your API key or try again.</p>
        ) : isIntervention ? (
          <p className="agent-full-text" style={{ color: 'var(--devil-color)', fontWeight: 500, lineHeight: 1.7 }}>
            {INTERVENTION_MESSAGE}
          </p>
        ) : (
          <div className={`agent-text-container ${expanded ? 'expanded' : 'collapsed'}`}>
            {expanded ? (
              <FormattedText text={sanitized!} className="agent-full-text" />
            ) : (
              <p className="agent-summary-text">{firstSentence}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
