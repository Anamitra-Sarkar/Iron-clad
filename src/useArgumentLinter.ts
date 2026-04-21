import { useState, useEffect, useCallback } from 'react';
import { callGroq } from './useGroq';

export interface ArgumentFlaw {
  id: string;
  flaw: string;
  severity: 'low' | 'medium' | 'high';
  position: number;
}

export function useArgumentLinter() {
  const [flaws, setFlaws] = useState<ArgumentFlaw[]>([]);
  const [isLinting, setIsLinting] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const lintArgument = useCallback(async (text: string) => {
    if (text.length <= 80) {
      setFlaws([]);
      return;
    }

    setIsLinting(true);
    try {
      const systemPrompt = `You are an argument logic analyzer. Identify logical fallacies, reasoning flaws, and weaknesses in the argument. 
Return a JSON array with this structure: [{"flaw": "description", "severity": "low|medium|high"}]
Be concise. Maximum 3 flaws. If no flaws, return [].
Do NOT include any markdown formatting or code blocks.`;

      const response = await callGroq(systemPrompt, text, 'llama-3.1-8b-instant');
      
      // Parse JSON response
      let parsedFlaws: Array<{ flaw: string; severity: string }> = [];
      try {
        // Try to extract JSON from response (in case there's extra text)
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedFlaws = JSON.parse(jsonMatch[0]);
        } else {
          parsedFlaws = JSON.parse(response);
        }
      } catch {
        // Silent failure - invalid JSON response
        setFlaws([]);
        setIsLinting(false);
        return;
      }

      // Map to ArgumentFlaw with IDs
      const flawsWithIds: ArgumentFlaw[] = parsedFlaws.map((f, idx) => ({
        id: `flaw-${idx}`,
        flaw: f.flaw,
        severity: (f.severity as 'low' | 'medium' | 'high') || 'low',
        position: idx,
      }));

      setFlaws(flawsWithIds);
    } catch {
      // Silent failure on API error
      setFlaws([]);
    } finally {
      setIsLinting(false);
    }
  }, []);

  const debouncedLint = useCallback((text: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      lintArgument(text);
    }, 1200); // 1200ms debounce

    setDebounceTimer(timer);
  }, [debounceTimer, lintArgument]);

  const clearFlaws = useCallback(() => {
    setFlaws([]);
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
  }, [debounceTimer]);

  return {
    flaws,
    isLinting,
    debouncedLint,
    clearFlaws,
  };
}
