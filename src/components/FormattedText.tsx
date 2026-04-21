import React from 'react';

export function FormattedText({ text, className }: { text: string; className?: string }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    // Match patterns like "1. ", "2)", "3 - "
    const listMatch = trimmed.match(/^(\d+)[.)-]?\s+(.*)/);
    
    if (listMatch) {
      currentList.push(
        <li key={`li-${index}`}>
          <span className="list-number">{listMatch[1]}.</span>
          <span className="list-content">{listMatch[2]}</span>
        </li>
      );
    } else {
      if (currentList.length > 0) {
        elements.push(<ol key={`ol-${index}`} className="numbered-list">{currentList}</ol>);
        currentList = [];
      }
      elements.push(<p key={`p-${index}`} className="paragraph">{trimmed}</p>);
    }
  });

  if (currentList.length > 0) {
    elements.push(<ol key={`ol-end`} className="numbered-list">{currentList}</ol>);
  }

  return <div className={`formatted-text ${className || ''}`}>{elements}</div>;
}
