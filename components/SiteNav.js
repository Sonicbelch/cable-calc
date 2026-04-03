import Link from 'next/link';

const tools = [
  { href: '/cable-size', label: 'Cable size (Iz)' },
  { href: '/voltage-drop', label: 'Voltage drop' },
  { href: '/adiabatic', label: 'Adiabatic' },
  { href: '/zs', label: 'Zs / disconnection' },
];

export function SiteNav({ current }) {
  return (
    <nav className="site-nav">
      <Link href="https://www.eoclondon.com" className="nav-brand" target="_blank" rel="noopener">
        <img src="https://cdn.prod.website-files.com/647c5a25017a9563bc923398/64b1f4561aecdee44bf09096_EOCslateblueAsset%2043.svg" alt="EOC motorbike logo" className="nav-logo-icon" />
        <img src="https://cdn.prod.website-files.com/647c5a25017a9563bc923398/64b1f46a528b9b651d0b270a_EOCslateblueAsset%2040.svg" alt="Electricians On Call" className="nav-logo-text" />
      </Link>
      <div className="nav-links">
        {tools.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={`nav-link${current === t.href ? ' active' : ''}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
