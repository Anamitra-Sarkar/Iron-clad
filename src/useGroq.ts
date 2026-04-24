import { useState } from 'react';
import { AGENTS, JUDGE, STRENGTHEN_AGENT, buildPrompt } from './prompts';
import { useFramingSensitivity } from './useFramingSensitivity';
import type { FramingSensitivityResult } from './useFramingSensitivity';

export type AppState = 'idle' | 'loading' | 'results' | 'verdict' | 'crisis';

export interface HistoryItem {
  id: string;
  idea: string;
  verdictStatus: string;
  toFix?: string;
  dnaTag?: string;
}

export interface AttackResult {
  id: string;
  name: string;
  color: string;
  content: string | null;
  error: boolean;
}

export interface VerdictResult {
  status: 'SURVIVES' | 'PARTIALLY SURVIVES' | 'DOES NOT SURVIVE';
  reason: string;
  toFix: string;
  dnaTag?: string;
}

export interface Followup {
  id: string;
  prompt: string;
  isSingle: boolean;
  status: 'loading' | 'done';
  singleContent?: string;
  attacks?: AttackResult[];
  verdict?: VerdictResult;
}

export async function callGroq(systemPrompt: string, userContent: string, model: string) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API Key is missing');
  }

  const isQwen = model.toLowerCase().includes('qwen');

  const body: Record<string, unknown> = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent }
    ],
    temperature: 0.7,
    max_tokens: 300,
    ...(isQwen ? { reasoning_effort: 'none' } : {})
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content ?? '';
  return raw.trim();
}

export function useGroq() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [originalIdea, setOriginalIdea] = useState<string>('');
  const [currentTone, setCurrentTone] = useState<string>('Brutal');
  const [currentDomain, setCurrentDomain] = useState<string>('None');
  const [attacks, setAttacks] = useState<AttackResult[]>([]);
  const [verdict, setVerdict] = useState<VerdictResult | null>(null);
  const [followups, setFollowups] = useState<Followup[]>([]);
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [resilienceScore, setResilienceScore] = useState<number>(0);
  const [strengthenedText, setStrengthenedText] = useState<string | null>(null);
  const [isStrengthening, setIsStrengthening] = useState<boolean>(false);
  
  const { sensitivity, isAnalyzingSensitivity, runFramingSensitivityAnalysis, clearSensitivity } = useFramingSensitivity();
  const [framingSensitivity, setFramingSensitivity] = useState<FramingSensitivityResult | null>(null);

  const runStressTest = async (idea: string, tone: string = 'Brutal', domain: string = 'None', bypassSafety: boolean = false) => {
    setAppState('loading');
    setOriginalIdea(idea);
    setCurrentTone(tone);
    setCurrentDomain(domain);
    setAttacks([]);
    setVerdict(null);
    setFollowups([]);
    setStrengthenedText(null);

    if (!bypassSafety) {
      try {
        const guardSystem = "If the input contains explicit self-harm intent, suicidal ideation, or crisis language, reply with CRISIS. Otherwise reply SAFE.";
        const guardResponse = await callGroq(guardSystem, idea, "llama-guard-3-8b");
        if (guardResponse.includes('CRISIS') || guardResponse.includes('unsafe')) {
          setAppState('crisis');
          return;
        }
      } catch (e) {
        // Silently proceed if guard fails
      }
    }

    const attackPromises = [
      AGENTS.DEVILS_ADVOCATE,
      AGENTS.PESSIMIST,
      AGENTS.STEELMAN
    ].map(async (agent) => {
      try {
        const p = buildPrompt(agent.basePrompt, tone, domain);
        const content = await callGroq(p, idea, agent.model);
        return {
          id: agent.id,
          name: agent.name,
          color: agent.color,
          content,
          error: false
        } as AttackResult;
      } catch (err) {
        console.error(`Error with agent ${agent.name}:`, err);
        return {
          id: agent.id,
          name: agent.name,
          color: agent.color,
          content: null,
          error: true
        } as AttackResult;
      }
    });

    const attackResults = await Promise.all(attackPromises);
    setAttacks(attackResults);
    setAppState('results');
    
    await new Promise(r => setTimeout(r, 300));

    try {
      const judgeContext = `Original Idea: "${idea}"\n\n` + attackResults.map(a => 
        `${a.name} Attack:\n${a.content || '(Failed to generate attack)'}`
      ).join('\n\n');

      const judgeOutput = await callGroq(JUDGE.basePrompt, judgeContext, JUDGE.model);
      
      const statusMatch = judgeOutput.match(/VERDICT:\s*(SURVIVES|PARTIALLY SURVIVES|DOES NOT SURVIVE)/i);
      const reasonMatch = judgeOutput.match(/REASON:\s*(.+?)(?=\nTO FIX:|$)/is);
      const toFixMatch = judgeOutput.match(/TO FIX:\s*(.+)$/is);

      const resolvedStatus = (statusMatch?.[1].toUpperCase() as any) || 'PARTIALLY SURVIVES';
      const toFixVal = toFixMatch?.[1].trim() || 'Consider iterating on the arguments provided above.';
      
      let fetchedDnaTag = "";
      try {
        const dnaSystem = `Read this idea and its stress test result. Classify it into EXACTLY ONE of these categories — reply with only the category name, nothing else:\n\nFear-Based Decision\nOverconfidence Trap  \nSunk Cost Fallacy\nTiming Problem\nResource Gap\nExecution Risk\nStrong Foundation\nEmotional Reasoning\nAnalysis Paralysis`;
        fetchedDnaTag = (await callGroq(dnaSystem, `IDEA: ${idea}\nVERDICT: ${resolvedStatus}\nREASON: ${reasonMatch?.[1]}`, "llama-3.1-8b-instant")).trim().toUpperCase();
        if (fetchedDnaTag.startsWith("🧬 ")) fetchedDnaTag = fetchedDnaTag.replace("🧬 ", "");
      } catch(e) {}

      const newVerdict: VerdictResult = {
        status: resolvedStatus,
        reason: reasonMatch?.[1].trim() || 'No explicit reason provided.',
        toFix: toFixVal,
        dnaTag: fetchedDnaTag || undefined
      };

      setVerdict(newVerdict);
      
      runFramingSensitivityAnalysis(idea, tone, domain, newVerdict, attackResults).then(() => {
        if (sensitivity) setFramingSensitivity(sensitivity);
      }).catch(() => {});
      
      setHistory(prev => {
        const newVal = [{ 
          id: Date.now().toString(), 
          idea, 
          verdictStatus: resolvedStatus,
          toFix: toFixVal,
          dnaTag: fetchedDnaTag || undefined
        }, ...prev];
        return newVal.slice(0, 10);
      });
      
      setResilienceScore(prev => {
        if (resolvedStatus === 'SURVIVES') return prev + 3;
        if (resolvedStatus === 'PARTIALLY SURVIVES') return prev + 2;
        return prev + 1;
      });

    } catch (err) {
      console.error('Error with judge:', err);
      setVerdict({
        status: 'PARTIALLY SURVIVES',
        reason: 'The judge failed to reach a conclusion due to an error.',
        toFix: 'Please check your API key or try again.'
      });
    }

    setAppState('verdict');
  };

  const runFollowup = async (prompt: string) => {
    const id = Date.now().toString();
    const isSingle = prompt.length < 40;
    
    setFollowups(prev => [...prev, { id, prompt, isSingle, status: 'loading' }]);

    if (isSingle) {
      try {
        const sys = "You are Ironclad's follow-up assistant. Answer the user's question clearly, concisely, and objectively based on the stress-test results. Keep it strictly focused. No preamble.";
        const user = `Original Idea: "${originalIdea}"\n\nRecent Judge Verdict: ${verdict?.status}\n\nUser Follow-up: "${prompt}"`;
        const content = await callGroq(sys, user, 'llama-3.3-70b-versatile');
        setFollowups(prev => prev.map(f => f.id === id ? { ...f, status: 'done', singleContent: content } : f));
      } catch (err) {
        setFollowups(prev => prev.map(f => f.id === id ? { ...f, status: 'done', singleContent: 'Failed to generate response. Please try again.' } : f));
      }
    } else {
      const revisedContext = `Original Idea: "${originalIdea}"\n\nUser revised input/defense: "${prompt}"`;
      
      const newAttacksPromises = [
        AGENTS.DEVILS_ADVOCATE,
        AGENTS.PESSIMIST,
        AGENTS.STEELMAN
      ].map(async (agent) => {
        try {
          const p = buildPrompt(agent.basePrompt, currentTone, currentDomain);
          const content = await callGroq(p, revisedContext, agent.model);
          return { id: agent.id, name: agent.name, color: agent.color, content, error: false } as AttackResult;
        } catch (err) {
          return { id: agent.id, name: agent.name, color: agent.color, content: null, error: true } as AttackResult;
        }
      });

      const newAttacks = await Promise.all(newAttacksPromises);
      setFollowups(prev => prev.map(f => f.id === id ? { ...f, attacks: newAttacks } : f));
      
      const judgeInput = `Revised Idea / Defense: "${prompt}"\n\n` + newAttacks.map(a => 
        `${a.name} Attack:\n${a.content || '(Failed to generate)'}`
      ).join('\n\n');

      try {
        const judgeOutput = await callGroq(JUDGE.basePrompt, judgeInput, JUDGE.model);
        const statusMatch = judgeOutput.match(/VERDICT:\s*(SURVIVES|PARTIALLY SURVIVES|DOES NOT SURVIVE)/i);
        const reasonMatch = judgeOutput.match(/REASON:\s*(.+?)(?=\nTO FIX:|$)/is);
        const toFixMatch = judgeOutput.match(/TO FIX:\s*(.+)$/is);

        const newVerdict = {
          status: (statusMatch?.[1].toUpperCase() as any) || 'PARTIALLY SURVIVES',
          reason: reasonMatch?.[1].trim() || 'No explicit reason provided.',
          toFix: toFixMatch?.[1].trim() || 'Consider iterating further.'
        };
        setFollowups(prev => prev.map(f => f.id === id ? { ...f, status: 'done', verdict: newVerdict } : f));
      } catch (err) {
        const errorVerdict = {
          status: 'PARTIALLY SURVIVES' as any,
          reason: 'Judge evaluation failed.',
          toFix: 'Please re-submit your revision.'
        };
        setFollowups(prev => prev.map(f => f.id === id ? { ...f, status: 'done', verdict: errorVerdict } : f));
      }
    }
  };

  const runStrengthen = async () => {
    if (!verdict) return;
    setIsStrengthening(true);
    try {
       const context = `Original Idea: "${originalIdea}"\n\nAttacks:\n${attacks.map(a => a.name + ": " + a.content).join("\n")}\n\nJudge Verdict: ${verdict.status}\nJudge Reason: ${verdict.reason}\nJudge Fix: ${verdict.toFix}`;
       const content = await callGroq(STRENGTHEN_AGENT.basePrompt, context, STRENGTHEN_AGENT.model);
       setStrengthenedText(content);
    } catch (e) {
       setStrengthenedText("Error generating strengthened idea.");
    }
    setIsStrengthening(false);
  };

  const reset = () => {
    setAppState('idle');
    setOriginalIdea('');
    setAttacks([]);
    setVerdict(null);
    setFollowups([]);
    setStrengthenedText(null);
    setFramingSensitivity(null);
    clearSensitivity();
  };

  return { 
    appState, originalIdea, attacks, verdict, followups, 
    history, resilienceScore, strengthenedText, isStrengthening,
    framingSensitivity, isAnalyzingSensitivity,
    runStressTest, runFollowup, runStrengthen, reset 
  };
}
