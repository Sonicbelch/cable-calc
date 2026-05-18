'use client';

import { useState, useEffect, useCallback } from 'react';
import { SiteNav } from '../../components/SiteNav';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateCertNo() {
  const now = new Date();
  const p = n => String(n).padStart(2, '0');
  const date = `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}`;
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `MW-${date}-${rand}`;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ─── Print styles ─────────────────────────────────────────────────────────────

const PRINT_CSS = `
@media print {
  .site-nav, .no-print { display: none !important; }
  body { background: white !important; font-size: 10pt !important; }
  .page { padding: 0 !important; max-width: none !important; }
  .mw-panel {
    box-shadow: none !important;
    margin-bottom: 10px !important;
    border-radius: 6px !important;
    border: 1px solid #ccc !important;
    padding: 12px 14px !important;
    page-break-inside: avoid;
  }
  .mw-panel h2 {
    font-size: 9.5pt !important;
    margin-bottom: 8px !important;
    padding-bottom: 5px !important;
  }
  .mw-field-grid { gap: 8px 16px !important; }
  .mw-field label { font-size: 8.5pt !important; gap: 2px !important; }
  .mw-field input,
  .mw-field select,
  .mw-field textarea {
    border: none !important;
    border-bottom: 1px solid #aaa !important;
    background: transparent !important;
    padding: 1px 0 !important;
    font-size: 9pt !important;
    border-radius: 0 !important;
    resize: none !important;
  }
  .mw-test-table { font-size: 8.5pt !important; }
  .mw-test-table th { padding: 5px 6px !important; font-size: 8pt !important; }
  .mw-test-table td { padding: 3px 6px !important; }
  .mw-test-table input,
  .mw-test-table select {
    border: none !important;
    border-bottom: 1px solid #aaa !important;
    background: transparent !important;
    padding: 1px 0 !important;
    font-size: 8.5pt !important;
    border-radius: 0 !important;
    -webkit-appearance: none !important;
    appearance: none !important;
    width: 100% !important;
  }
  .mw-print-header { display: flex !important; }
  .mw-cert-no-badge { display: inline-block !important; }
  .mw-declaration-box {
    border: 1px solid #999 !important;
    border-radius: 6px !important;
    padding: 10px 12px !important;
  }
  .mw-thead { background: #185adb !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @page { size: A4 portrait; margin: 12mm; }
}
`;

// ─── Field component ──────────────────────────────────────────────────────────

function Field({ label, children, span }) {
  return (
    <label
      className="mw-field"
      style={{
        display: 'grid',
        gap: '5px',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'var(--text)',
        gridColumn: span ? `span ${span}` : undefined,
      }}
    >
      {label}
      {children}
    </label>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MinorWorksCertClient() {
  // Section 2 — installation details
  const [install, setInstall] = useState({
    clientName: '',
    address: '',
    workDescription: '',
    locationExtent: '',
  });

  // Section 3 — installation condition
  const [condition, setCondition] = useState({
    earthingArrangement: 'TN-C-S',
    deviceType: '',
    deviceRating: '',
    deviceBS: '',
    rcdType: '',
    rcdCurrent: '',
    rcdTime: '',
    comments: '',
  });

  // Section 4 — test results
  const [tests, setTests] = useState({
    circuitDescription: '',
    liveCsa: '',
    cpcCsa: '',
    insLL: '',
    insLE: '',
    polarity: false,
    zs: '',
    rcdOpTime: '',
  });

  // Section 5 — declaration
  const [declaration, setDeclaration] = useState({
    safetyConfirm: false,
    signatoryName: '',
    signature: '',
    position: '',
    date: '',
    certNo: '',
  });

  useEffect(() => {
    setDeclaration(d => ({
      ...d,
      date: todayStr(),
      certNo: generateCertNo(),
    }));
  }, []);

  const setI = useCallback((field, value) => setInstall(s => ({ ...s, [field]: value })), []);
  const setC = useCallback((field, value) => setCondition(s => ({ ...s, [field]: value })), []);
  const setT = useCallback((field, value) => setTests(s => ({ ...s, [field]: value })), []);
  const setD = useCallback((field, value) => setDeclaration(s => ({ ...s, [field]: value })), []);

  const inputStyle = {
    fontWeight: 400,
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1.5px solid var(--border)',
    fontSize: '0.9rem',
    background: 'var(--surface)',
    color: 'var(--text)',
    width: '100%',
    boxSizing: 'border-box',
  };

  const textareaStyle = {
    ...inputStyle,
    resize: 'vertical',
    minHeight: '70px',
    fontFamily: 'inherit',
  };

  const panelHeadingStyle = {
    margin: '0 0 16px',
    fontSize: '0.95rem',
    fontWeight: 700,
    color: 'var(--primary)',
    paddingBottom: '10px',
    borderBottom: '2px solid var(--primary)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const gridStyle = (cols) => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: '14px 20px',
  });

  return (
    <main className="page">
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <SiteNav current="/minor-works-cert" />

      {/* Print-only certificate header */}
      <div className="mw-print-header" style={{
        display: 'none',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '14px',
        paddingBottom: '12px',
        borderBottom: '3px solid #185adb',
      }}>
        <img src="/eoc-BOW-logo.png" alt="Electricians On Call" style={{ height: '44px', width: 'auto' }} />
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#142033', lineHeight: 1.1 }}>
            Minor Electrical Installation Works Certificate
          </div>
          <div style={{ fontSize: '0.8rem', color: '#57657d', marginTop: '2px' }}>
            As required by BS 7671 — Requirements for Electrical Installations
          </div>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: '0.8rem', color: '#57657d' }}>
          <div><strong>Cert no.:</strong> {declaration.certNo}</div>
          <div><strong>Date:</strong> {declaration.date}</div>
        </div>
      </div>

      {/* Screen hero */}
      <section className="hero hero-slim no-print" style={{ marginBottom: '28px' }}>
        <div>
          <p className="eyebrow">Minor Works Certificate Generator</p>
          <h1>Minor Electrical Installation Works Certificate</h1>
          <p className="lead">
            BS 7671-compliant. Complete all sections then print a clean A4 certificate.
          </p>
        </div>
      </section>

      {/* ── Section 1 — Contractor details ──────────────────────────────────── */}
      <section className="panel mw-panel" style={{ marginBottom: '20px' }}>
        <h2 style={panelHeadingStyle}>
          <span style={{
            background: 'var(--primary)', color: '#fff',
            borderRadius: '50%', width: '24px', height: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.78rem', fontWeight: 800, flexShrink: 0,
          }}>1</span>
          Contractor Details
        </h2>
        <div className="mw-field-grid" style={gridStyle(2)}>
          <Field label="Company name">
            <input type="text" readOnly value="Electricians On Call" style={{ ...inputStyle, background: '#f5f7fa', color: 'var(--muted)' }} />
          </Field>
          <Field label="Address">
            <input type="text" readOnly value="18 Bulstrode Street, London W1U 2JL" style={{ ...inputStyle, background: '#f5f7fa', color: 'var(--muted)' }} />
          </Field>
          <Field label="Phone">
            <input type="text" readOnly value="07723 007 198" style={{ ...inputStyle, background: '#f5f7fa', color: 'var(--muted)' }} />
          </Field>
          <Field label="Certification body &amp; number">
            <input type="text" readOnly value="NAPIT 28287" style={{ ...inputStyle, background: '#f5f7fa', color: 'var(--muted)' }} />
          </Field>
        </div>
      </section>

      {/* ── Section 2 — Installation details ────────────────────────────────── */}
      <section className="panel mw-panel" style={{ marginBottom: '20px' }}>
        <h2 style={panelHeadingStyle}>
          <span style={{
            background: 'var(--primary)', color: '#fff',
            borderRadius: '50%', width: '24px', height: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.78rem', fontWeight: 800, flexShrink: 0,
          }}>2</span>
          Installation Details
        </h2>
        <div className="mw-field-grid" style={gridStyle(2)}>
          <Field label="Client name">
            <input
              type="text"
              value={install.clientName}
              onChange={e => setI('clientName', e.target.value)}
              placeholder="e.g. John Smith"
              style={inputStyle}
            />
          </Field>
          <Field label="Address of installation">
            <input
              type="text"
              value={install.address}
              onChange={e => setI('address', e.target.value)}
              placeholder="e.g. 42 Church Road, London SW19 5AX"
              style={inputStyle}
            />
          </Field>
          <Field label="Description of work" span={2}>
            <textarea
              value={install.workDescription}
              onChange={e => setI('workDescription', e.target.value)}
              placeholder="e.g. Installation of a new single-phase 13A socket outlet in the living room, connected to the existing ring final circuit."
              style={textareaStyle}
            />
          </Field>
          <Field label="Location / extent of work" span={2}>
            <input
              type="text"
              value={install.locationExtent}
              onChange={e => setI('locationExtent', e.target.value)}
              placeholder="e.g. Living room — ring final circuit (consumer unit way 6)"
              style={inputStyle}
            />
          </Field>
        </div>
      </section>

      {/* ── Section 3 — Installation condition ──────────────────────────────── */}
      <section className="panel mw-panel" style={{ marginBottom: '20px' }}>
        <h2 style={panelHeadingStyle}>
          <span style={{
            background: 'var(--primary)', color: '#fff',
            borderRadius: '50%', width: '24px', height: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.78rem', fontWeight: 800, flexShrink: 0,
          }}>3</span>
          Installation Condition at Time of Work
        </h2>
        <div className="mw-field-grid" style={gridStyle(3)}>
          <Field label="Earthing arrangement">
            <select
              value={condition.earthingArrangement}
              onChange={e => setC('earthingArrangement', e.target.value)}
              style={inputStyle}
            >
              <option value="TN-C-S">TN-C-S (PME / TNCS)</option>
              <option value="TN-S">TN-S</option>
              <option value="TT">TT</option>
            </select>
          </Field>
          <Field label="Protective device type">
            <input
              type="text"
              value={condition.deviceType}
              onChange={e => setC('deviceType', e.target.value)}
              placeholder="e.g. MCB Type B"
              style={inputStyle}
            />
          </Field>
          <Field label="Device rating (A)">
            <input
              type="number"
              value={condition.deviceRating}
              onChange={e => setC('deviceRating', e.target.value)}
              onFocus={e => e.target.select()}
              placeholder="e.g. 32"
              min="0"
              step="1"
              style={inputStyle}
            />
          </Field>
          <Field label="Device BS number">
            <input
              type="text"
              value={condition.deviceBS}
              onChange={e => setC('deviceBS', e.target.value)}
              placeholder="e.g. BS EN 60898"
              style={inputStyle}
            />
          </Field>
          <Field label="RCD type">
            <input
              type="text"
              value={condition.rcdType}
              onChange={e => setC('rcdType', e.target.value)}
              placeholder="e.g. Type A"
              style={inputStyle}
            />
          </Field>
          <Field label="RCD operating current (mA)">
            <input
              type="number"
              value={condition.rcdCurrent}
              onChange={e => setC('rcdCurrent', e.target.value)}
              onFocus={e => e.target.select()}
              placeholder="e.g. 30"
              min="0"
              step="1"
              style={inputStyle}
            />
          </Field>
          <Field label="RCD disconnection time (ms)">
            <input
              type="number"
              value={condition.rcdTime}
              onChange={e => setC('rcdTime', e.target.value)}
              onFocus={e => e.target.select()}
              placeholder="e.g. 40"
              min="0"
              step="1"
              style={inputStyle}
            />
          </Field>
          <Field label="Comments on existing installation" span={3}>
            <textarea
              value={condition.comments}
              onChange={e => setC('comments', e.target.value)}
              placeholder="e.g. Existing installation appeared to be in a satisfactory condition. No defects noted."
              style={textareaStyle}
            />
          </Field>
        </div>
      </section>

      {/* ── Section 4 — Test results ─────────────────────────────────────────── */}
      <section className="panel mw-panel" style={{ marginBottom: '20px' }}>
        <h2 style={panelHeadingStyle}>
          <span style={{
            background: 'var(--primary)', color: '#fff',
            borderRadius: '50%', width: '24px', height: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.78rem', fontWeight: 800, flexShrink: 0,
          }}>4</span>
          Test Results
        </h2>

        {/* Responsive test results table */}
        <div style={{ overflowX: 'auto' }}>
          <table
            className="mw-test-table"
            style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: '700px' }}
          >
            <thead className="mw-thead">
              <tr style={{ background: 'var(--primary)', color: '#fff' }}>
                {[
                  'Circuit description',
                  'Live CSA (mm²)',
                  'CPC CSA (mm²)',
                  'IR Line/Line (MΩ)',
                  'IR Line/Earth (MΩ)',
                  'Polarity ✓',
                  'Zs (Ω)',
                  'RCD time (ms)',
                ].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: '10px 8px',
                      textAlign: 'left',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '6px 6px', minWidth: '160px' }}>
                  <input
                    type="text"
                    value={tests.circuitDescription}
                    onChange={e => setT('circuitDescription', e.target.value)}
                    placeholder="e.g. Ring final — living room"
                    style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.84rem' }}
                  />
                </td>
                <td style={{ padding: '6px 6px', width: '90px' }}>
                  <input
                    type="number"
                    value={tests.liveCsa}
                    onChange={e => setT('liveCsa', e.target.value)}
                    onFocus={e => e.target.select()}
                    placeholder="2.5"
                    min="0"
                    step="0.5"
                    style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.84rem' }}
                  />
                </td>
                <td style={{ padding: '6px 6px', width: '90px' }}>
                  <input
                    type="number"
                    value={tests.cpcCsa}
                    onChange={e => setT('cpcCsa', e.target.value)}
                    onFocus={e => e.target.select()}
                    placeholder="2.5"
                    min="0"
                    step="0.5"
                    style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.84rem' }}
                  />
                </td>
                <td style={{ padding: '6px 6px', width: '110px' }}>
                  <input
                    type="number"
                    value={tests.insLL}
                    onChange={e => setT('insLL', e.target.value)}
                    onFocus={e => e.target.select()}
                    placeholder="≥ 1.0"
                    min="0"
                    step="0.01"
                    style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.84rem' }}
                  />
                </td>
                <td style={{ padding: '6px 6px', width: '110px' }}>
                  <input
                    type="number"
                    value={tests.insLE}
                    onChange={e => setT('insLE', e.target.value)}
                    onFocus={e => e.target.select()}
                    placeholder="≥ 1.0"
                    min="0"
                    step="0.01"
                    style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.84rem' }}
                  />
                </td>
                <td style={{ padding: '6px 6px', width: '80px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={tests.polarity}
                    onChange={e => setT('polarity', e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                  />
                </td>
                <td style={{ padding: '6px 6px', width: '90px' }}>
                  <input
                    type="number"
                    value={tests.zs}
                    onChange={e => setT('zs', e.target.value)}
                    onFocus={e => e.target.select()}
                    placeholder="e.g. 0.85"
                    min="0"
                    step="0.01"
                    style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.84rem' }}
                  />
                </td>
                <td style={{ padding: '6px 6px', width: '90px' }}>
                  <input
                    type="number"
                    value={tests.rcdOpTime}
                    onChange={e => setT('rcdOpTime', e.target.value)}
                    onFocus={e => e.target.select()}
                    placeholder="e.g. 28"
                    min="0"
                    step="1"
                    style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.84rem' }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style={{ margin: '12px 0 0', fontSize: '0.8rem', color: 'var(--muted)' }}>
          BS 7671 minimum: insulation resistance ≥ 1 MΩ; RCD ≤ 300 ms at I△n (≤ 40 ms for 30 mA type A/AC).
          Zs must not exceed the maximum permitted for the protective device.
        </p>
      </section>

      {/* ── Section 5 — Declaration ──────────────────────────────────────────── */}
      <section className="panel mw-panel" style={{ marginBottom: '24px' }}>
        <h2 style={panelHeadingStyle}>
          <span style={{
            background: 'var(--primary)', color: '#fff',
            borderRadius: '50%', width: '24px', height: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.78rem', fontWeight: 800, flexShrink: 0,
          }}>5</span>
          Declaration
        </h2>

        <div
          className="mw-declaration-box"
          style={{
            border: '1.5px solid var(--border)',
            borderRadius: '10px',
            padding: '16px 18px',
            marginBottom: '18px',
            background: '#f8faff',
          }}
        >
          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            fontSize: '0.875rem',
            color: 'var(--text)',
            lineHeight: 1.6,
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={declaration.safetyConfirm}
              onChange={e => setD('safetyConfirm', e.target.checked)}
              style={{ marginTop: '3px', width: '16px', height: '16px', flexShrink: 0, accentColor: 'var(--primary)' }}
            />
            <span>
              I/We hereby certify that the work detailed on this certificate has been designed, constructed,
              inspected and tested in accordance with BS 7671 (IET Wiring Regulations) and that to the best of
              my/our knowledge and belief, the minor works <strong>do not impair the safety</strong> of the
              existing installation.
            </span>
          </label>
        </div>

        <div className="mw-field-grid" style={gridStyle(3)}>
          <Field label="Certificate number">
            <input
              type="text"
              value={declaration.certNo}
              onChange={e => setD('certNo', e.target.value)}
              style={inputStyle}
            />
          </Field>
          <Field label="Name">
            <input
              type="text"
              value={declaration.signatoryName}
              onChange={e => setD('signatoryName', e.target.value)}
              placeholder="Full name"
              style={inputStyle}
            />
          </Field>
          <Field label="Position / role">
            <input
              type="text"
              value={declaration.position}
              onChange={e => setD('position', e.target.value)}
              placeholder="e.g. Electrician"
              style={inputStyle}
            />
          </Field>
          <Field label="Signature">
            <input
              type="text"
              value={declaration.signature}
              onChange={e => setD('signature', e.target.value)}
              placeholder="Type name as signature"
              style={{ ...inputStyle, fontStyle: 'italic' }}
            />
          </Field>
          <Field label="Date">
            <input
              type="date"
              value={declaration.date}
              onChange={e => setD('date', e.target.value)}
              style={inputStyle}
            />
          </Field>
        </div>
      </section>

      {/* ── Actions ──────────────────────────────────────────────────────────── */}
      <div className="no-print" style={{ display: 'flex', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: '12px 28px',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          Print / Save as PDF
        </button>
        <button
          onClick={() => {
            setInstall({ clientName: '', address: '', workDescription: '', locationExtent: '' });
            setCondition({ earthingArrangement: 'TN-C-S', deviceType: '', deviceRating: '', deviceBS: '', rcdType: '', rcdCurrent: '', rcdTime: '', comments: '' });
            setTests({ circuitDescription: '', liveCsa: '', cpcCsa: '', insLL: '', insLE: '', polarity: false, zs: '', rcdOpTime: '' });
            setDeclaration(d => ({ ...d, safetyConfirm: false, signatoryName: '', signature: '', position: '', certNo: generateCertNo(), date: todayStr() }));
          }}
          style={{
            padding: '12px 24px',
            background: '#fff',
            color: 'var(--primary)',
            border: '2px solid var(--primary)',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
          }}
        >
          New Certificate
        </button>
      </div>

      {/* ── Info note ────────────────────────────────────────────────────────── */}
      <section className="panel no-print" style={{ fontSize: '0.84rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '32px' }}>
        <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '6px' }}>About this certificate</strong>
        <p style={{ margin: 0 }}>
          This Minor Electrical Installation Works Certificate is required under BS 7671:2018+A2:2022
          (IET Wiring Regulations 18th Edition) for minor works that do not include the provision of a
          new circuit. It must be given to the person ordering the work on completion. The certificate
          number is auto-generated in the format MW-YYYYMMDD-XXXX and can be edited if required.
        </p>
      </section>
    </main>
  );
}
