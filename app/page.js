import Link from 'next/link';
import { SiteNav } from '@/components/SiteNav';
import { LeadCapture } from '@/components/LeadCapture';

const tools = [
  {
    href: '/cable-size',
    title: 'Cable size (Iz)',
    description: 'Size cables to BS 7671 with correction factors for temperature, grouping and installation method. Checks the full Ib ≤ In ≤ Iz device chain.',
    tags: ['Current-carrying capacity', 'Correction factors', 'Device chain check'],
  },
  {
    href: '/voltage-drop',
    title: 'Voltage drop',
    description: 'Check voltage drop against BS 7671 Appendix 12 limits. Covers single-phase and three-phase circuits, 3% lighting and 5% power limits.',
    tags: ['mV/A/m method', '3% / 5% limits', 'Single & three-phase'],
  },
  {
    href: '/adiabatic',
    title: 'Adiabatic (CPC size)',
    description: 'Calculate the minimum protective conductor size using the adiabatic equation (BS 7671 Reg 543.1.3). Covers copper and aluminium, PVC and XLPE.',
    tags: ['S = √(I²t) ÷ k', 'BS 7671 Reg 543.1.3', 'Cu & Al / PVC & XLPE'],
  },
  {
    href: '/zs',
    title: 'Zs / disconnection',
    description: 'Look up maximum permissible earth fault loop impedance for MCB Type B/C/D, BS 88 and BS 3036 fuses. Enter measured Zs to check compliance.',
    tags: ['MCB B / C / D', 'BS 88 & BS 3036 fuses', 'Tables 41.2–41.4'],
  },
];

export const metadata = {
  title: 'Free BS 7671 Electrical Design Tools | EOC Tools',
  description: 'Free UK electrical design calculators — cable sizing, voltage drop, adiabatic CPC and Zs / disconnection checks. Built to BS 7671 by EOC London.',
  openGraph: {
    title: 'Free BS 7671 Electrical Design Tools',
    description: 'Cable size, voltage drop, adiabatic and Zs calculators for UK electricians.',
    type: 'website',
  }
};

const faqItems = [
  {
    question: 'Are these tools suitable for formal certification?',
    answer: 'No. These are preliminary design aids to support early-stage circuit design and checking. All results must be verified against the current edition of BS 7671, manufacturer data and your project-specific assumptions by a qualified electrician before any certification is issued.'
  },
  {
    question: 'Which edition of BS 7671 do these tools reference?',
    answer: 'BS 7671:2018+A2:2022 (the 18th Edition with Amendment 2). Always check you are working to the current edition.'
  },
  {
    question: 'Why is the Zs tool limited to 0.4 s disconnection?',
    answer: '0.4 s applies to socket outlet circuits and other circuits up to 32 A in TN systems — the most common domestic and light commercial scenario. 5 s values for fixed equipment and submains are not yet included. Check BS 7671 Tables 41.2–41.4 directly for 5 s values.'
  },
  {
    question: 'Who built these tools?',
    answer: 'EOC London — a London-based electrical contractor specialising in domestic, commercial and EV charging installations. We built these tools to help electricians and engineers with preliminary design checks.'
  }
];

export default function HomePage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  };

  return (
    <main className="page">
      <SiteNav />
      <section className="hero hero-slim">
        <div>
          <p className="eyebrow">Free UK electrical design tools</p>
          <h1>BS 7671 calculators for UK electricians</h1>
          <p className="lead">Cable sizing, voltage drop, adiabatic CPC and Zs / disconnection time checks. Fast, free, and referenced to BS 7671:2018+A2:2022.</p>
        </div>
      </section>

      <section className="tools-grid">
        {tools.map(tool => (
          <Link key={tool.href} href={tool.href} className="tool-card panel">
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
            <ul className="tool-tags">
              {tool.tags.map(tag => <li key={tag}>{tag}</li>)}
            </ul>
            <span className="tool-link">Open calculator →</span>
          </Link>
        ))}
      </section>

      <section className="panel faq-panel" id="faq">
        <h2>Frequently asked questions</h2>
        <div className="faq-list">
          {faqItems.map(item => (
            <details key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <LeadCapture />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </main>
  );
}
