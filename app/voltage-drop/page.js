import { VoltageDropClient } from './client';

export const metadata = {
  title: 'Voltage Drop Calculator (BS 7671) | EOC Tools',
  description: 'Check cable voltage drop against BS 7671 Appendix 12 limits. Enter cable size, design current and run length for single-phase or three-phase circuits. Free tool by EOC London.',
  openGraph: {
    title: 'Voltage Drop Calculator — BS 7671 Appendix 12',
    description: 'Check voltage drop for any UK cable circuit. 3% lighting and 5% power limits. Free tool by EOC London.',
    type: 'website',
  }
};

export default function VoltageDropPage() {
  return <VoltageDropClient />;
}
