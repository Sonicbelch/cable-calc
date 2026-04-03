import { AdiabaticClient } from './client';

export const metadata = {
  title: 'Adiabatic CPC Size Calculator (BS 7671 Reg 543.1.3) | EOC Tools',
  description: 'Calculate the minimum protective conductor (CPC / earth wire) size using the BS 7671 adiabatic equation S = (I²t)^0.5 ÷ k. Covers copper and aluminium, PVC and XLPE. Free tool by EOC London.',
  openGraph: {
    title: 'Adiabatic CPC Size Calculator — BS 7671 Reg 543.1.3',
    description: 'Calculate minimum earth / CPC size from fault current and disconnection time. Free BS 7671 tool by EOC London.',
    type: 'website',
  }
};

export default function AdiabaticPage() {
  return <AdiabaticClient />;
}
