import React from 'react';
import { CustomSelect } from './CustomSelect';

export function InputPanel({ onTest, disabled }: { onTest: (idea: string, tone: string, domain: string) => void, disabled: boolean }) {
  const [text, setText] = React.useState('');
  const [tone, setTone] = React.useState('Brutal');
  const [domain, setDomain] = React.useState('None');

  const examples = [
    "Drop out of college to start an AI company",
    "Cut off a toxic 10-year friend group",
    "Rewrite our production app from scratch in Rust"
  ];

  const domainOptions = [
    { value: 'None', label: 'Domain: Auto' },
    { value: 'Personal', label: 'Personal' },
    { value: 'Business', label: 'Business' },
    { value: 'Technical', label: 'Technical' },
    { value: 'Creative', label: 'Creative' },
    { value: 'Relationship', label: 'Relationship' },
  ];

  const toneOptions = [
    { value: 'Brutal', label: 'Tone: Brutal' },
    { value: 'Balanced', label: 'Tone: Balanced' },
    { value: 'Gentle', label: 'Tone: Gentle' },
  ];

  const handleSubmit = () => {
    if (text.trim() && !disabled) {
      onTest(text.trim(), tone, domain);
    }
  };

  return (
    <div className="app-input-wrapper">
      <div className={`input-label ${text.length > 0 ? 'has-content' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <span>YOUR IDEA OR ARGUMENT</span>
        <div style={{ display: 'flex', gap: '8px', zIndex: 10 }}>
          <CustomSelect 
            value={domain} 
            onChange={(val) => setDomain(val)} 
            options={domainOptions}
            disabled={disabled}
          />
          <CustomSelect 
            value={tone} 
            onChange={(val) => setTone(val)} 
            options={toneOptions}
            disabled={disabled}
          />
        </div>
      </div>
      <textarea
        id="main-idea-input"
        placeholder="State your idea, argument, or plan. Be specific."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        className="app-textarea"
      />
      {text.length === 0 && (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
          {examples.map(ex => (
             <button 
                key={ex} 
                className="example-chip animate-fade-in" 
                onClick={() => setText(ex)}
             >
               Try: {ex}
             </button>
          ))}
        </div>
      )}
      <div className="input-footer">
        <div className="char-count">{text.length > 0 ? `${text.length} characters` : ''}</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <button 
            id="main-submit-btn"
            className="btn-primary" 
            onClick={handleSubmit} 
            disabled={disabled || text.trim().length === 0}
          >
            Stress Test &rarr;
          </button>
          <div style={{ color: 'var(--text-faint)', fontSize: '12px' }}>⌘ Enter to submit</div>
        </div>
      </div>
    </div>
  );
}
