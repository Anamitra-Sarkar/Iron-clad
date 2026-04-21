import React, { useState } from 'react';

interface FollowupInputProps {
  onTest: (prompt: string) => void;
  disabled: boolean;
}

export function FollowupInput({ onTest, disabled }: FollowupInputProps) {
  const [text, setText] = useState('');

  const handleTest = () => {
    if (text.trim() && !disabled) {
      onTest(text.trim());
      setText(''); // clear input after submitting
    }
  };

  return (
    <div className="followup-panel">
      <div className="input-label">
        <span>Ask a followup ?</span>
      </div>
      <textarea
        className="app-textarea"
        style={{ minHeight: '100px', backgroundColor: 'rgba(255, 255, 255, 0.45)' }}
        placeholder="Type your response or counter-argument..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
      />
      <div className="input-footer">
        <button
          className="btn-primary"
          onClick={handleTest}
          disabled={!text.trim() || disabled}
        >
          {disabled ? 'Processing...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
