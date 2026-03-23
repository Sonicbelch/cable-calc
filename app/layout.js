import './globals.css';

export const metadata = {
  metadataBase: new URL('https://example.com'),
  title: 'BS 7671 Cable Size Calculator | UK Cable Sizing Tool',
  description: 'Free UK BS 7671 cable size calculator for current-carrying capacity, voltage drop and adiabatic checks.',
  openGraph: {
    title: 'BS 7671 Cable Size Calculator',
    description: 'Size UK cables with BS 7671-style design checks for Ib, In, Iz, voltage drop and adiabatic sizing.',
    type: 'website'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
