import React, { useState, useEffect } from 'react';
import { useGroq, callGroq } from '../useGroq';
import { useEpistemicFriction } from '../useEpistemicFriction';

function DevilsRebuttal({ originalIdea, attackText, onRebuttalEngaged }: { originalIdea: string, attackText: string, onRebuttalEngaged?: () => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rebuttal, setRebuttal] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [result, setResult] = useState<string>("");

  const handleSubmit = async () => {
    setStatus('loading');
    onRebuttalEngaged?.();
    const sys = `You are a debate judge. You will receive an original argument, a Devil's Advocate attack against it, and the author's rebuttal to that attack. Judge whether the rebuttal successfully defends the original argument or whether the Devil's Advocate still wins.
Be direct. Format:
REBUTTAL VERDICT: [DEFENDED / PARTIALLY DEFENDED / ATTACK STANDS]
REASON: One sentence. Under 60 words total.`;
    const context = `ORIGINAL ARGUMENT:\n${originalIdea}\n\nDEVIL'S ADVOCATE:\n${attackText}\n\nREBUTTAL:\n${rebuttal}`;
    try {
      const res = await callGroq(sys, context, "llama-3.1-8b-instant");
      setResult(res);
    } catch(e) {}
    setStatus('done');
  };

  if (!isExpanded) {
    return (
      <button onClick={() => { setIsExpanded(true); trackCardExpansion?.(); }} style={{ marginTop: '8px', fontSize: '13px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textAlign: 'left', fontWeight: 600 }}>
        &#8617; Rebut This Attack
      </button>
    );
  }

  const resultStatusMatch = result.match(/REBUTTAL VERDICT:\s*(.+)/i);
  const resultReasonMatch = result.match(/REASON:\s*(.+)/is);
  
  let pillClass = 'hist-PARTIALLY-SURVIVES';
  if (resultStatusMatch?.[1]?.includes('ATTACK STANDS')) pillClass = 'hist-DOES-NOT-SURVIVE';
  if (resultStatusMatch?.[1]?.includes('DEFENDED') && !resultStatusMatch?.[1]?.includes('PARTIALLY')) pillClass = 'hist-SURVIVES';

  return (
    <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', animation: 'pageFadeIn 300ms ease forwards' }}>
       <textarea 
         placeholder="Counter the Devil's Advocate..." 
         value={rebuttal}
         onChange={(e) => setRebuttal(e.target.value)}
         className="app-textarea"
         style={{ minHeight: '80px', padding: '12px', fontSize: '14px' }}
       />
       {!result && (
         <button onClick={handleSubmit} disabled={rebuttal.trim() === '' || status === 'loading'} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '13px', alignSelf: 'flex-start', borderRadius: '6px' }}>
           {status === 'loading' ? 'Judging...' : 'Submit Rebuttal'}
         </button>
       )}
       {result && (
         <div style={{ marginTop: '8px', animation: 'pageFadeIn 300ms ease forwards' }}>
            <span className={`hist-badge ${pillClass}`} style={{ fontSize: '11px', marginBottom: '8px' }}>{resultStatusMatch?.[1] || 'JUDGMENT PROVIDED'}</span>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{resultReasonMatch?.[1] || result}</p>
         </div>
       )}
    </div>
  );
}
import { InputPanel } from './InputPanel';
import { LoadingCards } from './LoadingCards';
import { AttackCard } from './AttackCard';
import { VerdictCard } from './VerdictCard';
import { FollowupInput } from './FollowupInput';
import { Logo } from './Logo';
import { FramingSensitivityDisplay } from './FramingSensitivityDisplay';

export function AppPage() {
  const { 
    appState, originalIdea, attacks, verdict, followups, 
    history, resilienceScore, strengthenedText, isStrengthening,
    framingSensitivity, isAnalyzingSensitivity,
    runStressTest, runFollowup, runStrengthen, reset 
  } = useGroq();

  const [isBlindSpotModalOpen, setIsBlindSpotModalOpen] = useState(false);
  const [blindSpots, setBlindSpots] = useState<string | null>(null);
  const [isAnalyzingBlindSpots, setIsAnalyzingBlindSpots] = useState(false);

  const { score: epistemicScore, trackCardExpansion, trackRebuttalEngagement, trackIdeaRefinement, trackReadStart, trackReadEnd, computeScore, reset: resetFriction } = useEpistemicFriction();
  const [previousIdea, setPreviousIdea] = useState<string>('');

  // Compute epistemic friction score when verdict changes
  useEffect(() => {
    if (verdict && appState === 'verdict') {
      // Track that we've read the verdict
      trackReadStart();
      const timer = setTimeout(() => {
        trackReadEnd();
        computeScore();
      }, 2000); // Score after 2 seconds of reading
      return () => clearTimeout(timer);
    }
  }, [verdict, appState, trackReadStart, trackReadEnd, computeScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD/CTRL + Enter
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        const submitBtn = document.getElementById('main-submit-btn') as HTMLButtonElement | null;
        if (submitBtn && !submitBtn.disabled) submitBtn.click();
      }
      // CMD/CTRL + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('main-idea-input')?.focus();
      }
      // Escape
      if (e.key === 'Escape') {
        setIsBlindSpotModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCopyResult = () => {
    if (!verdict) return;
    const text = `Ironclad Stress Test\n\nIDEA:\n${originalIdea}\n\nVERDICT: ${verdict.status}\nREASON: ${verdict.reason}\nTO FIX: ${verdict.toFix}\n\nStress test your ideas at Ironclad.`;
    navigator.clipboard.writeText(text);
    alert('Copied result to clipboard!');
  };

  const handleAnalyzeBlindSpots = async () => {
    setIsBlindSpotModalOpen(true);
    if (blindSpots) return;
    setIsAnalyzingBlindSpots(true);
    try {
      const systemPrompt = `You are a cognitive pattern analyst. You will receive a series of ideas and arguments that a person submitted for stress testing, along with the verdicts and weaknesses identified. Your job is to identify 3 recurring cognitive blind spots or thinking patterns this person exhibits across their decisions. Be specific, compassionate, and constructive. Format your response exactly as:

BLIND SPOT 1: [Name of pattern]
WHAT IT LOOKS LIKE IN YOUR THINKING: [1-2 sentences specific to their actual ideas]
HOW TO OVERCOME IT: [1 concrete actionable sentence]

BLIND SPOT 2: ...
BLIND SPOT 3: ...`;
      const userContent = history.map(h => `IDEA: ${h.idea}\nVERDICT: ${h.verdictStatus}\nWEAKNESSES: ${h.toFix || ''}`).join('\n\n---\n\n');
      const response = await callGroq(systemPrompt, userContent, 'llama-3.3-70b-versatile');
      setBlindSpots(response);
    } catch (error) {
      setBlindSpots("Error analyzing blind spots.");
    }
    setIsAnalyzingBlindSpots(false);
  };

  return (
    <div className="app-page page-transition-enter">
      {isBlindSpotModalOpen && (
        <div className="modal-overlay animate-fade-in" style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            backdropFilter: 'blur(4px)'
        }}>
            <div className="modal-content animate-scale-up" style={{
                backgroundColor: 'var(--bg)', borderRadius: '16px',
                padding: '40px', maxWidth: '640px', width: '90%',
                maxHeight: '90vh', overflowY: 'auto', position: 'relative',
                boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)'
            }}>
                <button onClick={() => setIsBlindSpotModalOpen(false)} style={{
                    position: 'absolute', top: '24px', right: '24px',
                    background: 'var(--surface-2)', border: 'none', cursor: 'pointer',
                    width: '32px', height: '32px', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', color: 'var(--text)', transition: 'all 0.2s'
                }}>&times;</button>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '28px', color: 'var(--text)', marginBottom: '8px' }}>Your Thinking Patterns</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Based on your last {history.length} stress tests this session.</p>

                {isAnalyzingBlindSpots ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '60px 0' }}>
                        <div className="spinner-new" />
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Analyzing cognitive patterns...</span>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {blindSpots?.split(/BLIND SPOT \d+:/).filter(Boolean).map((spot, idx) => {
                            const lines = spot.split('\n').filter(Boolean);
                            const title = lines[0];
                            const content = lines.slice(1).join('\n');
                            return (
                                <div key={idx} style={{ background: 'var(--accent-light)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: 'var(--accent)' }}/>
                                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', marginBottom: '12px', letterSpacing: '0.5px' }}>{title.trim()}</h3>
                                    <div style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                        {content.trim()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
      )}
      <div className="ambient-blobs fixed-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
      </div>

      <div className="app-page-content">
        <header className="app-header">
          <div className="app-header-inner" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <a href="#/" className="app-back-link">&larr; Ironclad</a>
              <div className="app-logo" style={{ margin: 0 }}><Logo size={22} className="brand-icon" />Ironclad</div>
            </div>
            
            {history.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent)' }} />
                  Resilience Score: <span style={{ color: 'var(--text)', fontWeight: 700 }}>{resilienceScore}</span>
                </div>
                <div className="history-dropdown" style={{ position: 'relative', cursor: 'pointer' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>Session History ({history.length}) &#9662;</span>
                  <div className="history-menu">
                    {history.map(h => (
                      <div key={h.id} className="history-item">
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className={`hist-badge hist-${h.verdictStatus.replace(/\s+/g, '-')}`}>{h.verdictStatus}</span>
                          {h.dnaTag && (
                            <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              🧬 {h.dnaTag}
                            </span>
                          )}
                        </div>
                        <p className="hist-idea">{h.idea}</p>
                      </div>
                    ))}
                    {history.length >= 3 && (
                      <div style={{ padding: '8px', borderTop: '1px solid var(--border)' }}>
                        <button className="btn-secondary" style={{ width: '100%', fontSize: '12px', padding: '8px', borderRadius: '6px' }} onClick={handleAnalyzeBlindSpots}>
                          📊 My Blind Spots
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="app-content-container">
        {appState === 'idle' && (
          <InputPanel onTest={(idea, tone, domain) => runStressTest(idea, tone, domain)} disabled={false} />
        )}
        
        {appState === 'crisis' && (
            <div className="strengthened-card animate-appear-up" style={{ backgroundColor: 'var(--accent-faint)', border: '1px solid var(--accent-light)', borderRadius: 'var(--radius-lg)', padding: '32px', maxWidth: '680px', margin: '0 auto' }}>
               <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '24px' }}>
                  It sounds like you might be going through something heavy right now. Ironclad is here to help strengthen ideas — but if you're struggling, please know support is available.<br/><br/>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>iCall (India)</span>: 9152987821<br/>
                  <span style={{ color: 'var(--text)', fontWeight: 600 }}>Vandrevala Foundation</span>: 1860-2662-345<br/>
                  <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Available 24/7</span>
               </p>
               <button 
                  onClick={() => runStressTest(originalIdea, "Brutal", "None", true)} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-faint)', fontSize: '13px', cursor: 'pointer', padding: 0 }}
               >
                 Continue anyway &rarr;
               </button>
            </div>
        )}

        {appState === 'loading' && <LoadingCards />}

        {(appState === 'results' || appState === 'verdict') && (
          <div className="cards-grid">
            {attacks.map((attack, index) => (
              <div key={attack.id} style={{ animationDelay: `${index * 100}ms` }}>
                <AttackCard
                  agentName={attack.name}
                  content={attack.content}
                  error={attack.error}
                  visible={true}
                />
                {attack.name === "Devil's Advocate" && attack.content && !attack.error && (appState === 'results' || appState === 'verdict') && (
                  <DevilsRebuttal originalIdea={originalIdea} attackText={attack.content} onRebuttalEngaged={trackRebuttalEngagement} />
                )}
              </div>
            ))}
          </div>
        )}

        {appState === 'results' && (
          <div className="deliberating-new">
            <div className="spinner-new" />
            <span>Deliberating...</span>
          </div>
        )}

        {appState === 'verdict' && verdict && (
          <>
            <VerdictCard verdict={verdict} visible={true} epistemicScore={epistemicScore} />

            <FramingSensitivityDisplay sensitivity={framingSensitivity} visible={appState === 'verdict'} />

            <div className="action-buttons-row" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
               <button className="btn-secondary" onClick={handleCopyResult} style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontWeight: 600 }}>
                 &#x2398; Copy Result
               </button>
               {!strengthenedText && (
                 <button className="btn-primary" onClick={runStrengthen} disabled={isStrengthening} style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '8px' }}>
                   {isStrengthening ? 'Architecting...' : '✨ Strengthen My Idea'}
                 </button>
               )}
            </div>

            {strengthenedText && (
              <div className="strengthened-card animate-appear-up" style={{ marginTop: '32px', backgroundColor: 'rgba(220, 245, 230, 0.4)', border: '1px solid var(--accent)', borderRadius: '12px', padding: '32px' }}>
                 <div className="verdict-label" style={{ color: 'var(--accent)' }}>✨ Idea Architect (Strengthened Version)</div>
                 <p className="agent-full-text" style={{ marginTop: '16px', fontSize: '16px' }}>{strengthenedText}</p>
              </div>
            )}

            {/* Follow-up Thread */}
            {followups.map((f, i) => (
              <div key={f.id} className="followup-thread-item animate-slide-up" style={{ marginTop: '48px', paddingTop: '40px', borderTop: '1px dashed var(--border-strong)' }}>
                <div className="followup-user-prompt" style={{ marginBottom: '24px' }}>
                  <div className="verdict-label" style={{ color: 'var(--text)' }}>You Followed Up:</div>
                  <p className="agent-full-text" style={{ fontSize: '18px', fontWeight: 500 }}>"{f.prompt}"</p>
                </div>
                
                {f.status === 'loading' && (
                  <div className="deliberating-new" style={{ marginTop: '24px', justifyContent: 'flex-start' }}>
                    <div className="spinner-new" />
                    <span>{f.isSingle ? 'Agent is thinking...' : 'Agents are re-evaluating...'}</span>
                  </div>
                )}
                
                {f.status === 'done' && f.isSingle && (
                   <div className="followup-single-response verdict-card animate-appear-up" style={{ alignSelf: 'flex-start', padding: '24px' }}>
                     <div className="verdict-label" style={{ color: 'var(--accent)' }}>Follow-up Response</div>
                     <p className="agent-full-text">{f.singleContent}</p>
                   </div>
                )}

                {f.status === 'done' && !f.isSingle && (
                   <div className="followup-full-response">
                      <div className="cards-grid" style={{ marginTop: 0 }}>
                        {f.attacks?.map((attack, index) => (
                          <div key={attack.id} style={{ animationDelay: `${index * 100}ms` }}>
                            <AttackCard
                              agentName={attack.name}
                              content={attack.content}
                              error={attack.error}
                              visible={true}
                            />
                          </div>
                        ))}
                      </div>
                      {f.verdict && (
                         <div style={{ marginTop: '24px' }}>
                           <VerdictCard verdict={f.verdict} visible={true} />
                         </div>
                      )}
                   </div>
                )}
              </div>
            ))}

            <div className="followup-input-container animate-fade-in" style={{ marginTop: '48px', paddingTop: '40px', borderTop: '1px dashed var(--border-strong)' }}>
              <FollowupInput onTest={runFollowup} disabled={followups.some(f => f.status === 'loading')} />
            </div>

            <div style={{ marginTop: '60px', textAlign: 'center' }}>
              <button className="btn-app-reset" onClick={() => { reset(); resetFriction(); }}>
                &larr; Start completely fresh
              </button>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
}
