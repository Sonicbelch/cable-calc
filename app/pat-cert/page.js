import { PATCertClient } from './client';

export const metadata = {
  title: 'PAT Certificate Generator | EOC Tools',
  description: 'Generate a professional PAT (Portable Appliance Testing) certificate. Enter appliance test results and print a clean A4 PAT certificate. Free tool by EOC London.',
  openGraph: {
    title: 'PAT Certificate Generator — EOC Tools',
    description: 'Create PAT test certificates online. Enter appliance details, visual and electrical test results, then print a clean A4 certificate.',
    type: 'website',
  },
};

export default function PATCertPage() {
  return <PATCertClient />;
}
