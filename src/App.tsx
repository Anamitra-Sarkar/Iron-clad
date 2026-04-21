import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { AppPage } from './components/AppPage';
import { DocsPage } from './components/DocsPage';

export default function App() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const route = hash === '#/app' ? 'app' : hash === '#/docs' ? 'docs' : 'landing';

  return (
    <>
      {route === 'app' && <AppPage />}
      {route === 'docs' && <DocsPage />}
      {route === 'landing' && <LandingPage />}
    </>
  );
}
