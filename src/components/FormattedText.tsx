import React from 'react';

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function FormattedText({ text, className }: { text: string; className?: string }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const flushList = (key: string) => {
    if (currentList.length > 0) {
      elements.push(<ol key={key} className="numbered-list">{currentList}</ol>);
      currentList = [];
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList(`ol-${index}`);
      return;
    }

    // Heading: line is entirely bold e.g. **Phased Approach:**
    const headingMatch = trimmed.match(/^\*\*(.+)\*\*:?$/);
    if (headingMatch) {
      flushList(`ol-${index}`);
      elements.push(
        <p key={`h-${index}`} className="fmt-heading">{headingMatch[1].replace(/:$/, '')}</p>
      );
      return;
    }

    // Numbered list item
    const listMatch = trimmed.match(/^(\d+)[.)\-]\s+(.*)/);
    if (listMatch) {
      currentList.push(
        <li key={`li-${index}`}>
          <span className="list-number">{listMatch[1]}.</span>
          <span className="list-content">{parseInline(listMatch[2])}</span>
        </li>
      );
      return;
    }

    // Bullet list item
    const bulletMatch = trimmed.match(/^[-•*]\s+(.*)/);
    if (bulletMatch) {
      flushList(`ol-${index}`);
      elements.push(
        <p key={`b-${index}`} className="fmt-bullet">
          <span className="fmt-bullet-dot">·</span>
          {parseInline(bulletMatch[1])}
        </p>
      );
      return;
    }

    flushList(`ol-${index}`);
    elements.push(<p key={`p-${index}`} className="paragraph">{parseInline(trimmed)}</p>);
  });

  flushList('ol-end');

  return <div className={`formatted-text ${className || ''}`}>{elements}</div>;
}
