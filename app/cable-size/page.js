import { Calculator } from '@/components/Calculator';
import { LeadCapture } from '@/components/LeadCapture';
import { SiteNav } from '@/components/SiteNav';

export const metadata = {
  title: 'Cable Size Calculator (BS 7671 Iz) | EOC Tools',
  description: 'Size UK cables to BS 7671. Calculate corrected current-carrying capacity (Iz), check Ib ≤ In ≤ Iz, voltage drop and adiabatic CPC sizing in one workflow.',
  openGraph: {
    title: 'Cable Size Calculator (BS 7671 Iz)',
    description: 'Free UK cable sizing tool — design current, correction factors, voltage drop and adiabatic checks.',
    type: 'website'
  }
};

export default function CableSizePage() {
  return (
    <main className="page">
      <SiteNav current="/cable-size" />
      <section className="hero hero-slim">
        <div>
          <p className="eyebrow">BS 7671 design tool</p>
          <h1>Cable size calculator</h1>
          <p className="lead">Calculate corrected current-carrying capacity (Iz), verify the Ib ≤ In ≤ Iz device chain, voltage drop and adiabatic CPC size. Covers single-phase and three-phase circuits.</p>
        </div>
      </section>
      <Calculator />
      <LeadCapture />
    </main>
  );
}
