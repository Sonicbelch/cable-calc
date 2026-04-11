import {
  adiabaticK,
  ambientTempFactors,
  cableOptions,
  groupingFactors,
  installationMethodFactor
} from './cable-data.js';

export function snapFactor(table, target) {
  const keys = Object.keys(table).map(Number).sort((a, b) => a - b);
  const nearest = keys.reduce((best, key) => (Math.abs(key - target) < Math.abs(best - target) ? key : best));
  return table[nearest];
}

export function computeIb(inputs) {
  switch (inputs.loadInputMode) {
    case 'A':
      return inputs.designCurrent;
    case 'power':
      return inputs.supply === '3P'
        ? inputs.powerWatts / (Math.sqrt(3) * 400 * (inputs.powerFactor || 1) * (inputs.efficiency || 1))
        : inputs.powerWatts / (230 * (inputs.powerFactor || 1) * (inputs.efficiency || 1));
    case 'apparent':
      return inputs.supply === '3P' ? inputs.apparentPower / (Math.sqrt(3) * 400) : inputs.apparentPower / 230;
    case 'basket': {
      const totalWatts = inputs.applianceBasket.reduce((sum, item) => sum + item, 0);
      return inputs.supply === '3P' ? totalWatts / (Math.sqrt(3) * 400) : totalWatts / 230;
    }
    default:
      return 0;
  }
}

export function getTabulatedCurrent(option, insulation) {
  return insulation === 'XLPE' ? option.xlpe : option.pvc;
}

export function getCorrectionFactor(inputs) {
  const ca = snapFactor(ambientTempFactors[inputs.insulation], inputs.ambientTemp);
  const cg = snapFactor(groupingFactors, inputs.grouping);
  return ca * cg * inputs.insulationFactor * installationMethodFactor[inputs.installationMethod];
}

export function computeIz(option, inputs) {
  return getTabulatedCurrent(option, inputs.insulation) * getCorrectionFactor(inputs);
}

export function selectCable(inputs, ib) {
  const requiredTabulated = inputs.protectiveDeviceRating / Math.max(getCorrectionFactor(inputs), 0.01);
  return (
    cableOptions.find(
      (option) => getTabulatedCurrent(option, inputs.insulation) >= requiredTabulated && computeIz(option, inputs) >= ib
    ) || null
  );
}

export function computeVoltageDrop(option, ib, length, supply, conductor = 'Cu') {
  let mv;
  if (conductor === 'Al') {
    mv = supply === '3P' ? option.mvA3_Al : option.mvA_Al;
  } else {
    mv = supply === '3P' ? option.mvA3 : option.mvA;
  }
  return (mv * ib * length) / 1000;
}

export function getVoltageDropLimit(circuitType, supply) {
  const nominalVoltage = supply === '3P' ? 400 : 230;
  return nominalVoltage * (circuitType === 'lighting' ? 0.03 : 0.05);
}

export function computeAdiabaticS(faultCurrent, time, conductor, insulation) {
  return (faultCurrent * Math.sqrt(time)) / adiabaticK[conductor][insulation];
}
