'use client';

import { useEffect, useState } from 'react';
import { Calculator } from './Calculator';
import { SimpleCalculator } from './SimpleCalculator';

export function CableSizeApp() {
  const [mode, setMode] = useState('simple');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cablecalc-mode');
      if (saved === 'expert' || saved === 'simple') setMode(saved);
    } catch {}
  }, []);

  const switchMode = (m) => {
    setMode(m);
    try { localStorage.setItem('cablecalc-mode', m); } catch {}
  };

  return (
    <>
      <div className="mode-toggle-wrap">
        <div className="mode-toggle" role="group" aria-label="Calculator mode">
          <button
            className={`mode-toggle-btn${mode === 'simple' ? ' active' : ''}`}
            onClick={() => switchMode('simple')}
            type="button"
          >
            Simple Mode
          </button>
          <button
            className={`mode-toggle-btn${mode === 'expert' ? ' active' : ''}`}
            onClick={() => switchMode('expert')}
            type="button"
          >
            Expert Mode
          </button>
        </div>
        <p className="mode-desc">
          {mode === 'simple'
            ? 'For homeowners — pick your appliance, answer 3 questions, get plain English advice.'
            : 'Full BS 7671 design tool for electricians and designers.'}
        </p>
      </div>
      {mode === 'simple' ? <SimpleCalculator /> : <Calculator />}
    </>
  );
}
