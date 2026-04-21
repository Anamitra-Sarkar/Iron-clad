import React from 'react';
import { Logo } from './Logo';

export function DocsPage() {
  return (
    <div className="docs-page page-transition-enter">
      <div className="ambient-blobs fixed-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
        <div className="blob blob-4"></div>
      </div>
      <header className="app-header">
        <div className="app-header-inner">
          <a href="#/" className="app-back-link">&larr; Back to Home</a>
          <div className="app-logo"><Logo size={22} className="brand-icon" />Ironclad Docs</div>
        </div>
      </header>

      <div className="docs-content">
        <div className="docs-header">
          <div className="docs-label">OFFICIAL DOCUMENTATION</div>
          <h1 className="docs-title">How Ironclad Works</h1>
          <p className="docs-subtitle">Everything you need to know about the adversarial testing environment.</p>
        </div>

        <section className="docs-section">
          <h2>System Overview</h2>
          <p>
            Ironclad is an AI-powered adversarial stress-testing environment. By simulating rigorous critique from multiple angles, it helps you refine your arguments, uncover blind spots, and ultimately build stronger propositions before they meet the real world.
          </p>
          <p>
            There is no sign-up or data-logging. Your inputs are transmitted securely for processing and are immediately discarded.
          </p>
        </section>

        <section className="docs-section">
          <h2>The Critique Agents</h2>
          <ul className="docs-list">
            <li>
              <strong>Devil's Advocate:</strong> Relentlessly targets the central premise of your argument to identify logical fallacies, contradictions, and structural weaknesses.
            </li>
            <li>
              <strong>The Pessimist:</strong> Completely ignores theory and looks strictly at execution. It forecasts the most realistic, painful worst-case scenarios and real-world friction points.
            </li>
            <li>
              <strong>Steelman:</strong> Instead of attacking you, it builds the strongest possible counter-argument. It ignores your minor flaws to tackle you at your best using the opposing view.
            </li>
          </ul>
        </section>

        <section className="docs-section">
          <h2>The Judge Protocol</h2>
          <p>
            The Judge agent acts as an impartial synthesizer. It reads your original entry simultaneously with all three independent critiques, and outputs a final ruling structured clearly into three parts:
          </p>
          <ul className="docs-list">
            <li><strong>Verdict:</strong> Graded strictly as SURVIVES, PARTIALLY SURVIVES, or DOES NOT SURVIVE.</li>
            <li><strong>Reasoning:</strong> A concise explanation of why the argument stands or falls based on the critiques.</li>
            <li><strong>Remediation (To Fix):</strong> Specific, actionable steps to patch the vulnerabilities discovered by the agents.</li>
          </ul>
        </section>

        <section className="docs-section">
          <h2>Best Practices</h2>
          <p>
            To get the most out of Ironclad, follow these guidelines when writing your initial input:
          </p>
          <ol className="Numbered-docs-list">
            <li><strong>Be specific:</strong> "We should launch a paid tier" is too vague. "We should launch a $10/mo paid tier aimed at power users to subsidize API costs" gives the agents angles to attack.</li>
            <li><strong>State your assumptions:</strong> If your idea relies on a specific piece of data, state it. The agents will aggressively check if that assumption holds weight.</li>
            <li><strong>Don't hold back:</strong> Use this tool for your riskiest, most controversial, or most expensive ideas. Let it fail here so it succeeds out there.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}
