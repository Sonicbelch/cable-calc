'use client';

import { useMemo, useState } from 'react';
import {
  computeIb,
  computeIz,
  computeVoltageDrop,
  getVoltageDropLimit,
  selectCable,
  snapFactor,
  getCorrectionFactor
} from '@/lib/calculations';
import {
  ambientTempFactors,
  cableOptions,
  groupingFactors,
  installationMethodFactor
} from '@/lib/cable-data';

const APPLIANCES = [
  { id: 'cooker',     name: 'Cooker / Oven',        icon: '🍳', load: '8–10 kW',       watts: 10000, mcb1P: 45, mcb3P: 20, pf: 1,   circuitType: 'socket-radial' },
  { id: 'shower',     name: 'Electric Shower',       icon: '🚿', load: '8–10.5 kW',    watts: 9000,  mcb1P: 40, mcb3P: 16, pf: 1,   circuitType: 'socket-radial' },
  { id: 'ev',         name: 'EV Charger',            icon: '⚡', load: '7–7.4 kW',      watts: 7200,  mcb1P: 32, mcb3P: 16, pf: 1,   circuitType: 'socket-radial' },
  { id: 'immersion',  name: 'Immersion Heater',      icon: '🌡', load: '3 kW',          watts: 3000,  mcb1P: 16, mcb3P: 6,  pf: 1,   circuitType: 'socket-radial', minSize: 2.5 },
  { id: 'washer',     name: 'Washing Machine',       icon: '👕', load: '2–2.4 kW',      watts: 2400,  mcb1P: 16, mcb3P: 6,  pf: 0.9, circuitType: 'socket-radial', minSize: 2.5 },
  { id: 'dryer',      name: 'Tumble Dryer',          icon: '🌀', load: '2.5–3 kW',     watts: 3000,  mcb1P: 16, mcb3P: 6,  pf: 1,   circuitType: 'socket-radial', minSize: 2.5 },
  { id: 'dishwasher', name: 'Dishwasher',            icon: '🍽', load: '2–2.4 kW',     watts: 2400,  mcb1P: 16, mcb3P: 6,  pf: 0.9, circuitType: 'socket-radial', minSize: 2.5 },
  { id: 'fridge',     name: 'Fridge / Freezer',      icon: '❄', load: '0.1–0.2 kW',   watts: 200,   mcb1P: 6,  mcb3P: 6,  pf: 1,   circuitType: 'socket-radial' },
  { id: 'lighting',   name: 'Lighting Circuit',      icon: '💡', load: '0.5–1 kW',     watts: 1000,  mcb1P: 6,  mcb3P: 6,  pf: 1,   circuitType: 'lighting'      },
  { id: 'sockets',    name: 'Sockets (ring main)',   icon: '🔌', load: 'up to 7.2 kW', watts: 4600,  mcb1P: 32, mcb3P: 16, pf: 1,   circuitType: 'ring-final', ringNote: true },
  { id: 'towelrail',  name: 'Electric Towel Rail',   icon: '🛁', load: '0.5–1 kW',     watts: 600,   mcb1P: 6,  mcb3P: 6,  pf: 1,   circuitType: 'socket-radial' },
  { id: 'hob',        name: 'Electric Hob',          icon: '🔥', load: '6–9 kW',       watts: 9000,  mcb1P: 40, mcb3P: 16, pf: 1,   circuitType: 'socket-radial' },
];

const DISTANCES = [
  { id: 'short',  label: 'Short',  hint: '< 5 m from consumer unit',  metres: 4  },
  { id: 'medium', label: 'Medium', hint: '5–15 m from consumer unit', metres: 10 },
  { id: 'long',   label: 'Long',   hint: '> 15 m from consumer unit', metres: 20 },
];

const CABLE_RUNS = [
  { id: 'clipped',    label: 'Clipped to wall or ceiling',         detail: 'Surface-mounted, not enclosed',                           method: 'C' },
  { id: 'conduit',    label: 'In a conduit or trunking',           detail: 'Enclosed in plastic conduit or trunking',                 method: 'B' },
  { id: 'wall',       label: 'Buried in wall or plaster',          detail: 'Behind plasterboard or in render (non-insulated wall)',    method: 'B' },
  { id: 'insulated',  label: 'In an insulated wall or ceiling',    detail: 'Touching or enclosed by thermal insulation — Method A',   method: 'A' },
  { id: 'floor',      label: 'Under floor or in joist',            detail: 'In floor void or joist notch',                           method: 'B' },
];

function buildCalcInputs(appliance, distanceObj, cableRunObj, phase) {
  const mcb = phase === '3P' ? appliance.mcb3P : appliance.mcb1P;
  return {
    supply: phase,
    circuitType: appliance.circuitType,
    installationMethod: cableRunObj.method,
    ambientTemp: 30,
    grouping: 1,
    insulationFactor: 1,
    length: distanceObj.metres,
    conductor: 'Cu',
    insulation: 'PVC',
    deviceType: 'MCB',
    protectiveDeviceRating: mcb,
    loadInputMode: 'power',
    powerWatts: appliance.watts,
    powerFactor: appliance.pf,
    efficiency: 1,
    applianceBasket: [],
    basketText: '',
    faultCurrent: 3000,
    disconnectionTime: 0.4,
  };
}

export function SimpleCalculator() {
  const [selectedId, setSelectedId] = useState(null);
  const [distance, setDistance] = useState('medium');
  const [cableRun, setCableRun] = useState('clipped');
  const [phase, setPhase] = useState('1P');

  const appliance   = APPLIANCES.find(a => a.id === selectedId);
  const distanceObj = DISTANCES.find(d => d.id === distance);
  const cableRunObj = CABLE_RUNS.find(c => c.id === cableRun);

  const calcInputs = useMemo(() => {
    if (!appliance) return null;
    return buildCalcInputs(appliance, distanceObj, cableRunObj, phase);
  }, [appliance, distanceObj, cableRunObj, phase]);

  const results = useMemo(() => {
    if (!calcInputs || !appliance) return null;
    const ib = computeIb(calcInputs);
    const rawCable = selectCable(calcInputs, ib);

    let cable = rawCable;
    if (rawCable && appliance.minSize && rawCable.size < appliance.minSize) {
      cable = cableOptions.find(c => c.size >= appliance.minSize) || rawCable;
    }

    if (!cable) return { ib, cable: null, noMatch: true };

    const iz         = computeIz(cable, calcInputs);
    const vd         = computeVoltageDrop(cable, ib, calcInputs.length, calcInputs.supply);
    const vdLimit    = getVoltageDropLimit(calcInputs.circuitType, calcInputs.supply);
    const cf         = getCorrectionFactor(calcInputs);
    const mcb        = calcInputs.protectiveDeviceRating;
    const deviceChainPass = ib <= mcb && mcb <= iz;
    const vdPass     = vd <= vdLimit;

    const ca         = snapFactor(ambientTempFactors[calcInputs.insulation], calcInputs.ambientTemp);
    const cg         = snapFactor(groupingFactors, calcInputs.grouping);
    const ci         = calcInputs.insulationFactor;
    const cm         = installationMethodFactor[calcInputs.installationMethod];
    const tabulated  = cable.pvc;
    const mv         = calcInputs.supply === '3P' ? cable.mvA3 : cable.mvA;
    const nomV       = calcInputs.supply === '3P' ? 400 : 230;
    const requiredIt = mcb / cf;

    return {
      ib, cable, iz, vd, vdLimit, cf, mcb,
      deviceChainPass, vdPass,
      ca, cg, ci, cm, tabulated, mv, nomV, requiredIt,
    };
  }, [calcInputs, appliance]);

  const cableType = phase === '3P' ? '3-core + CPC' : 'twin & earth';

  return (
    <div className="simple-calc">

      {/* Step 1 — appliance selection */}
      <section className="panel simple-section">
        <h2 className="simple-step-heading">
          <span className="step-num">1</span>
          What are you wiring?
        </h2>
        <p className="simple-step-hint">Select the appliance or circuit you need to size a cable for.</p>
        <div className="appliance-grid">
          {APPLIANCES.map(a => (
            <button
              key={a.id}
              className={`appliance-card${selectedId === a.id ? ' selected' : ''}`}
              onClick={() => setSelectedId(a.id)}
              type="button"
              aria-pressed={selectedId === a.id}
            >
              <span className="appliance-icon" aria-hidden="true">{a.icon}</span>
              <span className="appliance-name">{a.name}</span>
              <span className="appliance-load">{a.load}</span>
            </button>
          ))}
        </div>
      </section>

      {appliance && (
        <>
          {/* Steps 2-4 — three questions */}
          <section className="panel simple-section">
            <div className="simple-questions">

              <div className="simple-question">
                <h3 className="simple-q-label">
                  <span className="step-num">2</span>
                  How far is the {appliance.name.toLowerCase()} from your consumer unit (fuse board)?
                </h3>
                <div className="option-row">
                  {DISTANCES.map(d => (
                    <button
                      key={d.id}
                      className={`option-btn${distance === d.id ? ' selected' : ''}`}
                      onClick={() => setDistance(d.id)}
                      type="button"
                    >
                      <span className="opt-label">{d.label}</span>
                      <span className="opt-hint">{d.hint}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="simple-question">
                <h3 className="simple-q-label">
                  <span className="step-num">3</span>
                  How will the cable be run?
                </h3>
                <div className="option-row">
                  {CABLE_RUNS.map(c => (
                    <button
                      key={c.id}
                      className={`option-btn${cableRun === c.id ? ' selected' : ''}`}
                      onClick={() => setCableRun(c.id)}
                      type="button"
                    >
                      <span className="opt-label">{c.label}</span>
                      <span className="opt-hint">{c.detail}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="simple-question">
                <h3 className="simple-q-label">
                  <span className="step-num">4</span>
                  What type of supply do you have?
                </h3>
                <div className="option-row">
                  <button
                    className={`option-btn${phase === '1P' ? ' selected' : ''}`}
                    onClick={() => setPhase('1P')}
                    type="button"
                  >
                    <span className="opt-label">Single phase</span>
                    <span className="opt-hint">Most UK homes</span>
                  </button>
                  <button
                    className={`option-btn${phase === '3P' ? ' selected' : ''}`}
                    onClick={() => setPhase('3P')}
                    type="button"
                  >
                    <span className="opt-label">Three phase</span>
                    <span className="opt-hint">Some larger properties</span>
                  </button>
                </div>
              </div>

            </div>
          </section>

          {/* Result */}
          {results && !results.noMatch && results.cable && (
            <section className="panel simple-result-section">
              <p className="result-eyebrow">Your result</p>
              <p className="result-headline">
                You need a{' '}
                <strong className="result-cable-size">{results.cable.size} mm²</strong>{' '}
                {cableType} cable, protected by a{' '}
                <strong>{results.mcb}A MCB</strong>.
              </p>

              {appliance.ringNote && (
                <div className="simple-note-box">
                  <strong>Ring main note:</strong> Standard domestic ring final circuits use 2.5 mm² cable wired as a continuous ring — each leg only carries approximately half the total current. This simplified tool models the circuit as a single radial cable and may suggest a larger size. Your electrician will design the ring final to BS 7671 Appendix 15.
                </div>
              )}

              <div className="result-checks">
                <span className={`simple-check ${results.deviceChainPass ? 'pass' : 'warn'}`}>
                  {results.deviceChainPass ? '✓' : '⚠'} Device chain {results.deviceChainPass ? 'OK' : '— check sizing'}
                </span>
                <span className={`simple-check ${results.vdPass ? 'pass' : 'warn'}`}>
                  {results.vdPass
                    ? `✓ Voltage drop OK (${results.vd.toFixed(1)} V)`
                    : `⚠ Voltage drop high (${results.vd.toFixed(1)} V) — consider larger cable`}
                </span>
              </div>

              <details className="working-detail">
                <summary>Show BS 7671 technical working</summary>
                <div className="working-body">
                  <p className="workings">
                    <strong>Design current (Ib):</strong> {results.ib.toFixed(2)} A<br />
                    <span className="workings-note">
                      P ÷ (V × PF) = {appliance.watts.toLocaleString()} W ÷ ({phase === '3P' ? '√3 × 400' : '230'} V × {appliance.pf}) = {results.ib.toFixed(2)} A
                    </span>
                  </p>
                  <p className="workings">
                    <strong>Correction factor (CF):</strong> {results.cf.toFixed(3)}<br />
                    <span className="workings-note">
                      Ca × Cg × Ci × Cm = {results.ca} × {results.cg} × {results.ci} × {results.cm}
                      &nbsp;(30°C ambient · 1 circuit · Method {calcInputs.installationMethod}{calcInputs.installationMethod === 'A' ? ' — thermally insulated wall/ceiling' : ''})
                    </span>
                  </p>
                  <p className="workings">
                    <strong>Required tabulated current (It):</strong> {results.requiredIt.toFixed(2)} A<br />
                    <span className="workings-note">In ÷ CF = {results.mcb} ÷ {results.cf.toFixed(3)}</span>
                  </p>
                  <p className="workings">
                    <strong>Selected cable:</strong> {results.cable.size} mm² Cu PVC — tabulated It = {results.tabulated} A<br />
                    <span className="workings-note">First cable in BS 7671 App. 4 with It ≥ {results.requiredIt.toFixed(2)} A and Iz ≥ Ib</span>
                  </p>
                  <p className="workings">
                    <strong>Corrected Iz:</strong> {results.iz.toFixed(2)} A<br />
                    <span className="workings-note">It × CF = {results.tabulated} × {results.cf.toFixed(3)}</span>
                  </p>
                  <p className="workings">
                    <strong>Device chain (BS 7671 Reg 433.1):</strong>{' '}
                    {results.ib.toFixed(2)} A (Ib) ≤ {results.mcb} A (In) ≤ {results.iz.toFixed(2)} A (Iz) —{' '}
                    <strong>{results.deviceChainPass ? 'Pass' : 'Review'}</strong>
                  </p>
                  <p className="workings">
                    <strong>Voltage drop:</strong> {results.vd.toFixed(2)} V vs {results.vdLimit.toFixed(2)} V limit<br />
                    <span className="workings-note">
                      mV/A/m × Ib × L ÷ 1000 = {results.mv} × {results.ib.toFixed(2)} × {distanceObj.metres} ÷ 1000 — BS 7671 App. 12 ({appliance.circuitType === 'lighting' ? '3' : '5'}% of {results.nomV} V)
                    </span>
                  </p>
                </div>
              </details>

              <p className="simple-disclaimer">
                This is a preliminary guide only. All electrical work must be installed and certified by a qualified electrician. Results assume 30°C ambient temperature and a single ungrouped circuit. If the cable passes through thermal insulation, select "In an insulated wall or ceiling" to apply the BS 7671 Method A derating.
              </p>
            </section>
          )}

          {results && results.noMatch && (
            <section className="panel simple-result-section">
              <p>No suitable cable was found in the standard range (up to 95 mm²) for these conditions. Please consult a qualified electrician.</p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
