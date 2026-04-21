import { useState, useCallback, useRef, useEffect } from 'react';

export interface EpistemicFrictionMetrics {
  cardExpansions: number;
  rebuttalsEngaged: number;
  ideaRefinements: number;
  totalReadTime: number; // in seconds
}

export interface EpistemicFrictionScore {
  score: number; // 0-7+
  metrics: EpistemicFrictionMetrics;
  level: 'none' | 'low' | 'medium' | 'high';
}

function calculateLCS(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const dp: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp[len1][len2];
}

function getSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  const lcsLength = calculateLCS(str1.toLowerCase(), str2.toLowerCase());
  const maxLen = Math.max(str1.length, str2.length);
  return (lcsLength / maxLen) * 100;
}

export function useEpistemicFriction() {
  const [metrics, setMetrics] = useState<EpistemicFrictionMetrics>({
    cardExpansions: 0,
    rebuttalsEngaged: 0,
    ideaRefinements: 0,
    totalReadTime: 0,
  });

  const [score, setScore] = useState<EpistemicFrictionScore | null>(null);
  const readStartTimeRef = useRef<number>(0);
  const sessionStartRef = useRef<number>(Date.now());
  const previousIdeasRef = useRef<string[]>([]);

  const trackCardExpansion = useCallback(() => {
    setMetrics((prev) => ({
      ...prev,
      cardExpansions: prev.cardExpansions + 1,
    }));
  }, []);

  const trackRebuttalEngagement = useCallback(() => {
    setMetrics((prev) => ({
      ...prev,
      rebuttalsEngaged: prev.rebuttalsEngaged + 1,
    }));
  }, []);

  const trackIdeaRefinement = useCallback((originalIdea: string, refinedIdea: string) => {
    // Check if ideas are significantly different (< 70% similarity)
    const similarity = getSimilarity(originalIdea, refinedIdea);
    if (similarity < 70) {
      setMetrics((prev) => ({
        ...prev,
        ideaRefinements: prev.ideaRefinements + 1,
      }));
    }
  }, []);

  const trackReadStart = useCallback(() => {
    readStartTimeRef.current = Date.now();
  }, []);

  const trackReadEnd = useCallback(() => {
    if (readStartTimeRef.current > 0) {
      const elapsed = (Date.now() - readStartTimeRef.current) / 1000;
      setMetrics((prev) => ({
        ...prev,
        totalReadTime: prev.totalReadTime + Math.min(elapsed, 120), // cap at 2 minutes per read
      }));
      readStartTimeRef.current = 0;
    }
  }, []);

  const computeScore = useCallback(() => {
    const { cardExpansions, rebuttalsEngaged, ideaRefinements, totalReadTime } = metrics;

    // Scoring algorithm: 0-7+ scale
    let calculatedScore = 0;

    // Card expansions: max 2 points (0.5 per expansion, capped at 2)
    calculatedScore += Math.min(cardExpansions * 0.5, 2);

    // Rebuttal engagement: max 2 points (1 per rebuttal, capped at 2)
    calculatedScore += Math.min(rebuttalsEngaged * 1, 2);

    // Idea refinements: max 2 points (0.5 per refinement, capped at 2)
    calculatedScore += Math.min(ideaRefinements * 0.5, 2);

    // Read time: max 1.5 points (1 point per 60 seconds, capped at 1.5)
    calculatedScore += Math.min((totalReadTime / 60) * 1, 1.5);

    // Bonus for sustained engagement over time
    const sessionDuration = (Date.now() - sessionStartRef.current) / 1000 / 60; // in minutes
    if (sessionDuration > 5) {
      calculatedScore += Math.min(sessionDuration * 0.1, 1); // bonus up to 1 point
    }

    let level: 'none' | 'low' | 'medium' | 'high' = 'none';
    if (calculatedScore >= 2 && calculatedScore < 4) level = 'low';
    if (calculatedScore >= 4 && calculatedScore < 6) level = 'medium';
    if (calculatedScore >= 6) level = 'high';

    const newScore: EpistemicFrictionScore = {
      score: Math.round(calculatedScore * 10) / 10,
      metrics,
      level,
    };

    setScore(newScore);
    return newScore;
  }, [metrics]);

  const reset = useCallback(() => {
    setMetrics({
      cardExpansions: 0,
      rebuttalsEngaged: 0,
      ideaRefinements: 0,
      totalReadTime: 0,
    });
    setScore(null);
    sessionStartRef.current = Date.now();
    previousIdeasRef.current = [];
  }, []);

  return {
    metrics,
    score,
    trackCardExpansion,
    trackRebuttalEngagement,
    trackIdeaRefinement,
    trackReadStart,
    trackReadEnd,
    computeScore,
    reset,
  };
}
