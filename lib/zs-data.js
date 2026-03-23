/**
 * Maximum earth fault loop impedance (Zs) values for common protective devices.
 * Source: BS 7671:2018+A2:2022
 *   - MCB Type B: Table 41.3 (0.4 s disconnection, 230 V)
 *   - MCB Type C: Table 41.4 (0.4 s disconnection, 230 V)
 *   - MCB Type D: Table 41.4 (0.4 s disconnection, 230 V)
 *   - BS 88-2/88-3 fuses: Table 41.2
 *   - BS 3036 fuses: Table 41.2
 *
 * Values are in ohms at 0.4 s disconnection for 230 V circuits (socket outlets, 
 * lighting circuits ≤32A, other circuits ≤32A where 0.4 s applies).
 * For circuits >32A or fixed equipment use 5 s disconnection times per Table 41.1.
 *
 * NOTE: These values apply at the conductor operating temperature.
 * For cold conductors multiply by 0.8 (approximate) or use BS 7671 method.
 *
 * LIMITATION: Only 0.4 s TN system values are tabulated here.
 * TT systems require RCD protection — Zs check alone is insufficient.
 * Always verify against the current edition of BS 7671.
 */

export const zsTable = {
  'MCB-B': {
    label: 'MCB Type B (BS EN 60898)',
    source: 'BS 7671 Table 41.3',
    note: '0.4 s disconnection, 230 V TN system',
    ratings: {
      6:   14.38,
      10:   8.63,
      16:   5.39,
      20:   4.32,
      25:   3.45,
      32:   2.70,
      40:   2.16,
      50:   1.73,
      63:   1.37,
      80:   1.08,
      100:  0.86,
      125:  0.69,
    }
  },
  'MCB-C': {
    label: 'MCB Type C (BS EN 60898)',
    source: 'BS 7671 Table 41.4',
    note: '0.4 s disconnection, 230 V TN system',
    ratings: {
      6:   7.19,
      10:   4.32,
      16:   2.70,
      20:   2.16,
      25:   1.73,
      32:   1.35,
      40:   1.08,
      50:   0.86,
      63:   0.68,
      80:   0.54,
      100:  0.43,
      125:  0.34,
    }
  },
  'MCB-D': {
    label: 'MCB Type D (BS EN 60898)',
    source: 'BS 7671 Table 41.4',
    note: '0.4 s disconnection, 230 V TN system',
    ratings: {
      6:   3.59,
      10:   2.16,
      16:   1.35,
      20:   1.08,
      25:   0.86,
      32:   0.67,
      40:   0.54,
      50:   0.43,
      63:   0.34,
    }
  },
  'BS88-2': {
    label: 'BS 88-2 / BS 88-3 fuse (industrial)',
    source: 'BS 7671 Table 41.2',
    note: '0.4 s disconnection, 230 V TN system',
    ratings: {
      16:   2.87,
      20:   1.78,
      25:   1.37,
      32:   1.07,
      40:   0.75,
      50:   0.57,
      63:   0.43,
      80:   0.29,
      100:  0.22,
      125:  0.17,
      160:  0.12,
    }
  },
  'BS3036': {
    label: 'BS 3036 semi-enclosed fuse (rewirable)',
    source: 'BS 7671 Table 41.2',
    note: '0.4 s disconnection, 230 V TN system. These fuses require cable rated at In × 1.45/0.725 = 2× — verify cable rating separately.',
    ratings: {
      5:   9.17,
      10:   4.61,
      15:   2.87,
      20:   1.84,
      30:   1.09,
      45:   0.60,
      60:   0.40,
    }
  }
};

export const deviceTypes = Object.entries(zsTable).map(([key, val]) => ({
  key,
  label: val.label
}));

export function getMaxZs(deviceKey, rating) {
  const device = zsTable[deviceKey];
  if (!device) return null;
  const ratings = device.ratings;
  // exact match first
  if (ratings[rating] !== undefined) return ratings[rating];
  // interpolate between nearest lower/upper
  const keys = Object.keys(ratings).map(Number).sort((a, b) => a - b);
  const lower = keys.filter(k => k <= rating).pop();
  const upper = keys.filter(k => k >= rating).shift();
  if (lower === undefined || upper === undefined) return null;
  if (lower === upper) return ratings[lower];
  // linear interpolation
  const t = (rating - lower) / (upper - lower);
  return ratings[lower] + t * (ratings[upper] - ratings[lower]);
}
