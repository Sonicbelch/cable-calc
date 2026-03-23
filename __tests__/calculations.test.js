import test from 'node:test';
import assert from 'node:assert/strict';
import { cableOptions } from '../lib/cable-data.js';
import {
  computeAdiabaticS,
  computeIb,
  computeIz,
  computeVoltageDrop,
  getCorrectionFactor,
  getVoltageDropLimit,
  selectCable
} from '../lib/calculations.js';

const baseInputs = {
  supply: '1P',
  circuitType: 'socket-radial',
  installationMethod: 'C',
  ambientTemp: 30,
  grouping: 1,
  insulationFactor: 1,
  length: 20,
  conductor: 'Cu',
  insulation: 'PVC',
  protectiveDeviceRating: 32,
  loadInputMode: 'A',
  designCurrent: 24,
  powerWatts: 5000,
  powerFactor: 0.95,
  efficiency: 0.9,
  apparentPower: 6000,
  applianceBasket: [1500, 1200],
  faultCurrent: 3000,
  disconnectionTime: 0.4
};

test('computes Ib from watts with PF and efficiency', () => {
  const ib = computeIb({ ...baseInputs, loadInputMode: 'power', powerWatts: 4600, powerFactor: 0.92, efficiency: 0.9 });
  assert.ok(Math.abs(ib - 24.16) < 0.05);
});

test('applies correction factors to Iz', () => {
  const factor = getCorrectionFactor({ ...baseInputs, ambientTemp: 40, grouping: 3, insulationFactor: 0.9 });
  assert.ok(Math.abs(factor - 0.5481) < 0.0002);
  const iz = computeIz(cableOptions[4], { ...baseInputs, ambientTemp: 40, grouping: 3, insulationFactor: 0.9 });
  assert.ok(Math.abs(iz - 34.53) < 0.05);
});

test('selects a compliant cable for a 32A radial', () => {
  const cable = selectCable(baseInputs, computeIb(baseInputs));
  assert.equal(cable?.size, 4);
});

test('computes voltage drop and limits', () => {
  const vDrop = computeVoltageDrop(cableOptions[3], 24, 20, '1P');
  assert.ok(Math.abs(vDrop - 3.504) < 0.001);
  assert.ok(Math.abs(getVoltageDropLimit('lighting', '1P') - 6.9) < 0.05);
  assert.equal(getVoltageDropLimit('submain', '3P'), 20);
});

test('computes adiabatic conductor size', () => {
  assert.ok(Math.abs(computeAdiabaticS(3000, 0.4, 'Cu', 'PVC') - 16.49) < 0.05);
});
