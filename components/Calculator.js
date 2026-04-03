'use client';

import { useMemo, useState } from 'react';
import { defaultDisconnectionTimes, adiabaticK, ambientTempFactors, groupingFactors, installationMethodFactor } from '@/lib/cable-data';
import {
  computeAdiabaticS,
  computeIb,
  computeIz,
  computeVoltageDrop,
  getCorrectionFactor,
  getVoltageDropLimit,
  selectCable,
  snapFactor
} from '@/lib/calculations';

const defaultBasket = '1500, 1200';

// Cable types → maps to insulation temp class and suggested install method
const CABLE_TYPES = [
  { id: '6242Y',       label: '6242Y — Flat twin & earth, 70°C PVC',      insulation: 'PVC',  defaultMethod: 'C', table: '4D5'  },
  { id: '6243Y',       label: '6243Y — Flat 3-core + earth, 70°C PVC',    insulation: 'PVC',  defaultMethod: 'C', table: '4D5'  },
  { id: 'singles-pvc', label: 'Singles in conduit/trunking, 70°C PVC',    insulation: 'PVC',  defaultMethod: 'B', table: '4D1A' },
  { id: 'singles-xlpe',label: 'Singles in conduit/trunking, 90°C XLPE',   insulation: 'XLPE', defaultMethod: 'B', table: '4E1A' },
  { id: 'swa-pvc',     label: 'SWA armoured multicore, 70°C PVC',         insulation: 'PVC',  defaultMethod: 'C', table: '4D4A' },
  { id: 'swa-xlpe',    label: 'SWA armoured multicore, 90°C XLPE',        insulation: 'XLPE', defaultMethod: 'C', table: '4E4A' },
  { id: 'lszh',        label: 'LSZH / LSOH, 70°C (similar to PVC)',       insulation: 'PVC',  defaultMethod: 'C', table: '4D5'  },
];

const initialState = {
  supply: '1P',
  earthing: 'TN-C-S',
  circuitType: 'socket-radial',
  installationMethod: 'C',
  ambientTemp: 30,
  grouping: 1,
  insulationFactor: 1,
  length: 25,
  cableType: '6242Y',
  conductor: 'Cu',
  insulation: 'PVC',
  deviceType: 'MCB',
  protectiveDeviceRating: 32,
  loadInputMode: 'A',
  designCurrent: 24,
  powerWatts: 5000,
  powerFactor: 0.95,
  efficiency: 0.9,
  apparentPower: 6000,
  applianceBasket: [1500, 1200],
  basketText: defaultBasket,
  faultCurrent: 3000,
  disconnectionTime: defaultDisconnectionTimes['socket-radial']
};

function IbWorkings({ form, ib }) {
  const voltage = form.supply === '3P' ? 400 : 230;
  switch (form.loadInputMode) {
    case 'A':
      return <p className="workings">Ib entered directly: <strong>{ib.toFixed(2)} A</strong></p>;
    case 'power':
      return (
        <p className="workings">
          Ib = P ÷ (V × PF × η){form.supply === '3P' ? ' ÷ √3' : ''} = {form.powerWatts} ÷ ({voltage} × {form.powerFactor} × {form.efficiency}{form.supply === '3P' ? ' × 1.732' : ''}) = <strong>{ib.toFixed(2)} A</strong>
        </p>
      );
    case 'apparent':
      return (
        <p className="workings">
          Ib = S ÷ V{form.supply === '3P' ? ' ÷ √3' : ''} = {form.apparentPower} ÷ {form.supply === '3P' ? `(${voltage} × 1.732)` : voltage} = <strong>{ib.toFixed(2)} A</strong>
        </p>
      );
    case 'basket': {
      const total = form.applianceBasket.reduce((s, v) => s + v, 0);
      return (
        <p className="workings">
          Total load = {form.applianceBasket.join(' + ')} = {total} W &rarr; Ib = {total} ÷ {form.supply === '3P' ? `(${voltage} × 1.732)` : voltage} = <strong>{ib.toFixed(2)} A</strong>
        </p>
      );
    }
    default:
      return null;
  }
}

function IzWorkings({ form, selectedCable, iz }) {
  if (!selectedCable) return null;
  const tabulated = form.insulation === 'XLPE' ? selectedCable.xlpe : selectedCable.pvc;
  const ca = snapFactor(ambientTempFactors[form.insulation], form.ambientTemp);
  const cg = snapFactor(groupingFactors, form.grouping);
  const ci = form.insulationFactor;
  const cm = installationMethodFactor[form.installationMethod];
  const cf = getCorrectionFactor(form);
  return (
    <p className="workings">
      Iz = It × Ca × Cg × Ci × Cm = {tabulated} × {ca} × {cg} × {ci} × {cm} = <strong>{iz.toFixed(2)} A</strong>
      <br /><span className="workings-note">It = tabulated current ({form.insulation}) for {selectedCable.size} mm²; Ca = ambient temp factor at {form.ambientTemp}°C; Cg = grouping factor for {form.grouping} circuit(s); Ci = thermal insulation factor; Cm = installation method {form.installationMethod} factor</span>
    </p>
  );
}

function VdWorkings({ form, selectedCable, ib, voltageDrop, voltageDropLimit }) {
  if (!selectedCable) return null;
  const mv = form.supply === '3P' ? selectedCable.mvA3 : selectedCable.mvA;
  const nominalV = form.supply === '3P' ? 400 : 230;
  const pct = form.circuitType === 'lighting' ? 3 : 5;
  return (
    <p className="workings">
      Vd = (mV/A/m × Ib × L) ÷ 1000 = ({mv} × {ib.toFixed(2)} × {form.length}) ÷ 1000 = <strong>{voltageDrop.toFixed(2)} V</strong>
      <br />Limit = {pct}% × {nominalV} V = <strong>{voltageDropLimit.toFixed(2)} V</strong>
      <br /><span className="workings-note">mV/A/m from BS 7671 Appendix 4 for {selectedCable.size} mm² {form.conductor} ({form.supply === '3P' ? '3-phase' : 'single-phase'})</span>
    </p>
  );
}

function AdiabaticWorkings({ form, adiabaticRequired, selectedCable }) {
  const k = adiabaticK[form.conductor][form.insulation];
  return (
    <p className="workings">
      S = (I² × t)^0.5 ÷ k = ({form.faultCurrent}² × {form.disconnectionTime})^0.5 ÷ {k} = <strong>{adiabaticRequired.toFixed(2)} mm²</strong>
      <br /><span className="workings-note">k = {k} for {form.conductor}/{form.insulation} conductor (BS 7671 Appendix 3, Table 54.2–54.4). Selected cable: {selectedCable ? selectedCable.size : '—'} mm² — must be ≥ {adiabaticRequired.toFixed(2)} mm²</span>
    </p>
  );
}

export function Calculator() {
  const [form, setForm] = useState(initialState);
  const ib = useMemo(() => computeIb(form), [form]);
  const selectedCable = useMemo(() => selectCable(form, ib), [form, ib]);
  const iz = useMemo(() => (selectedCable ? computeIz(selectedCable, form) : 0), [selectedCable, form]);
  const voltageDrop = useMemo(
    () => (selectedCable ? computeVoltageDrop(selectedCable, ib, form.length, form.supply) : 0),
    [selectedCable, ib, form.length, form.supply]
  );
  const voltageDropLimit = useMemo(() => getVoltageDropLimit(form.circuitType, form.supply), [form.circuitType, form.supply]);
  const adiabaticRequired = useMemo(
    () => computeAdiabaticS(form.faultCurrent, form.disconnectionTime, form.conductor, form.insulation),
    [form.faultCurrent, form.disconnectionTime, form.conductor, form.insulation]
  );

  const updateField = (key, value) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === 'circuitType') next.disconnectionTime = defaultDisconnectionTimes[value];
      if (key === 'cableType') {
        const ct = CABLE_TYPES.find(t => t.id === value);
        if (ct) {
          next.insulation = ct.insulation;
          next.installationMethod = ct.defaultMethod;
        }
      }
      return next;
    });
  };

  const deviceChainPass = ib <= form.protectiveDeviceRating && form.protectiveDeviceRating <= iz;
  const voltageDropPass = voltageDrop <= voltageDropLimit;
  const adiabaticPass = selectedCable ? selectedCable.size >= adiabaticRequired : false;

  return (
    <>
      <section className="calculator-shell" id="calculator">
        <div className="panel form-panel">
          <h2>BS 7671 cable sizing calculator</h2>
          <p>Set the installation assumptions below to estimate a candidate cable size and review key design checks.</p>
          <div className="grid two-col">
            <label><span>Supply</span><select value={form.supply} onChange={(e) => updateField('supply', e.target.value)}><option value="1P">1φ</option><option value="3P">3φ</option></select></label>
            <label><span>Earthing</span><select value={form.earthing} onChange={(e) => updateField('earthing', e.target.value)}><option>TN-S</option><option>TN-C-S</option><option>TT</option></select></label>
            <label><span>Circuit type</span><select value={form.circuitType} onChange={(e) => updateField('circuitType', e.target.value)}><option value="lighting">Lighting</option><option value="socket-radial">Socket radial</option><option value="ring-final">Ring final</option><option value="motor">Motor</option><option value="submain">Submain</option></select></label>
            <label><span>Installation method</span><select value={form.installationMethod} onChange={(e) => updateField('installationMethod', e.target.value)}><option value="A">Method A</option><option value="B">Method B</option><option value="C">Method C</option><option value="100">Ref 100</option><option value="102">Ref 102</option><option value="103">Ref 103</option></select></label>
            <label><span>Ambient temp (°C)</span><input type="number" value={form.ambientTemp} onChange={(e) => updateField('ambientTemp', Number(e.target.value))} /></label>
            <label><span>Grouping</span><input type="number" min="1" max="6" value={form.grouping} onChange={(e) => updateField('grouping', Number(e.target.value))} /></label>
            <label><span>Insulation factor</span><input type="number" step="0.01" value={form.insulationFactor} onChange={(e) => updateField('insulationFactor', Number(e.target.value))} /></label>
            <label><span>Length (m)</span><input type="number" value={form.length} onChange={(e) => updateField('length', Number(e.target.value))} /></label>
            <label className="full"><span>Cable type</span><select value={form.cableType} onChange={(e) => updateField('cableType', e.target.value)}>{CABLE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}</select></label>
            <label><span>Conductor</span><select value={form.conductor} onChange={(e) => updateField('conductor', e.target.value)}><option>Cu</option><option>Al</option></select></label>
            <label><span>Insulation class</span><select value={form.insulation} onChange={(e) => updateField('insulation', e.target.value)}><option>PVC</option><option>XLPE</option></select></label>
            <label><span>Device type</span><select value={form.deviceType} onChange={(e) => updateField('deviceType', e.target.value)}><option>MCB</option><option>RCBO</option><option>Fuse</option></select></label>
            <label><span>In (A)</span><input type="number" value={form.protectiveDeviceRating} onChange={(e) => updateField('protectiveDeviceRating', Number(e.target.value))} /></label>
            <label><span>Load input mode</span><select value={form.loadInputMode} onChange={(e) => updateField('loadInputMode', e.target.value)}><option value="A">Design current (A)</option><option value="power">W / kW with PF + η</option><option value="apparent">VA / kVA</option><option value="basket">Appliance basket</option></select></label>
            {form.loadInputMode === 'A' && <label><span>Ib input (A)</span><input type="number" value={form.designCurrent} onChange={(e) => updateField('designCurrent', Number(e.target.value))} /></label>}
            {form.loadInputMode === 'power' && <><label><span>Power (W)</span><input type="number" value={form.powerWatts} onChange={(e) => updateField('powerWatts', Number(e.target.value))} /></label><label><span>Power factor</span><input type="number" step="0.01" value={form.powerFactor} onChange={(e) => updateField('powerFactor', Number(e.target.value))} /></label><label><span>Efficiency</span><input type="number" step="0.01" value={form.efficiency} onChange={(e) => updateField('efficiency', Number(e.target.value))} /></label></>}
            {form.loadInputMode === 'apparent' && <label><span>Apparent power (VA)</span><input type="number" value={form.apparentPower} onChange={(e) => updateField('apparentPower', Number(e.target.value))} /></label>}
            {form.loadInputMode === 'basket' && <label className="full"><span>Appliance basket (W, comma-separated)</span><textarea value={form.basketText} onChange={(e) => {
              const basketText = e.target.value;
              updateField('basketText', basketText);
              updateField('applianceBasket', basketText.split(',').map((item) => Number(item.trim())).filter((item) => !Number.isNaN(item) && item > 0));
            }} /></label>}
            <label><span>Fault current (A)</span><input type="number" value={form.faultCurrent} onChange={(e) => updateField('faultCurrent', Number(e.target.value))} /></label>
            <label><span>Disconnection time (s)</span><input type="number" step="0.01" value={form.disconnectionTime} onChange={(e) => updateField('disconnectionTime', Number(e.target.value))} /></label>
          </div>
        </div>

        <div className="panel result-panel">
          <h2>Design results</h2>
          <div className="result-grid">
            <div className="metric-card">
              <strong>Ib — Design current</strong>
              <span>{ib.toFixed(2)} A</span>
              <IbWorkings form={form} ib={ib} />
            </div>
            <div className="metric-card">
              <strong>Selected cable</strong>
              <span>{selectedCable ? `${selectedCable.size} mm² ${form.conductor} ${form.insulation}` : 'No match'}</span>
              {selectedCable && <p className="workings">{CABLE_TYPES.find(t => t.id === form.cableType)?.label} — First size where tabulated current ÷ correction factor ≥ In ({form.protectiveDeviceRating} A)</p>}
            </div>
            <div className="metric-card">
              <strong>Corrected Iz</strong>
              <span>{iz.toFixed(2)} A</span>
              <IzWorkings form={form} selectedCable={selectedCable} iz={iz} />
            </div>
            <div className="metric-card">
              <strong>Voltage drop</strong>
              <span>{voltageDrop.toFixed(2)} V / {voltageDropLimit.toFixed(2)} V limit</span>
              <VdWorkings form={form} selectedCable={selectedCable} ib={ib} voltageDrop={voltageDrop} voltageDropLimit={voltageDropLimit} />
            </div>
            <div className={`check-card ${deviceChainPass ? 'pass' : 'fail'}`}>
              <strong>Ib ≤ In ≤ Iz</strong>
              <span>{deviceChainPass ? 'Pass' : 'Review sizing'}</span>
              <p className="workings">{ib.toFixed(2)} ≤ {form.protectiveDeviceRating} ≤ {iz.toFixed(2)} — BS 7671 Regulation 433.1</p>
            </div>
            <div className={`check-card ${voltageDropPass ? 'pass' : 'fail'}`}>
              <strong>Voltage drop</strong>
              <span>{voltageDropPass ? 'Pass' : 'Above default limit'}</span>
              <p className="workings">{voltageDrop.toFixed(2)} V vs {voltageDropLimit.toFixed(2)} V limit — BS 7671 Appendix 12</p>
            </div>
            <div className={`check-card ${adiabaticPass ? 'pass' : 'fail'}`}>
              <strong>Adiabatic (CPC size)</strong>
              <span>{adiabaticPass ? `Pass — S ≥ ${adiabaticRequired.toFixed(2)} mm²` : `Needs ≥ ${adiabaticRequired.toFixed(2)} mm²`}</span>
              <AdiabaticWorkings form={form} adiabaticRequired={adiabaticRequired} selectedCable={selectedCable} />
            </div>
            <div className="check-card placeholder">
              <strong>Zs / disconnection</strong>
              <span>Not yet implemented</span>
              <p className="workings">Automated Zs verification requires tabulated maximum Zs values for {form.deviceType} devices on {form.earthing} systems (BS 7671 Tables 41.2–41.4). Verify manually against the appropriate table for your protective device.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel assumptions-panel" id="assumptions">
        <h2>Assumptions and limitations</h2>
        <div className="assumptions-grid">
          <div className="assumption-block">
            <h3>What this tool calculates</h3>
            <ul>
              <li>Design current (Ib) from your chosen load input method</li>
              <li>Corrected current-carrying capacity (Iz) using BS 7671 Appendix 4 correction factors</li>
              <li>Voltage drop against default BS 7671 Appendix 12 limits (3% lighting, 5% other)</li>
              <li>Minimum CPC size using the adiabatic equation (BS 7671 Regulation 543.1.3)</li>
            </ul>
          </div>
          <div className="assumption-block">
            <h3>Known limitations</h3>
            <ul>
              <li><strong>Zs / disconnection time check not implemented.</strong> You must verify maximum earth fault loop impedance manually against BS 7671 Tables 41.2–41.4 for your protective device type and rating.</li>
              <li><strong>Cable data covers 1.5–95 mm² only.</strong> Sizes above 95 mm² are not included in the current table.</li>
              <li><strong>Single correction factor per cable run.</strong> The tool applies one set of conditions throughout — it does not model cables that pass through different environments (e.g. partly clipped, partly in insulation).</li>
              <li><strong>No diversity or harmonics.</strong> Motor starting currents, harmonic loading and demand diversity are not modelled.</li>
              <li><strong>Voltage drop uses resistive mV/A/m values only.</strong> Reactive component is not included — results may be optimistic for longer runs or larger cables.</li>
            </ul>
          </div>
          <div className="assumption-block">
            <h3>Data sources</h3>
            <ul>
              <li>Current ratings: BS 7671:2018+A2:2022 Appendix 4, Tables 4D1A–4E4A (simplified)</li>
              <li>Correction factors: BS 7671 Tables 4B1, 4B2, 4C1</li>
              <li>Voltage drop (mV/A/m): BS 7671 Appendix 4 (resistive component)</li>
              <li>Adiabatic k values: BS 7671 Tables 54.2–54.4</li>
            </ul>
          </div>
          <div className="assumption-block warning-block">
            <h3>⚠️ Important notice</h3>
            <p>This tool is a preliminary design aid only. Results must be verified by a qualified electrician against the current edition of BS 7671, manufacturer data, and the specific conditions of your installation before any work is carried out or certified. Do not use this tool as the sole basis for any electrical design or certification.</p>
          </div>
        </div>
      </section>
    </>
  );
}
