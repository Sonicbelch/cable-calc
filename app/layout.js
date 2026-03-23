import './globals.css';

export const metadata = {
  metadataBase: new URL('https://tools.eoclondon.com'),
  title: {
    default: 'Free BS 7671 Electrical Design Tools | EOC Tools',
    template: '%s | EOC Tools'
  },
  description: 'Free UK electrical design calculators — cable sizing, voltage drop, adiabatic CPC and Zs / disconnection checks. Built to BS 7671 by EOC London.',
  openGraph: {
    siteName: 'EOC Tools',
    type: 'website',
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
