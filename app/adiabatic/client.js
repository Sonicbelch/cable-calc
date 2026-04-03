'use client';

import { useMemo, useState } from 'react';
import { adiabaticK, cableOptions } from '@/lib/cable-data';
import { computeAdiabaticS } from '@/lib/calculations';
import { LeadCapture } from '@/components/LeadCapture';
import { SiteNav } from '@/components/SiteNav';

const initialState = {
  faultCurrent: 3000,
  disconnectionTime: 0.4,
  conductor: 'Cu',
  insulation: 'PVC',
  proposedSize: 2.5,
};

export function AdiabaticClient() {
  const [form, setForm] = useState(initialState);
  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const k = adiabaticK[form.conductor][form.insulation];
  const minSize = useMemo(
    () => computeAdiabaticS(form.faultCurrent, form.disconnectionTime, form.conductor, form.insulation),
    [form.faultCurrent, form.disconnectionTime, form.conductor, form.insulation]
  );

  const proposedCable = useMemo(
    () => cableOptions.find(c => c.size === form.proposedSize) || cableOptions[1],
    [form.proposedSize]
  );
  const pass = proposedCable.size >= minSize;

  const nextSufficientSize = useMemo(
    () => cableOptions.find(c => c.size >= minSize),
    [minSize]
  );

  return (
    <main className="page">
      <SiteNav current="/adiabatic" />
      <section className="hero hero-slim">
        <div>
          <p className="eyebrow">BS 7671 design tool</p>
          <h1>Adiabatic CPC size calculator</h1>
          <p className="lead">Calculate the minimum protective conductor (CPC / earth) size using the adiabatic equation from BS 7671 Regulation 543.1.3. Enter the prospective fault current, disconnection time, and conductor material.</p>
        </div>
      </section>

      <section className="calculator-shell single-col" id="calculator">
        <div className="panel form-panel">
          <h2>Circuit inputs</h2>
          <div className="grid two-col">
            <label><span>Prospective fault current If (A)</span>
              <input type="number" value={form.faultCurrent} onChange={e => update('faultCurrent', Number(e.target.value))} />
            </label>
            <label><span>Disconnection time t (s)</span>
              <input type="number" step="0.01" value={form.disconnectionTime} onChange={e => update('disconnectionTime', Number(e.target.value))} />
            </label>
            <label><span>Conductor material</span>
              <select value={form.conductor} onChange={e => update('conductor', e.target.value)}>
                <option value="Cu">Copper</option>
                <option value="Al">Aluminium</option>
              </select>
            </label>
            <label><span>Insulation type</span>
              <select value={form.insulation} onChange={e => update('insulation', e.target.value)}>
                <option value="PVC">PVC (thermoplastic)</option>
                <option value="XLPE">XLPE (thermosetting)</option>
              </select>
            </label>
            <label><span>Proposed CPC size (mm²)</span>
              <select value={form.proposedSize} onChange={e => update('proposedSize', Number(e.target.value))}>
                {cableOptions.map(c => <option key={c.size} value={c.size}>{c.size} mm²</option>)}
              </select>
            </label>
          </div>
        </div>

        <div className="panel result-panel">
          <h2>Results</h2>
          <div className="result-grid">
            <div className="metric-card">
              <strong>Minimum CPC size (S)</strong>
              <span>{minSize.toFixed(2)} mm²</span>
              <p className="workings">
                S = (If² × t)^0.5 ÷ k = ({form.faultCurrent}² × {form.disconnectionTime})^0.5 ÷ {k} = <strong>{minSize.toFixed(2)} mm²</strong>
                <br /><span className="workings-note">k = {k} for {form.conductor}/{form.insulation} — BS 7671 Table {form.conductor === 'Cu' ? (form.insulation === 'PVC' ? '54.2' : '54.3') : '54.4'}</span>
              </p>
            </div>
            <div className="metric-card">
              <strong>Next standard size ≥ minimum</strong>
              <span>{nextSufficientSize ? `${nextSufficientSize.size} mm²` : '> 95 mm² — outside table'}</span>
              <p className="workings">First standard cable size from BS 7671 Appendix 4 that satisfies S ≥ {minSize.toFixed(2)} mm²</p>
            </div>
            <div className={`check-card ${pass ? 'pass' : 'fail'}`} style={{gridColumn:'1/-1'}}>
              <strong>Proposed CPC check — {form.proposedSize} mm²</strong>
              <span>{pass ? `Pass — ${form.proposedSize} mm² ≥ ${minSize.toFixed(2)} mm² minimum` : `Fail — ${form.proposedSize} mm² is less than the ${minSize.toFixed(2)} mm² minimum`}</span>
              {!pass && nextSufficientSize && (
                <p className="workings">Minimum standard size required: <strong>{nextSufficientSize.size} mm²</strong></p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="panel assumptions-panel">
        <h2>Assumptions and limitations</h2>
        <div className="assumptions-grid">
          <div className="assumption-block">
            <h3>What this tool calculates</h3>
            <ul>
              <li>Minimum CPC cross-sectional area using BS 7671 Reg 543.1.3: S = (I²t)^0.5 ÷ k</li>
              <li>k values from BS 7671 Tables 54.2–54.4 for copper and aluminium conductors</li>
            </ul>
          </div>
          <div className="assumption-block">
            <h3>Known limitations</h3>
            <ul>
              <li>The adiabatic equation assumes worst-case energy let-through — for current-limiting devices (Type 2 coordination) the actual energy may be lower</li>
              <li>Does not verify that disconnection will actually occur within the stated time — use the Zs tool for that check</li>
              <li>k values for conductors forming part of a cable differ from separate conductors — refer to BS 7671 Table 54.5 for steel conduit/trunking</li>
            </ul>
          </div>
          <div className="assumption-block warning-block" style={{gridColumn:'1/-1'}}>
            <h3>⚠️ Important notice</h3>
            <p>This is a preliminary design aid only. Verify all results against the current edition of BS 7671 and manufacturer data before carrying out or certifying any electrical work.</p>
          </div>
        </div>
      </section>

      <LeadCapture />
    </main>
  );
}
