import React, { useState } from 'react';
import { FormattedText } from './FormattedText';

interface AttackCardProps {
  agentName: string;
  content: string | null;
  error: boolean;
  visible: boolean;
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
  const firstSentence = content ? (content.split(/[.!?]+/).shift() + '.') : '';

  return (
    <div className={`agent-card ${typeClasses} animate-appear-up`}>
      <div className="agent-card-header" onClick={() => !error && setExpanded(!expanded)}>
        <div className="agent-label-group">
          <span className="agent-dot" />
          <span className="agent-label">{agentName}</span>
        </div>
        {!error && (
          <button className="agent-toggle" aria-expanded={expanded}>
             {expanded ? "Hide analysis" : "Show full analysis"} 
             <span className={`chevron ${expanded ? '^' : 'v'}`}>↓</span>
          </button>
        )}
      </div>

      <div className="agent-card-content">
        {error ? (
          <p className="agent-error-text">This critic couldn't reach a conclusion. Check your API key or try again.</p>
        ) : (
          <div className={`agent-text-container ${expanded ? 'expanded' : 'collapsed'}`}>
             {expanded ? (
               <FormattedText text={content!} className="agent-full-text" />
             ) : (
               <p className="agent-summary-text">{firstSentence}</p>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
