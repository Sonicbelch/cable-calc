export const cableOptions = [
  { size: 1.5, pvc: 19.5, xlpe: 22, mvA: 29, mvA3: 25 },
  { size: 2.5, pvc: 27, xlpe: 30, mvA: 18, mvA3: 15 },
  { size: 4, pvc: 36, xlpe: 40, mvA: 11, mvA3: 9.5 },
  { size: 6, pvc: 46, xlpe: 52, mvA: 7.3, mvA3: 6.3 },
  { size: 10, pvc: 63, xlpe: 70, mvA: 4.4, mvA3: 3.8 },
  { size: 16, pvc: 85, xlpe: 94, mvA: 2.8, mvA3: 2.4 },
  { size: 25, pvc: 114, xlpe: 125, mvA: 1.75, mvA3: 1.5 },
  { size: 35, pvc: 141, xlpe: 156, mvA: 1.25, mvA3: 1.1 },
  { size: 50, pvc: 176, xlpe: 195, mvA: 0.93, mvA3: 0.8 },
  { size: 70, pvc: 218, xlpe: 242, mvA: 0.67, mvA3: 0.58 },
  { size: 95, pvc: 263, xlpe: 291, mvA: 0.5, mvA3: 0.43 }
];

export const installationMethodFactor = {
  A: 0.89,
  B: 0.94,
  C: 1,
  100: 0.97,
  102: 1,
  103: 1.03
};

export const ambientTempFactors = {
  PVC: { 20: 1.08, 25: 1.03, 30: 1, 35: 0.94, 40: 0.87, 45: 0.79, 50: 0.71 },
  XLPE: { 20: 1.15, 25: 1.12, 30: 1.08, 35: 1.04, 40: 1, 45: 0.96, 50: 0.91, 55: 0.87 }
};

export const groupingFactors = { 1: 1, 2: 0.8, 3: 0.7, 4: 0.65, 5: 0.6, 6: 0.57 };

export const adiabaticK = {
  Cu: { PVC: 115, XLPE: 143 },
  Al: { PVC: 76, XLPE: 94 }
};

export const defaultDisconnectionTimes = {
  lighting: 0.4,
  'socket-radial': 0.4,
  'ring-final': 0.4,
  motor: 5,
  submain: 5
};
