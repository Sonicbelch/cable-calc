'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { SiteNav } from '../../components/SiteNav';

// ─── Appliance class detection ────────────────────────────────────────────────

const applianceClassMap = {
  'angle grinder': 'II',
  'charger': 'II',
  'circular saw': 'II',
  'computer': 'II',
  'convector heater': 'I',
  'cooker': 'I',
  'desk lamp': 'I',
  'dishwasher': 'I',
  'drill': 'II',
  'electric fire': 'I',
  'electric heater': 'I',
  'extractor fan': 'I',
  'fan': 'II',
  'fan heater': 'I',
  'floor lamp': 'I',
  'freezer': 'I',
  'fridge': 'I',
  'hair dryer': 'II',
  'hairdryer': 'II',
  'hob': 'I',
  'hoover': 'II',
  'iron': 'I',
  'jigsaw': 'II',
  'kettle': 'I',
  'laptop': 'II',
  'microwave': 'I',
  'monitor': 'II',
  'oven': 'I',
  'phone charger': 'II',
  'power drill': 'II',
  'printer': 'II',
  'radio': 'II',
  'refrigerator': 'I',
  'sander': 'II',
  'scanner': 'II',
  'shredder': 'II',
  'table fan': 'II',
  'television': 'II',
  'toaster': 'I',
  'tumble dryer': 'I',
  'tv': 'II',
  'vacuum cleaner': 'II',
  'washing machine': 'I',
};

const APPLIANCE_LIST = [
  'Angle Grinder', 'Charger', 'Circular Saw', 'Computer', 'Convector Heater',
  'Cooker', 'Desk Lamp', 'Dishwasher', 'Drill', 'Electric Fire', 'Electric Heater',
  'Extractor Fan', 'Fan', 'Fan Heater', 'Floor Lamp', 'Freezer', 'Fridge',
  'Hair Dryer', 'Hob', 'Hoover', 'Iron', 'Jigsaw', 'Kettle', 'Laptop',
  'Microwave', 'Monitor', 'Oven', 'Phone Charger', 'Power Drill', 'Printer',
  'Radio', 'Refrigerator', 'Sander', 'Scanner', 'Shredder', 'Table Fan',
  'Television', 'Toaster', 'Tumble Dryer', 'TV', 'Vacuum Cleaner',
  'Washing Machine',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateCertNo() {
  const now = new Date();
  const p = n => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}`;
  const time = `${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
  return `EOCPAT-${date}-${time}`;
}

function toDateString(d) {
  return d.toISOString().slice(0, 10);
}

function todayStr() {
  return toDateString(new Date());
}

function threeYearsStr() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 3);
  return toDateString(d);
}

function detectClass(name) {
  return applianceClassMap[name.toLowerCase().trim()] || 'I';
}

function computeResult(row) {
  if (row.visual === 'FAIL') return 'FAIL';
  if (row.classType === 'I') {
    const e = parseFloat(row.earthContinuity);
    if (isNaN(e)) return '—';
    if (e > 1.0) return 'FAIL';
  }
  const ins = parseFloat(row.insulation);
  if (isNaN(ins)) return '—';
  const insMin = row.classType === 'II' ? 2.0 : 1.0;
  if (ins < insMin) return 'FAIL';
  if (row.polarity === 'FAIL') return 'FAIL';
  return 'PASS';
}

// ─── Row factory ─────────────────────────────────────────────────────────────

let _nextId = 4;
function nextId() { return _nextId++; }

const DEFAULT_ROWS = [
  { id: 1, assetId: 'A001', appliance: 'Fridge',          location: 'Kitchen',    classType: 'I',  visual: 'PASS', earthContinuity: '0.10', insulation: '2.00', polarity: 'PASS' },
  { id: 2, assetId: 'A002', appliance: 'Washing Machine', location: 'Kitchen',    classType: 'I',  visual: 'PASS', earthContinuity: '0.08', insulation: '2.00', polarity: 'PASS' },
  { id: 3, assetId: 'A003', appliance: 'Vacuum Cleaner',  location: 'Store Room', classType: 'II', visual: 'PASS', earthContinuity: 'N/A',  insulation: '5.00', polarity: 'N/A'  },
];

function makeRow() {
  return { id: nextId(), assetId: '', appliance: '', location: '', classType: 'I', visual: 'PASS', earthContinuity: '', insulation: '', polarity: 'PASS' };
}

// ─── Print styles ─────────────────────────────────────────────────────────────

const PRINT_CSS = `
@media print {
  .site-nav, .no-print { display: none !important; }
  body { background: white !important; }
  .page { padding: 0 !important; max-width: none !important; }
  .panel { box-shadow: none !important; margin-bottom: 12px !important; border-radius: 8px !important; }
  .pat-print-header { display: flex !important; }
  .pat-table { font-size: 8.5pt !important; }
  .pat-table th { padding: 5px 6px !important; }
  .pat-table td { padding: 3px 6px !important; }
  .pat-table input, .pat-table select {
    border: none !important;
    background: transparent !important;
    padding: 0 !important;
    font-size: inherit !important;
    width: auto !important;
    -webkit-appearance: none !important;
    appearance: none !important;
    outline: none !important;
  }
  .delete-btn { display: none !important; }
  .pat-row-pass { background: #d4edda !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .pat-row-fail { background: #f8d7da !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .pat-row-pending { background: white !important; }
  .pat-thead { background: #185adb !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @page { size: A4 landscape; margin: 12mm; }
}
`;

// ─── Component ────────────────────────────────────────────────────────────────

export function PATCertClient() {
  const [details, setDetails] = useState({
    clientName: '',
    siteAddress: '',
    postcode: '',
    certNo: '',
    inspectionDate: '',
    nextInspectionDate: '',
    engineerName: '',
    companyName: 'Electricians On Call',
  });

  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  // Initialise cert no, dates, and saved locations on mount
  useEffect(() => {
    setDetails(d => ({
      ...d,
      certNo: generateCertNo(),
      inspectionDate: todayStr(),
      nextInspectionDate: threeYearsStr(),
    }));
    try {
      const saved = localStorage.getItem('patCertLocations');
      if (saved) setLocationSuggestions(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Persist location suggestions to localStorage
  useEffect(() => {
    if (locationSuggestions.length === 0) return;
    try {
      localStorage.setItem('patCertLocations', JSON.stringify(locationSuggestions));
    } catch { /* ignore */ }
  }, [locationSuggestions]);

  const updateDetail = useCallback((field, value) => {
    setDetails(d => ({ ...d, [field]: value }));
  }, []);

  const updateRow = useCallback((id, field, value) => {
    setRows(rows => rows.map(row => {
      if (row.id !== id) return row;
      const updated = { ...row, [field]: value };

      // Auto-detect class when appliance name changes
      if (field === 'appliance') {
        const cls = detectClass(value);
        updated.classType = cls;
        if (cls === 'II') {
          updated.earthContinuity = 'N/A';
          updated.polarity = 'N/A';
        } else {
          if (updated.earthContinuity === 'N/A') updated.earthContinuity = '';
          if (updated.polarity === 'N/A') updated.polarity = 'PASS';
        }
      }

      // Handle manual class change
      if (field === 'classType') {
        if (value === 'II') {
          updated.earthContinuity = 'N/A';
          updated.polarity = 'N/A';
        } else {
          if (updated.earthContinuity === 'N/A') updated.earthContinuity = '';
          if (updated.polarity === 'N/A') updated.polarity = 'PASS';
        }
      }

      // Track unique locations for suggestions
      if (field === 'location' && value.trim()) {
        setLocationSuggestions(prev =>
          prev.includes(value.trim()) ? prev : [...prev, value.trim()]
        );
      }

      return updated;
    }));
  }, []);

  const addRow = useCallback(() => {
    setRows(rows => [...rows, makeRow()]);
  }, []);

  const deleteRow = useCallback((id) => {
    setRows(rows => rows.filter(r => r.id !== id));
  }, []);

  const totals = useMemo(() => {
    const results = rows.map(computeResult);
    const pass = results.filter(r => r === 'PASS').length;
    const fail = results.filter(r => r === 'FAIL').length;
    const total = rows.length;
    const passRate = total > 0 ? Math.round((pass / total) * 100) : 0;
    return { pass, fail, total, passRate };
  }, [rows]);

  return (
    <main className="page">
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <SiteNav current="/pat-cert" />

      {/* Print-only certificate header */}
      <div className="pat-print-header" style={{
        display: 'none',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '16px',
        paddingBottom: '14px',
        borderBottom: '3px solid #185adb',
      }}>
        <img src="/eoc-BOW-logo.png" alt="Electricians On Call" style={{ height: '48px', width: 'auto' }} />
        <div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#142033', lineHeight: 1.1 }}>
            PAT Test Certificate
          </div>
          <div style={{ fontSize: '0.85rem', color: '#57657d', marginTop: '2px' }}>
            Portable Appliance Testing Record
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: '0.8rem', color: '#57657d' }}>
          <div><strong>Cert no.:</strong> {details.certNo}</div>
          <div><strong>Inspection:</strong> {details.inspectionDate}</div>
          <div><strong>Next due:</strong> {details.nextInspectionDate}</div>
        </div>
      </div>

      {/* Screen hero */}
      <section className="hero hero-slim no-print" style={{ marginBottom: '28px' }}>
        <div>
          <p className="eyebrow">PAT Certificate Generator</p>
          <h1>Portable Appliance Test Certificate</h1>
          <p className="lead">
            Complete the installation details and test results below, then print a clean A4 PAT certificate.
          </p>
        </div>
      </section>

      {/* ── Part 1: Installation Details ─────────────────────────────────────── */}
      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '1.05rem', color: 'var(--text)' }}>
          Part 1 — Installation Details
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Client name',          field: 'clientName',          type: 'text', placeholder: 'e.g. Acme Ltd' },
            { label: 'Site address',         field: 'siteAddress',         type: 'text', placeholder: 'e.g. 12 High Street, London' },
            { label: 'Postcode',             field: 'postcode',            type: 'text', placeholder: 'e.g. SW1A 1AA' },
            { label: 'Certificate no.',      field: 'certNo',              type: 'text', placeholder: '' },
            { label: 'Inspection date',      field: 'inspectionDate',      type: 'date', placeholder: '' },
            { label: 'Next inspection date', field: 'nextInspectionDate',  type: 'date', placeholder: '' },
            { label: 'Engineer name',        field: 'engineerName',        type: 'text', placeholder: 'e.g. John Smith' },
            { label: 'Company name',         field: 'companyName',         type: 'text', placeholder: '' },
          ].map(({ label, field, type, placeholder }) => (
            <label key={field} style={{ display: 'grid', gap: '6px', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>
              {label}
              <input
                type={type}
                value={details[field]}
                onChange={e => updateDetail(field, e.target.value)}
                placeholder={placeholder}
                style={{ fontWeight: 400 }}
              />
            </label>
          ))}
        </div>
      </section>

      {/* ── Part 2: Test Results ──────────────────────────────────────────────── */}
      <section className="panel" style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: '1.05rem', color: 'var(--text)' }}>
          Part 2 — Test Results
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table className="pat-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem', minWidth: '860px' }}>
            <thead className="pat-thead">
              <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                {['No.', 'Asset ID', 'Appliance', 'Location', 'Class', 'Visual', 'Earth (Ω)', 'Insulation (MΩ)', 'Polarity', 'Result', ''].map((h, i) => (
                  <th key={i} style={{
                    padding: '10px 8px',
                    textAlign: i === 0 || i === 10 ? 'center' : 'left',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap',
                    letterSpacing: '0.02em',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const result = computeResult(row);
                const isII = row.classType === 'II';
                const rowBg = result === 'PASS' ? '#f0fff4' : result === 'FAIL' ? '#fff5f5' : '#fff';
                const rowClass = result === 'PASS' ? 'pat-row-pass' : result === 'FAIL' ? 'pat-row-fail' : 'pat-row-pending';

                return (
                  <tr key={row.id} className={rowClass} style={{ background: rowBg, borderBottom: '1px solid var(--border)' }}>

                    {/* Row number */}
                    <td style={{ padding: '5px 8px', textAlign: 'center', color: 'var(--muted)', fontWeight: 700, fontSize: '0.82rem', width: '36px' }}>
                      {idx + 1}
                    </td>

                    {/* Asset ID */}
                    <td style={{ padding: '4px 6px', width: '76px' }}>
                      <input
                        type="text"
                        value={row.assetId}
                        onChange={e => updateRow(row.id, 'assetId', e.target.value)}
                        placeholder="ID"
                        style={{ width: '68px', padding: '5px 8px', fontSize: '0.84rem' }}
                      />
                    </td>

                    {/* Appliance */}
                    <td style={{ padding: '4px 6px', minWidth: '148px' }}>
                      <input
                        type="text"
                        list="pat-appliance-list"
                        value={row.appliance}
                        onChange={e => updateRow(row.id, 'appliance', e.target.value)}
                        placeholder="Appliance"
                        style={{ width: '140px', padding: '5px 8px', fontSize: '0.84rem' }}
                      />
                    </td>

                    {/* Location */}
                    <td style={{ padding: '4px 6px', minWidth: '124px' }}>
                      <input
                        type="text"
                        list="pat-location-list"
                        value={row.location}
                        onChange={e => updateRow(row.id, 'location', e.target.value)}
                        placeholder="Location"
                        style={{ width: '116px', padding: '5px 8px', fontSize: '0.84rem' }}
                      />
                    </td>

                    {/* Class */}
                    <td style={{ padding: '4px 6px', width: '82px' }}>
                      <select
                        value={row.classType}
                        onChange={e => updateRow(row.id, 'classType', e.target.value)}
                        style={{ width: '74px', padding: '5px 6px', fontSize: '0.84rem' }}
                      >
                        <option value="I">Class I</option>
                        <option value="II">Class II</option>
                      </select>
                    </td>

                    {/* Visual */}
                    <td style={{ padding: '4px 6px', width: '82px' }}>
                      <select
                        value={row.visual}
                        onChange={e => updateRow(row.id, 'visual', e.target.value)}
                        style={{ width: '74px', padding: '5px 6px', fontSize: '0.84rem' }}
                      >
                        <option value="PASS">PASS</option>
                        <option value="FAIL">FAIL</option>
                      </select>
                    </td>

                    {/* Earth continuity */}
                    <td style={{ padding: '4px 6px', width: '92px' }}>
                      <input
                        type={isII ? 'text' : 'number'}
                        value={isII ? 'N/A' : row.earthContinuity}
                        onChange={e => updateRow(row.id, 'earthContinuity', e.target.value)}
                        disabled={isII}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        style={{
                          width: '84px',
                          padding: '5px 8px',
                          fontSize: '0.84rem',
                          background: isII ? '#f0f2f5' : undefined,
                          color: isII ? '#999' : undefined,
                          cursor: isII ? 'not-allowed' : undefined,
                        }}
                      />
                    </td>

                    {/* Insulation */}
                    <td style={{ padding: '4px 6px', width: '104px' }}>
                      <input
                        type="number"
                        value={row.insulation}
                        onChange={e => updateRow(row.id, 'insulation', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder={isII ? '≥ 2.00' : '≥ 1.00'}
                        style={{ width: '96px', padding: '5px 8px', fontSize: '0.84rem' }}
                      />
                    </td>

                    {/* Polarity */}
                    <td style={{ padding: '4px 6px', width: '82px' }}>
                      <select
                        value={row.polarity}
                        onChange={e => updateRow(row.id, 'polarity', e.target.value)}
                        style={{ width: '74px', padding: '5px 6px', fontSize: '0.84rem' }}
                      >
                        <option value="PASS">PASS</option>
                        <option value="FAIL">FAIL</option>
                        <option value="N/A">N/A</option>
                      </select>
                    </td>

                    {/* Result badge */}
                    <td style={{ padding: '5px 8px', textAlign: 'center', width: '64px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        background: result === 'PASS' ? '#1a8a3c' : result === 'FAIL' ? '#c0392b' : '#b0b8c4',
                        color: '#fff',
                        letterSpacing: '0.03em',
                      }}>
                        {result}
                      </span>
                    </td>

                    {/* Delete */}
                    <td style={{ padding: '4px 6px', textAlign: 'center', width: '36px' }}>
                      <button
                        className="delete-btn"
                        onClick={() => deleteRow(row.id)}
                        title="Remove row"
                        aria-label="Remove row"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#c0392b',
                          fontSize: '0.95rem',
                          padding: '3px 6px',
                          borderRadius: '6px',
                          lineHeight: 1,
                        }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f5f7fa', borderTop: '2px solid var(--border)' }}>
                <td colSpan={9} style={{ padding: '10px 12px', fontSize: '0.87rem', fontWeight: 600, color: 'var(--text)' }}>
                  Total: {totals.total}&nbsp;&nbsp;|&nbsp;&nbsp;
                  <span style={{ color: '#1a8a3c' }}>Pass: {totals.pass}</span>&nbsp;&nbsp;|&nbsp;&nbsp;
                  <span style={{ color: '#c0392b' }}>Fail: {totals.fail}</span>&nbsp;&nbsp;|&nbsp;&nbsp;
                  Pass rate: <strong>{totals.passRate}%</strong>
                </td>
                <td colSpan={2} style={{ padding: '10px 8px' }} />
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Datalists */}
        <datalist id="pat-appliance-list">
          {APPLIANCE_LIST.map(a => <option key={a} value={a} />)}
        </datalist>
        <datalist id="pat-location-list">
          {locationSuggestions.map(l => <option key={l} value={l} />)}
        </datalist>

        {/* Action row */}
        <div className="no-print" style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={addRow}
            style={{
              padding: '10px 22px',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.93rem',
              cursor: 'pointer',
            }}
          >
            + Add Row
          </button>
          <button
            onClick={() => window.print()}
            style={{
              padding: '10px 22px',
              background: '#fff',
              color: 'var(--primary)',
              border: '2px solid var(--primary)',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.93rem',
              cursor: 'pointer',
            }}
          >
            Print Certificate
          </button>
        </div>
      </section>

      {/* Pass criteria note */}
      <section className="panel no-print" style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.65 }}>
        <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '6px' }}>Pass criteria (auto-calculated)</strong>
        <p style={{ margin: 0 }}>
          Visual = Pass &amp; earth continuity &le; 1.0 &Omega; (Class I only) &amp; insulation &ge; 1.0 M&Omega; (Class I) / &ge; 2.0 M&Omega; (Class II) &amp; polarity = Pass or N/A.
          Class II appliances have earth automatically set to N/A. Location suggestions are saved in your browser for reuse.
        </p>
      </section>
    </main>
  );
}
