import React, { useEffect, useState } from 'react';
import { Logo } from './Logo';

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Fixed Navbar — outside .landing-page so no ancestor creates a new stacking context */}
      <nav className={`hero-nav hero-nav--fixed ${scrolled ? 'hero-nav--scrolled' : ''}`}>
        <div className="hero-logo"><Logo size={26} className="brand-icon" />Ironclad</div>
        <div className="hero-links">
          <a href="#home">Home</a>
          <a href="#about">About the App</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#/docs">Docs</a>
        </div>
        <a href="#/app" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px', fontFamily: 'var(--font-display)', fontWeight: 500 }}>
          Start Testing &rarr;
        </a>
      </nav>

      <div className="landing-page page-transition-enter">

        <div id="home" className="hero-section">
          <div className="ambient-blobs fixed-blobs">
            <div className="blob blob-1"></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>
            <div className="blob blob-4"></div>
          </div>

          <div className="hero-content">
            <div className="hero-badge">Argument Stress-Tester</div>
            <h1 className="hero-title">Make Your Ideas Bulletproof.</h1>
            <p className="hero-subtitle">
              Three independent critics attack your idea from every angle. One judge delivers the verdict. No flattery. No sycophancy. Just clarity.
            </p>
            <a href="#/app" className="btn-primary btn-large hero-cta">
              Stress Test Your Idea &rarr;
            </a>
            <p className="hero-footer-text">
              Free to use &middot; No account required
            </p>
          </div>
        </div>

        <div id="about" className="about-section">
          <div className="about-inner">
            <div className="how-label">ABOUT THE APP</div>
            <h2 className="how-title">Why Ironclad?</h2>
            <p className="about-desc">
              In an era of filter bubbles and echo chambers, bad ideas survive far too long because they are rarely challenged. Ironclad was built to provide immediate friction. It acts as an objective, emotionless crucible designed to break your arguments in private, enabling you to refine and rebuild them before presenting them in public.
            </p>
          </div>
        </div>

        <div id="how-it-works" className="how-section">
          <div className="how-label">HOW IT WORKS</div>
          <h2 className="how-title">Three critics. One verdict.</h2>

          <div className="how-cards">
            <div className="how-card devils-card">
              <div className="how-icon">⚔</div>
              <h3 className="how-card-title">Devil's Advocate</h3>
              <p className="how-card-desc">Finds the single strongest logical flaw in your argument. No mercy.</p>
            </div>
            <div className="how-card pessimist-card">
              <div className="how-icon">🌧</div>
              <h3 className="how-card-title">The Pessimist</h3>
              <p className="how-card-desc">Models the most realistic worst-case failure scenario.</p>
            </div>
            <div className="how-card steelman-card">
              <div className="how-icon">🏛</div>
              <h3 className="how-card-title">Steelman</h3>
              <p className="how-card-desc">Builds the strongest possible case for the opposing view.</p>
            </div>
          </div>

          <div className="how-judge-card">
            <div className="how-icon">⚖</div>
            <h3 className="how-judge-title">The Judge</h3>
            <p className="how-judge-desc">
              Reads all three attacks, then delivers a structured verdict: whether your idea survives, why, and exactly what to fix.
            </p>
          </div>
        </div>

        <footer className="footer">
          <div className="footer-left">
            <div className="footer-logo"><Logo size={20} className="brand-icon" />Ironclad</div>
            <div className="footer-tagline">Stress-test ideas before you commit.</div>
          </div>
          <div className="footer-right">
            Ironclad
          </div>
        </footer>
      </div>
    </>
  );
}
