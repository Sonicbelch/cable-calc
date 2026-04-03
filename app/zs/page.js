import { ZsClient } from './client';

export const metadata = {
  title: 'Zs / Earth Fault Loop Impedance Calculator (BS 7671) | EOC Tools',
  description: 'Look up maximum permissible earth fault loop impedance (Zs) for MCB Type B, C and D, BS 88-2 and BS 3036 fuses. Enter measured Zs to check compliance with BS 7671 Tables 41.2–41.4. Free tool by EOC London.',
  openGraph: {
    title: 'Zs / Earth Fault Loop Impedance Checker — BS 7671',
    description: 'Max Zs lookup for MCB and fuse types. Enter measured Zs for a pass/fail check. Free BS 7671 tool by EOC London.',
    type: 'website',
  }
};

export default function ZsPage() {
  return <ZsClient />;
}
