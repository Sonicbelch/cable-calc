import { Calculator } from '@/components/Calculator';

const faqItems = [
  {
    question: 'What does this BS 7671 cable size calculator check?',
    answer: 'It estimates design current, proposes a cable size from bundled reference data, and shows current-carrying capacity, voltage drop and adiabatic pass/fail cards.'
  },
  {
    question: 'Can I use this tool for formal certification?',
    answer: 'No. It is a fast preliminary design aid and should be verified against the current edition of BS 7671, manufacturer data and your project-specific assumptions.'
  },
  {
    question: 'Why is the Zs check marked as a placeholder?',
    answer: 'This version reserves the workflow and UI for Zs and disconnection verification, but does not yet ship the full tabulated protective device data set needed for automated confirmation.'
  }
];

export default function HomePage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  };

  return (
    <main className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">UK electrical design tool</p>
          <h1>BS 7671 cable size calculator for quick UK circuit design checks</h1>
          <p className="lead">Build an initial cable sizing assessment for single-phase and three-phase circuits with current, voltage drop, and adiabatic calculations in one clean workflow.</p>
          <div className="cta-row">
            <a href="#calculator" className="button primary">Open calculator</a>
            <a href="#faq" className="button secondary">Read FAQs</a>
          </div>
        </div>
        <div className="hero-card panel">
          <h2>Designed for practical pre-design reviews</h2>
          <ul>
            <li>Supports 1φ and 3φ supply assumptions.</li>
            <li>Includes earthing, installation method, grouping and insulation adjustments.</li>
            <li>Offers four load input modes including an appliance basket.</li>
            <li>Highlights default voltage drop targets: 3% lighting and 5% for other circuits.</li>
          </ul>
        </div>
      </section>
      <Calculator />
      <section className="content-grid">
        <article className="panel">
          <h2>How the calculator works</h2>
          <p>The app calculates design current (Ib) from your chosen load input method, applies simplified correction factors for ambient temperature, grouping, insulation and installation reference method, then identifies the first cable size whose corrected current-carrying capacity (Iz) can satisfy the selected protective device rating (In).</p>
          <p>It then compares voltage drop against default limits and calculates the minimum adiabatic protective conductor size using bundled k-values. The outputs are intentionally explicit so engineers, estimators and contractors can see why a draft selection passes or fails.</p>
        </article>
        <article className="panel">
          <h2>Ideal use cases</h2>
          <p>Use the tool for early-stage sizing of lighting circuits, socket radials, ring finals, motors and submains. It is useful as a lead-generation landing page or customer-facing design helper for UK electrical contractors and consultants.</p>
          <p>Always confirm final cable selection against full BS 7671 tables, product manufacturer data, thermal insulation details, fault protection requirements and any diversity or harmonics assumptions applicable to the real project.</p>
        </article>
      </section>
      <section className="panel faq-panel" id="faq">
        <h2>Frequently asked questions</h2>
        <div className="faq-list">
          {faqItems.map((item) => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </main>
  );
}
