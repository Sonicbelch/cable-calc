'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { SiteNav } from '../../components/SiteNav';

const EV_MODELS = [
  { label: 'Tesla Model 3 Standard Range', kwh: 57.5 },
  { label: 'Tesla Model 3 Long Range', kwh: 75 },
  { label: 'Tesla Model Y Long Range', kwh: 75 },
  { label: 'Nissan Leaf 40kWh', kwh: 40 },
  { label: 'Nissan Leaf 62kWh', kwh: 62 },
  { label: 'Volkswagen ID.3', kwh: 58 },
  { label: 'Volkswagen ID.4', kwh: 77 },
  { label: 'BMW i3', kwh: 42.2 },
  { label: 'Hyundai Ioniq 5', kwh: 72.6 },
  { label: 'Kia EV6', kwh: 77.4 },
  { label: 'Renault Zoe', kwh: 52 },
  { label: 'MINI Electric', kwh: 28.9 },
  { label: 'Polestar 2', kwh: 69 },
  { label: 'Audi e-tron', kwh: 95 },
  { label: 'Mercedes EQC', kwh: 80 },
  { label: 'Other (enter manually)', kwh: null },
];

const MILES_PER_KWH = 3.5;
const MONTHLY_MILES = 800;
const LITRES_PER_GALLON = 4.54609;

function fmt(pounds) {
  if (pounds < 1) return `${Math.round(pounds * 100)}p`;
  return `£${pounds.toFixed(2)}`;
}

function fmtPounds(pounds) {
  return `£${pounds.toFixed(2)}`;
}

export function EVChargingClient() {
  const [modelIdx, setModelIdx] = useState(0);
  const [manualKwh, setManualKwh] = useState('');
  const [tariff, setTariff] = useState('24');
  const [currentPct, setCurrentPct] = useState('20');
  const [petrolMpg, setPetrolMpg] = useState('40');
  const [petrolPence, setPetrolPence] = useState('145');

  const selected = EV_MODELS[modelIdx];
  const isOther = selected.kwh === null;

  const batteryKwh = isOther ? parseFloat(manualKwh) || 0 : selected.kwh;
  const tariffPence = parseFloat(tariff) || 0;
  const pct = Math.min(100, Math.max(0, parseFloat(currentPct) || 0));

  const results = useMemo(() => {
    if (!batteryKwh || !tariffPence) return null;

    const topUpKwh = batteryKwh * (100 - pct) / 100;
    const topUpCost = topUpKwh * tariffPence / 100;

    const fullChargeKwh = batteryKwh;
    const fullChargeCost = fullChargeKwh * tariffPence / 100;

    const costPerMile = tariffPence / MILES_PER_KWH / 100;
    const monthlyCost = MONTHLY_MILES * costPerMile;

    const costPer100Miles = costPerMile * 100;

    // Petrol comparison
    const mpg = parseFloat(petrolMpg) || 0;
    const petrolPencePerLitre = parseFloat(petrolPence) || 0;
    let petrolCostPerMile = null;
    let petrolMonthlyCost = null;
    let petrolAnnualCost = null;
    let evAnnualCost = null;
    let annualSaving = null;
    if (mpg && petrolPencePerLitre) {
      const litresPerMile = LITRES_PER_GALLON / mpg;
      petrolCostPerMile = litresPerMile * petrolPencePerLitre / 100;
      petrolMonthlyCost = MONTHLY_MILES * petrolCostPerMile;
      petrolAnnualCost = petrolMonthlyCost * 12;
      evAnnualCost = monthlyCost * 12;
      annualSaving = petrolAnnualCost - evAnnualCost;
    }

    return { topUpKwh, topUpCost, fullChargeKwh, fullChargeCost, costPerMile, monthlyCost, costPer100Miles, petrolCostPerMile, petrolMonthlyCost, petrolAnnualCost, evAnnualCost, annualSaving };
  }, [batteryKwh, tariffPence, pct, petrolMpg, petrolPence]);

  const searchParams = useSearchParams();
  const isEmbed = searchParams.get('embed') === 'true';

  return (
    <main className="page">
      {!isEmbed && <SiteNav current="/ev-charging-cost" />}

      <section className="hero hero-slim" style={{ marginBottom: '32px' }}>
        <div>
          <p className="eyebrow">EV Charging Cost Calculator</p>
          <h1>How much does it cost to charge an EV at home?</h1>
          <p className="lead">
            Enter your electric vehicle and electricity tariff to see exactly what you'll pay
            to charge at home — including cost per mile and monthly estimates.
          </p>
        </div>
      </section>

      <div className="calculator-shell" style={{ gridTemplateColumns: '1.1fr 0.9fr' }}>

        {/* Input panel */}
        <section className="panel form-panel">
          <h2 style={{ marginTop: 0, marginBottom: '24px', fontSize: '1.15rem', color: 'var(--text)' }}>
            Your details
          </h2>

          <div style={{ display: 'grid', gap: '20px' }}>

            {/* EV model */}
            <label style={{ display: 'grid', gap: '8px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
              Electric vehicle
              <select
                value={modelIdx}
                onChange={e => setModelIdx(Number(e.target.value))}
              >
                {EV_MODELS.map((m, i) => (
                  <option key={i} value={i}>{m.label}{m.kwh ? ` — ${m.kwh} kWh` : ''}</option>
                ))}
              </select>
            </label>

            {/* Manual kWh input — shown only for "Other" */}
            {isOther && (
              <label style={{ display: 'grid', gap: '8px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
                Battery capacity (kWh)
                <input
                  type="number"
                  min="1"
                  max="200"
                  step="0.1"
                  value={manualKwh}
                  onChange={e => setManualKwh(e.target.value)}
                  placeholder="e.g. 64"
                />
              </label>
            )}

            {/* Battery info chip */}
            {!isOther && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f0f4ff',
                border: '1px solid #c7d6f7',
                borderRadius: '12px',
                padding: '10px 16px',
                fontSize: '0.9rem',
                color: 'var(--primary)',
                fontWeight: 600,
              }}>
                <span>⚡</span>
                <span>Battery: {selected.kwh} kWh</span>
              </div>
            )}

            <div className="grid two-col" style={{ gap: '16px' }}>
              {/* Tariff */}
              <label style={{ display: 'grid', gap: '8px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
                Electricity tariff (p/kWh)
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.1"
                    value={tariff}
                    onChange={e => setTariff(e.target.value)}
                    style={{ paddingRight: '52px', width: '100%', boxSizing: 'border-box' }}
                  />
                  <span style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.85rem',
                    color: 'var(--muted)',
                    pointerEvents: 'none',
                    fontWeight: 500,
                  }}>p/kWh</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 400 }}>
                  UK average ~24p/kWh (Apr 2025)
                </span>
              </label>

              {/* Current % */}
              <label style={{ display: 'grid', gap: '8px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
                Current battery level (%)
                <div style={{ position: 'relative' }}>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    step="1"
                    value={currentPct}
                    onChange={e => setCurrentPct(e.target.value)}
                    style={{ paddingRight: '36px', width: '100%', boxSizing: 'border-box' }}
                  />
                  <span style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.85rem',
                    color: 'var(--muted)',
                    pointerEvents: 'none',
                    fontWeight: 500,
                  }}>%</span>
                </div>
              </label>
            </div>

            {/* Petrol comparison divider */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '4px' }}>
              <p style={{ margin: '0 0 16px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                ⛽ Compare with petrol
              </p>
              <div className="grid two-col" style={{ gap: '16px' }}>
                <label style={{ display: 'grid', gap: '8px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
                  Petrol car MPG
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min="10"
                      max="120"
                      step="1"
                      value={petrolMpg}
                      onChange={e => setPetrolMpg(e.target.value)}
                      style={{ paddingRight: '52px', width: '100%', boxSizing: 'border-box' }}
                    />
                    <span style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      fontSize: '0.85rem', color: 'var(--muted)', pointerEvents: 'none', fontWeight: 500,
                    }}>MPG</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 400 }}>
                    UK average ~40 MPG
                  </span>
                </label>

                <label style={{ display: 'grid', gap: '8px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
                  Petrol price (p/litre)
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min="50"
                      max="300"
                      step="0.1"
                      value={petrolPence}
                      onChange={e => setPetrolPence(e.target.value)}
                      style={{ paddingRight: '36px', width: '100%', boxSizing: 'border-box' }}
                    />
                    <span style={{
                      position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                      fontSize: '0.85rem', color: 'var(--muted)', pointerEvents: 'none', fontWeight: 500,
                    }}>p</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 400 }}>
                    UK average ~145p/litre (2025)
                  </span>
                </label>
              </div>
            </div>

          </div>
        </section>

        {/* Results panel */}
        <section className="panel result-panel">
          <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.15rem', color: 'var(--text)' }}>
            Cost estimates
          </h2>

          {!results ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.95rem' }}>
              {isOther && !manualKwh
                ? 'Enter your battery capacity to see results.'
                : !tariffPence
                ? 'Enter your electricity tariff to see results.'
                : 'Fill in your details to see results.'}
            </p>
          ) : (
            <div className="result-grid" style={{ gap: '14px' }}>

              {/* Top-up cost */}
              <div className="metric-card" style={{ gridColumn: '1 / -1', background: '#f0f4ff', border: '1px solid #c7d6f7' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Cost to top up ({pct}% → 100%)
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>
                  {fmtPounds(results.topUpCost)}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '6px' }}>
                  {results.topUpKwh.toFixed(1)} kWh needed
                </div>
              </div>

              {/* Full charge cost */}
              <div className="metric-card">
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Full charge (0–100%)
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
                  {fmtPounds(results.fullChargeCost)}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '6px' }}>
                  {results.fullChargeKwh} kWh
                </div>
              </div>

              {/* Cost per mile */}
              <div className="metric-card">
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Cost per mile
                </div>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
                  {fmt(results.costPerMile)}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '6px' }}>
                  ~{fmtPounds(results.costPer100Miles)} per 100 miles
                </div>
              </div>

              {/* Monthly cost */}
              <div className="metric-card" style={{ gridColumn: '1 / -1', background: '#dff7e8', border: '1px solid #a8e6c0' }}>
                <div style={{ fontSize: '0.8rem', color: '#0d6b33', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  Estimated monthly cost (EV)
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0d6b33', lineHeight: 1 }}>
                  {fmtPounds(results.monthlyCost)}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#2a7a4a', marginTop: '6px' }}>
                  Based on {MONTHLY_MILES} miles/month (UK average)
                </div>
              </div>

              {/* Petrol comparison */}
              {results.petrolCostPerMile !== null && (
                <>
                  <div style={{
                    gridColumn: '1 / -1',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '14px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    ⛽ Petrol equivalent
                  </div>

                  <div className="metric-card">
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      Petrol cost/mile
                    </div>
                    <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
                      {fmt(results.petrolCostPerMile)}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '6px' }}>
                      vs {fmt(results.costPerMile)} electric
                    </div>
                  </div>

                  <div className="metric-card">
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                      Petrol monthly cost
                    </div>
                    <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
                      {fmtPounds(results.petrolMonthlyCost)}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '6px' }}>
                      vs {fmtPounds(results.monthlyCost)} electric
                    </div>
                  </div>

                  {/* Annual saving — hero card */}
                  <div className="metric-card" style={{
                    gridColumn: '1 / -1',
                    background: results.annualSaving >= 0 ? 'linear-gradient(135deg, #1040a0 0%, #185adb 100%)' : '#fff3cd',
                    border: results.annualSaving >= 0 ? 'none' : '1px solid #ffc107',
                    color: results.annualSaving >= 0 ? '#fff' : '#856404',
                  }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '6px',
                      opacity: 0.85,
                    }}>
                      {results.annualSaving >= 0 ? '💰 Annual saving by going electric' : '⚠️ EV costs more at these rates'}
                    </div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1 }}>
                      {fmtPounds(Math.abs(results.annualSaving))}
                      <span style={{ fontSize: '1rem', fontWeight: 600, opacity: 0.8, marginLeft: '8px' }}>/ year</span>
                    </div>
                    <div style={{ fontSize: '0.85rem', marginTop: '8px', opacity: 0.85 }}>
                      EV: {fmtPounds(results.evAnnualCost)}/yr &nbsp;·&nbsp; Petrol: {fmtPounds(results.petrolAnnualCost)}/yr
                      &nbsp;·&nbsp; {MONTHLY_MILES * 12} miles/year
                    </div>
                  </div>
                </>
              )}

            </div>
          )}

          {results && (
            <details style={{ marginTop: '20px' }}>
              <summary style={{ fontSize: '0.85rem', color: 'var(--muted)', cursor: 'pointer', fontWeight: 600 }}>
                How these are calculated
              </summary>
              <div style={{ marginTop: '12px', fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                <p><strong>Battery:</strong> {batteryKwh} kWh ({selected.label || 'custom'})</p>
                <p><strong>Tariff:</strong> {tariffPence}p/kWh</p>
                <p><strong>Top-up:</strong> {batteryKwh} × {((100 - pct) / 100).toFixed(3)} × {tariffPence}p ÷ 100 = {fmtPounds(results.topUpCost)}</p>
                <p><strong>Per mile:</strong> {tariffPence}p ÷ {MILES_PER_KWH} miles/kWh = {(results.costPerMile * 100).toFixed(2)}p</p>
                <p><strong>Monthly:</strong> {MONTHLY_MILES} miles × {(results.costPerMile * 100).toFixed(2)}p ÷ 100 = {fmtPounds(results.monthlyCost)}</p>
                {results.petrolCostPerMile !== null && (
                  <>
                    <p><strong>Petrol per mile:</strong> {LITRES_PER_GALLON.toFixed(3)}L/gal ÷ {petrolMpg} MPG × {petrolPence}p/L = {(results.petrolCostPerMile * 100).toFixed(2)}p</p>
                    <p><strong>Annual saving:</strong> ({fmtPounds(results.petrolMonthlyCost)} − {fmtPounds(results.monthlyCost)}) × 12 = {fmtPounds(Math.abs(results.annualSaving))}</p>
                  </>
                )}
                <p style={{ marginTop: '8px', fontStyle: 'italic' }}>
                  Real-world efficiency assumed at {MILES_PER_KWH} miles/kWh (typical UK average).
                  Actual range varies with speed, temperature and driving style.
                </p>
              </div>
            </details>
          )}
        </section>
      </div>

      {/* Assumptions panel */}
      <section className="panel" style={{ marginTop: '24px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: '1rem', color: 'var(--text)' }}>Assumptions &amp; notes</h3>
        <div className="grid two-col" style={{ gap: '16px', fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6 }}>
          <div>
            <strong style={{ color: 'var(--text)' }}>Efficiency: {MILES_PER_KWH} miles/kWh</strong><br />
            UK real-world average across common EVs. Individual results vary with speed,
            climate, tyre pressure and driving style.
          </div>
          <div>
            <strong style={{ color: 'var(--text)' }}>Tariff: default 24p/kWh</strong><br />
            Based on the UK energy price cap (April 2025). EV-specific tariffs (e.g. Octopus Go)
            can be significantly cheaper — as low as 7–10p/kWh overnight.
          </div>
          <div>
            <strong style={{ color: 'var(--text)' }}>Mileage: {MONTHLY_MILES} miles/month</strong><br />
            UK average from DfT statistics. Adjust the tariff field to model different
            tariffs; multiply cost-per-mile by your actual mileage for a personalised figure.
          </div>
          <div>
            <strong style={{ color: 'var(--text)' }}>Battery capacity</strong><br />
            Figures shown are usable (net) battery capacity as quoted by manufacturers.
            Charging to 100% is not always recommended for daily use — 80% is typical.
          </div>
        </div>
      </section>

      {/* EV charger installation CTA */}
      <section style={{
        marginTop: '32px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #1040a0 0%, #185adb 100%)',
        padding: '40px 32px',
        color: '#fff',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
      }}>
        <div style={{ flex: '1 1 300px' }}>
          <p style={{
            margin: '0 0 8px',
            fontSize: '0.8rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: '#ffd84d',
          }}>
            Electricians On Call — London
          </p>
          <h2 style={{ margin: '0 0 12px', fontSize: '1.55rem', fontWeight: 800, lineHeight: 1.2 }}>
            Need a home EV charger installed?
          </h2>
          <p style={{ margin: 0, fontSize: '0.97rem', opacity: 0.9, lineHeight: 1.6, maxWidth: '52ch' }}>
            Our OZEV-approved engineers install smart home EV chargers across London.
            Fast response, fully qualified — we handle everything from survey to commissioning.
            Call us on <strong>07723 007 198</strong> or get a free quote online.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: '0 0 auto' }}>
          <a
            href="https://eoclondon.com/ev-charger-installation"
            className="button"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#ffd84d',
              color: '#142033',
              fontWeight: 700,
              padding: '14px 28px',
              borderRadius: '999px',
              textDecoration: 'none',
              display: 'inline-block',
              textAlign: 'center',
              fontSize: '0.97rem',
              whiteSpace: 'nowrap',
            }}
          >
            Get a free EV charger quote →
          </a>
          <a
            href="tel:07723007198"
            style={{
              color: '#fff',
              textAlign: 'center',
              fontSize: '0.9rem',
              opacity: 0.85,
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            📞 07723 007 198
          </a>
        </div>
      </section>

    </main>
  );
}
