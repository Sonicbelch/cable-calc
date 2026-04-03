import Link from 'next/link';
import Image from 'next/image';

const tools = [
  { href: '/cable-size', label: 'Cable size (Iz)' },
  { href: '/voltage-drop', label: 'Voltage drop' },
  { href: '/adiabatic', label: 'Adiabatic' },
  { href: '/zs', label: 'Zs / disconnection' },
];

const EOC_LOGO_ICON = 'https://cdn.prod.website-files.com/647c5a25017a9563bc923398/64b1f4561aecdee44bf09096_EOCslateblueAsset%2043.svg';
const EOC_LOGO_TEXT = 'https://cdn.prod.website-files.com/647c5a25017a9563bc923398/64b24285a3284e103ea84337_EOCslateblueAsset%2047.svg';

export function SiteNav({ current }) {
  return (
    <nav className="site-nav">
      <Link href="https://www.eoclondon.com" className="nav-brand" target="_blank" rel="noopener">
        <img src={EOC_LOGO_ICON} alt="EOC motorbike logo" className="nav-logo-icon" height="36" />
        <img src={EOC_LOGO_TEXT} alt="Electricians On Call" className="nav-logo-text" height="22" />
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
