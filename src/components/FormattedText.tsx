import React from 'react';

function parseInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} style={{ background: 'var(--surface-2)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.9em', fontFamily: 'monospace' }}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function parseTableRow(row: string): string[] {
  return row.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
}

function isTableSeparator(line: string): boolean {
  return /^[\|\-\s:]+$/.test(line) && line.includes('-');
}

export function FormattedText({ text, className }: { text: string; className?: string }) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let listType: 'ol' | 'ul' | null = null;
  let tableLines: string[] = [];
  let inTable = false;

  const flushList = (key: string) => {
    if (currentList.length > 0) {
      if (listType === 'ol') {
        elements.push(<ol key={key} className="numbered-list">{currentList}</ol>);
      } else {
        elements.push(<ul key={key} style={{ paddingLeft: '20px', margin: '8px 0' }}>{currentList}</ul>);
      }
      currentList = [];
      listType = null;
    }
  };

  const flushTable = (key: string) => {
    if (tableLines.length < 2) { tableLines = []; inTable = false; return; }
    const headers = parseTableRow(tableLines[0]);
    const rows = tableLines.slice(2).map(parseTableRow);
    elements.push(
      <div key={key} style={{ overflowX: 'auto', margin: '12px 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} style={{ padding: '8px 12px', borderBottom: '2px solid var(--border)', textAlign: 'left', fontWeight: 700, color: 'var(--text)', background: 'var(--surface-2)' }}>
                  {parseInline(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: '1px solid var(--border)' }}>
                {row.map((cell, ci) => (
                  <td key={ci} style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>
                    {parseInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableLines = [];
    inTable = false;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Table detection
    if (trimmed.startsWith('|')) {
      flushList(`ol-${index}`);
      inTable = true;
      tableLines.push(trimmed);
      return;
    }
    if (inTable && !trimmed.startsWith('|')) {
      flushTable(`table-${index}`);
    }

    if (!trimmed) {
      flushList(`ol-${index}`);
      return;
    }

    // ### Heading
    const h3Match = trimmed.match(/^###\s+(.+)/);
    if (h3Match) {
      flushList(`ol-${index}`);
      elements.push(
        <p key={`h3-${index}`} style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text)', margin: '16px 0 6px' }}>
          {parseInline(h3Match[1])}
        </p>
      );
      return;
    }

    // ## Heading
    const h2Match = trimmed.match(/^##\s+(.+)/);
    if (h2Match) {
      flushList(`ol-${index}`);
      elements.push(
        <p key={`h2-${index}`} style={{ fontWeight: 800, fontSize: '17px', color: 'var(--text)', margin: '20px 0 8px' }}>
          {parseInline(h2Match[1])}
        </p>
      );
      return;
    }

    // Entire line bold = section heading
    const headingMatch = trimmed.match(/^\*\*(.+)\*\*:?$/);
    if (headingMatch) {
      flushList(`ol-${index}`);
      elements.push(
        <p key={`h-${index}`} className="fmt-heading">{headingMatch[1].replace(/:$/, '')}</p>
      );
      return;
    }

    // Numbered list
    const listMatch = trimmed.match(/^(\d+)[.)\-]\s+(.*)/);
    if (listMatch) {
      if (listType !== 'ol') { flushList(`flush-${index}`); listType = 'ol'; }
      currentList.push(
        <li key={`li-${index}`}>
          <span className="list-number">{listMatch[1]}.</span>
          <span className="list-content">{parseInline(listMatch[2])}</span>
        </li>
      );
      return;
    }

    // Bullet list (-, *, •)
    const bulletMatch = trimmed.match(/^[-•*]\s+(.*)/);
    if (bulletMatch) {
      if (listType !== 'ul') { flushList(`flush-${index}`); listType = 'ul'; }
      currentList.push(
        <li key={`li-${index}`} style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>
          {parseInline(bulletMatch[1])}
        </li>
      );
      return;
    }

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      flushList(`ol-${index}`);
      elements.push(<hr key={`hr-${index}`} style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />);
      return;
    }

    flushList(`ol-${index}`);
    elements.push(<p key={`p-${index}`} className="paragraph">{parseInline(trimmed)}</p>);
  });

  flushList('ol-end');
  if (inTable) flushTable('table-end');

  return <div className={`formatted-text ${className || ''}`}>{elements}</div>;
}
