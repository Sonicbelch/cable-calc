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
      <Link href="/" className="nav-brand">
        <span className="nav-brand-eoc">EOC</span> Tools
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
