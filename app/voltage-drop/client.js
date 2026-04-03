'use client';

import { useMemo, useState } from 'react';
import { cableOptions } from '@/lib/cable-data';
import { computeVoltageDrop, getVoltageDropLimit } from '@/lib/calculations';
import { LeadCapture } from '@/components/LeadCapture';
import { SiteNav } from '@/components/SiteNav';

const initialState = {
  supply: '1P',
  circuitType: 'socket-radial',
  cableSize: 2.5,
  conductor: 'Cu',
  designCurrent: 20,
  length: 25,
};

export function VoltageDropClient() {
  const [form, setForm] = useState(initialState);

  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const selectedCable = useMemo(
    () => cableOptions.find(c => c.size === form.cableSize) || cableOptions[1],
    [form.cableSize]
  );

  const voltageDrop = useMemo(
    () => computeVoltageDrop(selectedCable, form.designCurrent, form.length, form.supply),
    [selectedCable, form.designCurrent, form.length, form.supply]
  );

  const voltageDropLimit = useMemo(
    () => getVoltageDropLimit(form.circuitType, form.supply),
    [form.circuitType, form.supply]
  );

  const nominalV = form.supply === '3P' ? 400 : 230;
  const mv = form.supply === '3P' ? selectedCable.mvA3 : selectedCable.mvA;
  const pct = ((voltageDrop / nominalV) * 100).toFixed(2);
  const limitPct = form.circuitType === 'lighting' ? 3 : 5;
  const pass = voltageDrop <= voltageDropLimit;

  return (
    <main className="page">
      <SiteNav current="/voltage-drop" />
      <section className="hero hero-slim">
        <div>
          <p className="eyebrow">BS 7671 design tool</p>
          <h1>Voltage drop calculator</h1>
          <p className="lead">Check cable voltage drop against BS 7671 Appendix 12 limits. Enter cable size, design current and run length to see whether your circuit meets the 3% lighting or 5% power limit.</p>
        </div>
      </section>

      <section className="calculator-shell single-col" id="calculator">
        <div className="panel form-panel">
          <h2>Circuit inputs</h2>
          <div className="grid two-col">
            <label><span>Supply</span>
              <select value={form.supply} onChange={e => update('supply', e.target.value)}>
                <option value="1P">Single-phase (230 V)</option>
                <option value="3P">Three-phase (400 V)</option>
              </select>
            </label>
            <label><span>Circuit type</span>
              <select value={form.circuitType} onChange={e => update('circuitType', e.target.value)}>
                <option value="lighting">Lighting (3% limit)</option>
                <option value="socket-radial">Socket / power (5% limit)</option>
                <option value="ring-final">Ring final (5% limit)</option>
                <option value="motor">Motor (5% limit)</option>
                <option value="submain">Submain (5% limit)</option>
              </select>
            </label>
            <label><span>Cable size (mm²)</span>
              <select value={form.cableSize} onChange={e => update('cableSize', Number(e.target.value))}>
                {cableOptions.map(c => <option key={c.size} value={c.size}>{c.size} mm²</option>)}
              </select>
            </label>
            <label><span>Conductor</span>
              <select value={form.conductor} onChange={e => update('conductor', e.target.value)}>
                <option value="Cu">Copper</option>
                <option value="Al">Aluminium</option>
              </select>
            </label>
            <label><span>Design current Ib (A)</span>
              <input type="number" value={form.designCurrent} onChange={e => update('designCurrent', Number(e.target.value))} />
            </label>
            <label><span>One-way cable length (m)</span>
              <input type="number" value={form.length} onChange={e => update('length', Number(e.target.value))} />
            </label>
          </div>
        </div>

        <div className="panel result-panel">
          <h2>Results</h2>
          <div className="result-grid">
            <div className="metric-card">
              <strong>Voltage drop</strong>
              <span>{voltageDrop.toFixed(2)} V ({pct}%)</span>
              <p className="workings">
                Vd = (mV/A/m × Ib × L) ÷ 1000 = ({mv} × {form.designCurrent} × {form.length}) ÷ 1000 = <strong>{voltageDrop.toFixed(2)} V</strong>
              </p>
            </div>
            <div className="metric-card">
              <strong>Limit</strong>
              <span>{voltageDropLimit.toFixed(2)} V ({limitPct}% of {nominalV} V)</span>
              <p className="workings">BS 7671 Appendix 12 — {limitPct}% × {nominalV} V nominal</p>
            </div>
            <div className={`check-card ${pass ? 'pass' : 'fail'}`} style={{gridColumn:'1/-1'}}>
              <strong>Voltage drop check</strong>
              <span>{pass ? `Pass — ${voltageDrop.toFixed(2)} V ≤ ${voltageDropLimit.toFixed(2)} V limit` : `Fail — ${voltageDrop.toFixed(2)} V exceeds ${voltageDropLimit.toFixed(2)} V limit`}</span>
              <p className="workings">
                mV/A/m value for {form.cableSize} mm² ({form.supply === '3P' ? '3-phase' : 'single-phase'}): {mv} — BS 7671 Appendix 4
                <br /><span className="workings-note">Note: resistive component only. Reactive component not included — results may be slightly optimistic for large cables on long runs.</span>
              </p>
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
              <li>Voltage drop (V and %) for a cable of known size and run length</li>
              <li>Comparison against BS 7671 Appendix 12 default limits (3% lighting, 5% other)</li>
            </ul>
          </div>
          <div className="assumption-block">
            <h3>Known limitations</h3>
            <ul>
              <li>Resistive mV/A/m values only — reactive component not included</li>
              <li>Does not apply correction factors (temperature, grouping). Use the Cable Size tool if you need corrected Iz as well</li>
              <li>Cable data covers 1.5–95 mm² only</li>
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
