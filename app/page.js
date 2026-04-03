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
    question: 'How do I size a cable to BS 7671?',
    answer: 'Cable sizing to BS 7671 involves five steps: (1) Calculate the design current Ib from the load. (2) Select a protective device rating In ≥ Ib. (3) Apply correction factors for ambient temperature (Ca), grouping (Cg), thermal insulation (Ci) and installation method (Cm) to find the required tabulated current It = In ÷ (Ca × Cg × Ci × Cm). (4) Select the smallest cable whose tabulated current-carrying capacity ≥ It. (5) Verify voltage drop and adiabatic checks pass. Our cable size calculator automates all five steps.'
  },
  {
    question: 'What is the voltage drop limit for a power circuit in BS 7671?',
    answer: 'BS 7671 Appendix 12 sets the default maximum voltage drop at 5% of the nominal supply voltage for power circuits — that is 11.5 V on a 230 V single-phase supply or 20 V on a 400 V three-phase supply. For lighting circuits the limit is 3% (6.9 V on 230 V). These are default limits; tighter limits may apply for sensitive equipment or where the designer specifies otherwise.'
  },
  {
    question: 'What is the adiabatic equation and when do I use it?',
    answer: 'The adiabatic equation (BS 7671 Reg 543.1.3) is S = (I²t)^0.5 ÷ k, where S is the minimum conductor cross-sectional area in mm², I is the fault current in amps, t is the disconnection time in seconds, and k is a material constant from BS 7671 Tables 54.2–54.4 (115 for copper/PVC, 143 for copper/XLPE). It is used to verify that the CPC (earth wire) can withstand the energy of a fault without damage.'
  },
  {
    question: 'What is Zs and why does it matter?',
    answer: 'Zs is the earth fault loop impedance — the total impedance of the path that fault current follows from the source, through the protective conductor, and back to source. A lower Zs means more fault current flows, which causes the protective device to operate faster. BS 7671 Tables 41.2–41.4 give maximum permissible Zs values for each device type and rating to ensure disconnection within the required time (0.4 s for socket circuits, 5 s for fixed equipment in TN systems).'
  },
  {
    question: 'Why is the Zs tool limited to 0.4 s disconnection?',
    answer: '0.4 s applies to socket outlet circuits and other circuits up to 32 A in TN systems — the most common domestic and light commercial scenario. 5 s values for fixed equipment and submains are not yet included. Check BS 7671 Tables 41.2–41.4 directly for 5 s values.'
  },
  {
    question: 'Who built these tools?',
    answer: 'EOC London — a London-based electrical contractor specialising in domestic, commercial and EV charging installations across London. We built these tools to help electricians and engineers with preliminary BS 7671 design checks.'
  }
];

export default function HomePage() {
  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'EOC BS 7671 Electrical Design Tools',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    url: 'https://tools.eoclondon.com',
    description: 'Free BS 7671 cable sizing, voltage drop, adiabatic CPC and Zs calculators for UK electricians and electrical designers.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'GBP' },
    author: { '@type': 'Organization', name: 'Electricians On Call', url: 'https://www.eoclondon.com' },
  };

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
    </main>
  );
}
