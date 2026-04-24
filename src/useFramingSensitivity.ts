import { useState, useCallback } from 'react';
import { callGroq } from './useGroq';
import { JUDGE, buildPrompt, AGENTS } from './prompts';
import type { VerdictResult } from './useGroq';
import { logVfsTrial } from './useVfsLogger';

export interface FramingSensitivityResult {
  originalVerdict: VerdictResult;
  optimisticVerdict: VerdictResult;
  pessimisticVerdict: VerdictResult;
  hasSensitivity: boolean;
}

async function generateFramedAttack(
  idea: string,
  tone: string,
  domain: string,
  framing: 'optimistic' | 'pessimistic'
): Promise<string> {
  const framingPrompt = framing === 'optimistic'
    ? 'Reframe this argument in the most favorable, optimistic light. Highlight strengths, best-case scenarios, and why it might work.'
    : 'Reframe this argument in the most critical, pessimistic light. Highlight risks, worst-case scenarios, and why it might fail.';

  const systemPrompt = `${framingPrompt}\n\nKeep the response concise (2-3 sentences).`;
  
  try {
    return await callGroq(systemPrompt, idea, 'llama-3.1-8b-instant');
  } catch {
    return '';
  }
}

async function getVerdictForFraming(
  idea: string,
  framedContent: string,
  originalAttacks: Array<{ name: string; content: string | null }>
): Promise<VerdictResult | null> {
  if (!framedContent) return null;

  const judgeContext = `Original Idea: "${idea}"\n\n${framedContent}\n\n` + originalAttacks.map(a => 
    `${a.name} Attack:\n${a.content || '(Failed to generate attack)'}`
  ).join('\n\n');

  try {
    const judgeOutput = await callGroq(JUDGE.basePrompt, judgeContext, JUDGE.model);
    
    const statusMatch = judgeOutput.match(/VERDICT:\s*(SURVIVES|PARTIALLY SURVIVES|DOES NOT SURVIVE)/i);
    const reasonMatch = judgeOutput.match(/REASON:\s*(.+?)(?=\nTO FIX:|$)/is);
    const toFixMatch = judgeOutput.match(/TO FIX:\s*(.+)$/is);

    const resolvedStatus = (statusMatch?.[1].toUpperCase() as any) || 'PARTIALLY SURVIVES';
    const toFixVal = toFixMatch?.[1].trim() || 'Consider iterating on the arguments provided above.';

    return {
      status: resolvedStatus,
      reason: reasonMatch?.[1].trim() || 'No explicit reason provided.',
      toFix: toFixVal,
    };
  } catch {
    return null;
  }
}

function compareVerdicts(verdicts: VerdictResult[]): boolean {
  // Check if there's variance in verdict statuses
  const statuses = verdicts.map(v => v.status);
  const uniqueStatuses = new Set(statuses);
  return uniqueStatuses.size > 1;
}

export function useFramingSensitivity() {
  const [sensitivity, setSensitivity] = useState<FramingSensitivityResult | null>(null);
  const [isAnalyzingSensitivity, setIsAnalyzingSensitivity] = useState(false);

  const runFramingSensitivityAnalysis = useCallback(
    async (
      idea: string,
      tone: string,
      domain: string,
      originalVerdict: VerdictResult,
      originalAttacks: Array<{ name: string; content: string | null }>
    ) => {
      setIsAnalyzingSensitivity(true);
      try {
        // Generate optimistic and pessimistic reframes
        const [optimisticFrame, pessimisticFrame] = await Promise.all([
          generateFramedAttack(idea, tone, domain, 'optimistic'),
          generateFramedAttack(idea, tone, domain, 'pessimistic'),
        ]);

        // Get verdicts for both frames in parallel
        const [optimisticVerdict, pessimisticVerdict] = await Promise.all([
          getVerdictForFraming(idea, optimisticFrame, originalAttacks),
          getVerdictForFraming(idea, pessimisticFrame, originalAttacks),
        ]);

        if (optimisticVerdict && pessimisticVerdict) {
          const allVerdicts = [originalVerdict, optimisticVerdict, pessimisticVerdict];
          const hasSensitivity = compareVerdicts(allVerdicts);

          setSensitivity({
            originalVerdict,
            optimisticVerdict,
            pessimisticVerdict,
            hasSensitivity,
          });

          logVfsTrial({
            idea,
            domain,
            fOpt: optimisticFrame,
            fPess: pessimisticFrame,
            verdictBase: originalVerdict,
            verdictOpt: optimisticVerdict,
            verdictPess: pessimisticVerdict,
            judgeModel: JUDGE.model,
          });
        }
      } catch {
        // Silent failure
      } finally {
        setIsAnalyzingSensitivity(false);
      }
    },
    []
  );

  const clearSensitivity = useCallback(() => {
    setSensitivity(null);
  }, []);

  return {
    sensitivity,
    isAnalyzingSensitivity,
    runFramingSensitivityAnalysis,
    clearSensitivity,
  };
}
