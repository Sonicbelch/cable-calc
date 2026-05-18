import { MinorWorksCertClient } from './client';

export const metadata = {
  title: 'Minor Works Certificate Generator | EOC Tools',
  description: 'Generate a BS 7671-compliant Minor Electrical Installation Works Certificate. Complete installation details, test results and declaration, then print a clean A4 certificate. Free tool by EOC London.',
  openGraph: {
    title: 'Minor Works Certificate Generator — EOC Tools',
    description: 'Create BS 7671 Minor Electrical Installation Works Certificates online. Enter test results and declaration, then print a clean A4 certificate.',
    type: 'website',
  },
};

export default function MinorWorksCertPage() {
  return <MinorWorksCertClient />;
}
