'use client';

import { useMemo, useState } from 'react';
import { defaultDisconnectionTimes } from '@/lib/cable-data';
import {
  computeAdiabaticS,
  computeIb,
  computeIz,
  computeVoltageDrop,
  getVoltageDropLimit,
  selectCable
} from '@/lib/calculations';

const defaultBasket = '1500, 1200';

const initialState = {
  supply: '1P',
  earthing: 'TN-C-S',
  circuitType: 'socket-radial',
  installationMethod: 'C',
  ambientTemp: 30,
  grouping: 1,
  insulationFactor: 1,
  length: 25,
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
      return next;
    });
  };

  const deviceChainPass = ib <= form.protectiveDeviceRating && form.protectiveDeviceRating <= iz;
  const voltageDropPass = voltageDrop <= voltageDropLimit;
  const adiabaticPass = selectedCable ? selectedCable.size >= adiabaticRequired : false;

  return (
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
          <label><span>Conductor</span><select value={form.conductor} onChange={(e) => updateField('conductor', e.target.value)}><option>Cu</option><option>Al</option></select></label>
          <label><span>Insulation</span><select value={form.insulation} onChange={(e) => updateField('insulation', e.target.value)}><option>PVC</option><option>XLPE</option></select></label>
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
          <div className="metric-card"><strong>Ib</strong><span>{ib.toFixed(2)} A</span></div>
          <div className="metric-card"><strong>Selected cable</strong><span>{selectedCable ? `${selectedCable.size} mm² ${form.conductor}` : 'No match'}</span></div>
          <div className="metric-card"><strong>Corrected Iz</strong><span>{iz.toFixed(2)} A</span></div>
          <div className="metric-card"><strong>Voltage drop</strong><span>{voltageDrop.toFixed(2)} V / {voltageDropLimit.toFixed(2)} V limit</span></div>
          <div className={`check-card ${deviceChainPass ? 'pass' : 'fail'}`}><strong>Ib ≤ In ≤ Iz</strong><span>{deviceChainPass ? 'Pass' : 'Review sizing'}</span></div>
          <div className={`check-card ${voltageDropPass ? 'pass' : 'fail'}`}><strong>Voltage drop</strong><span>{voltageDropPass ? 'Pass' : 'Above default limit'}</span></div>
          <div className={`check-card ${adiabaticPass ? 'pass' : 'fail'}`}><strong>Adiabatic</strong><span>{adiabaticPass ? `S ≥ ${adiabaticRequired.toFixed(2)} mm²` : `Needs ${adiabaticRequired.toFixed(2)} mm²`}</span></div>
          <div className="check-card placeholder"><strong>Zs / disconnection</strong><span>Placeholder until tabulated Zs data is added for {form.deviceType} on {form.earthing} systems.</span></div>
        </div>
      </div>
    </section>
  );
}
