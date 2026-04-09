import { EVChargingClient } from './client';

export const metadata = {
  title: 'EV Charging Cost Calculator UK | EOC Tools',
  description: 'Calculate how much it costs to charge your electric vehicle at home in the UK. Enter your EV model, electricity tariff and battery level for instant cost estimates.',
  openGraph: {
    title: 'EV Charging Cost Calculator — UK Home Charging',
    description: 'Find out what it costs to charge your EV at home. Covers Tesla, Nissan Leaf, VW ID.3, BMW i3, Hyundai Ioniq 5 and more. Free tool by EOC London.',
    type: 'website',
  }
};

export default function EVChargingCostPage() {
  return <EVChargingClient />;
}
