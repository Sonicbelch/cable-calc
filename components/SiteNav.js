import Link from 'next/link';

const tools = [
  { href: '/cable-size', label: 'Cable size (Iz)' },
  { href: '/voltage-drop', label: 'Voltage drop' },
  { href: '/adiabatic', label: 'Adiabatic' },
  { href: '/zs', label: 'Zs / disconnection' },
  { href: '/ev-charging-cost', label: 'EV charging cost' },
  { href: '/pat-cert', label: 'PAT cert' },
];

export function SiteNav({ current }) {
  return (
    <nav className="site-nav">
      <Link href="https://www.eoclondon.com" className="nav-brand" target="_blank" rel="noopener">
        <img src="/eoc-BOW-logo.png" alt="Electricians On Call" className="nav-logo-full" />
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
