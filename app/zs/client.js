'use client';

import { useMemo, useState } from 'react';
import { deviceTypes, getMaxZs, zsTable } from '@/lib/zs-data';
import { LeadCapture } from '@/components/LeadCapture';
import { SiteNav } from '@/components/SiteNav';

const standardRatings = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125];

const initialState = {
  deviceKey: 'MCB-B',
  rating: 32,
  earthing: 'TN-C-S',
  measuredZs: '',
};

export function ZsClient() {
  const [form, setForm] = useState(initialState);
  const update = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const device = zsTable[form.deviceKey];
  const maxZs = useMemo(() => getMaxZs(form.deviceKey, form.rating), [form.deviceKey, form.rating]);
  const measured = parseFloat(form.measuredZs);
  const hasMeasured = !isNaN(measured) && measured > 0;
  const pass = hasMeasured ? measured <= maxZs : null;

  // Available ratings for selected device
  const availableRatings = useMemo(() => {
    if (!device) return standardRatings;
    return Object.keys(device.ratings).map(Number).sort((a, b) => a - b);
  }, [device]);

  return (
    <main className="page">
      <SiteNav current="/zs" />
      <section className="hero hero-slim">
        <div>
          <p className="eyebrow">BS 7671 design tool</p>
          <h1>Zs / disconnection time checker</h1>
          <p className="lead">Look up maximum permissible earth fault loop impedance (Zs) values for MCB, RCBO and fuse types per BS 7671 Tables 41.2–41.4. Enter your measured Zs to check compliance.</p>
        </div>
      </section>

      <section className="calculator-shell single-col" id="calculator">
        <div className="panel form-panel">
          <h2>Circuit inputs</h2>
          <div className="grid two-col">
            <label><span>Earthing system</span>
              <select value={form.earthing} onChange={e => update('earthing', e.target.value)}>
                <option value="TN-S">TN-S</option>
                <option value="TN-C-S">TN-C-S (PME)</option>
                <option value="TT">TT (informational only)</option>
              </select>
            </label>
            <label><span>Protective device type</span>
              <select value={form.deviceKey} onChange={e => {
                update('deviceKey', e.target.value);
                const newRatings = Object.keys(zsTable[e.target.value].ratings).map(Number).sort((a,b)=>a-b);
                if (!newRatings.includes(form.rating)) update('rating', newRatings[0]);
              }}>
                {deviceTypes.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
              </select>
            </label>
            <label><span>Device rating (A)</span>
              <select value={form.rating} onChange={e => update('rating', Number(e.target.value))}>
                {availableRatings.map(r => <option key={r} value={r}>{r} A</option>)}
              </select>
            </label>
            <label>
              <span>Measured Zs (Ω) <span style={{fontWeight:400,color:'var(--muted)'}}>— optional</span></span>
              <input
                type="number"
                step="0.01"
                placeholder="e.g. 0.85"
                value={form.measuredZs}
                onChange={e => update('measuredZs', e.target.value)}
                onFocus={e => e.target.select()}
              />
            </label>
          </div>

          {form.earthing === 'TT' && (
            <div className="warning-block" style={{marginTop:16,borderRadius:14,padding:'14px 16px'}}>
              <strong>⚠️ TT system note:</strong> On TT systems, earth fault loop impedance is typically too high for overcurrent devices to disconnect within the required time. RCD protection is required. Zs alone is not sufficient for fault protection on TT systems — see BS 7671 Regulation 411.5.
            </div>
          )}
        </div>

        <div className="panel result-panel">
          <h2>Results</h2>
          <div className="result-grid">
            <div className="metric-card">
              <strong>Maximum Zs</strong>
              <span>{maxZs !== null ? `${maxZs.toFixed(2)} Ω` : 'Not in table'}</span>
              <p className="workings">
                {device?.label} — {form.rating} A<br />
                Source: {device?.source}<br />
                <span className="workings-note">{device?.note}</span>
              </p>
            </div>

            {hasMeasured && maxZs !== null && (
              <div className={`check-card ${pass ? 'pass' : 'fail'}`} style={{gridColumn:'1/-1'}}>
                <strong>Measured Zs check</strong>
                <span>{pass
                  ? `Pass — measured ${measured.toFixed(2)} Ω ≤ max ${maxZs.toFixed(2)} Ω`
                  : `Fail — measured ${measured.toFixed(2)} Ω exceeds max ${maxZs.toFixed(2)} Ω`
                }</span>
                {!pass && (
                  <p className="workings">
                    Measured Zs exceeds the maximum permitted value. Consider: reducing cable run length, increasing cable CSA, or reviewing the earthing arrangement.
                  </p>
                )}
              </div>
            )}

            {!hasMeasured && maxZs !== null && (
              <div className="metric-card" style={{gridColumn:'1/-1'}}>
                <strong>Enter measured Zs above to check compliance</strong>
                <p className="workings">Use a loop impedance tester on site and enter the reading above. The measured value must not exceed {maxZs.toFixed(2)} Ω for this device.</p>
              </div>
            )}

            <div className="check-card placeholder" style={{gridColumn:'1/-1'}}>
              <strong>Disconnection time</strong>
              <span>0.4 s (TN socket/lighting circuits ≤ 32 A)</span>
              <p className="workings">
                These values are for 0.4 s disconnection per BS 7671 Table 41.1, applicable to 230 V socket outlet circuits and other circuits ≤ 32 A in TN systems. For final circuits supplying only fixed equipment (&gt; 32 A), or submains, 5 s disconnection applies — Zs limits will be higher. Refer to BS 7671 Tables 41.2–41.4 directly for 5 s values.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel assumptions-panel">
        <h2>Assumptions and limitations</h2>
        <div className="assumptions-grid">
          <div className="assumption-block">
            <h3>What this tool covers</h3>
            <ul>
              <li>Maximum Zs at 0.4 s disconnection for 230 V TN systems</li>
              <li>MCB Type B, C and D to BS EN 60898</li>
              <li>BS 88-2/88-3 industrial cartridge fuses</li>
              <li>BS 3036 semi-enclosed (rewirable) fuses</li>
            </ul>
          </div>
          <div className="assumption-block">
            <h3>Known limitations</h3>
            <ul>
              <li><strong>0.4 s only.</strong> 5 s disconnection values (fixed equipment, submains) are not yet tabulated here — check BS 7671 Tables 41.2–41.4 directly</li>
              <li><strong>TT systems:</strong> Zs alone is insufficient — RCD protection is required (BS 7671 Reg 411.5)</li>
              <li><strong>RCBOs:</strong> Overcurrent trip characteristics follow the MCB type (B/C/D) — select accordingly</li>
              <li><strong>Temperature correction:</strong> Measured Zs should be corrected for conductor temperature if required — multiply by 1.24 for a cold PVC conductor correction per BS 7671 Appendix 14</li>
              <li>This tool covers single-phase 230 V circuits only</li>
            </ul>
          </div>
          <div className="assumption-block warning-block" style={{gridColumn:'1/-1'}}>
            <h3>⚠️ Important notice</h3>
            <p>This is a preliminary design aid only. Zs measurements on site must be verified against the current edition of BS 7671 Tables 41.2–41.4 by a qualified electrician before certification. Do not rely solely on this tool for certification decisions.</p>
          </div>
        </div>
      </section>

      <LeadCapture />
    </main>
  );
}
