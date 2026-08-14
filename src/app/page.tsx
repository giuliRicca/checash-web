import type { Metadata } from 'next';
import { Geist } from 'next/font/google';

import { LandingPage } from '~features/landing';

const geist = Geist({
  display: 'swap',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CheCash | Tus finanzas, en tus palabras',
  description: 'Registrá movimientos por chat y controlá cuentas, presupuestos y patrimonio en pesos y dólares.',
};

export default function HomePage(): JSX.Element {
  return <LandingPage fontClassName={geist.className} />;
}
