import './globals.css';

const GA_ID = 'G-LHQ0QXW39V';

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
      <head>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
        <script dangerouslySetInnerHTML={{ __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { cookie_flags: 'SameSite=None;Secure' });
        `}} />
      </head>
      <body>
        {children}
        <footer style={{textAlign:'center',padding:'24px 16px',marginTop:'40px',fontSize:'0.85rem',color:'#666',borderTop:'1px solid #e5e7eb'}}>
          Any comments or suggestions? Get in touch — <a href="mailto:info@eoclondon.com" style={{color:'#1a73e8'}}>info@eoclondon.com</a>
        </footer>
      </body>
    </html>
  );
}
