import { ArrowRight, BadgeDollarSign, MessageCircle, WalletCards } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/ui/cn';
import { LandingThemeToggle } from './LandingThemeToggle';

interface LandingPageProps {
  fontClassName: string;
}

const primaryLinkClassName = 'inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]';
const secondaryLinkClassName = 'inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-border-strong bg-surface px-5 text-sm font-semibold text-foreground transition duration-200 hover:border-primary/60 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.98]';

const benefits = [
  {
    icon: MessageCircle,
    title: 'Registrá hablando',
    description: 'Contá qué pasó con tus palabras. CheCash prepara el movimiento para que lo revises antes de guardar.',
  },
  {
    icon: BadgeDollarSign,
    title: 'Pesos y dólares juntos',
    description: 'Seguí cuentas y movimientos en ARS o USD sin perder de vista tu patrimonio total.',
  },
  {
    icon: WalletCards,
    title: 'Todo en contexto',
    description: 'Consultá presupuestos, actividad reciente y evolución mensual desde un mismo lugar.',
  },
] as const;

export function LandingPage({ fontClassName }: LandingPageProps): JSX.Element {
  return (
    <div className={cn('min-h-[100dvh] overflow-x-hidden bg-background text-foreground', fontClassName)}>
      <a className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:not-sr-only focus:rounded-xl focus:bg-surface focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:ring-2 focus:ring-primary" href="#contenido">
        Ir al contenido
      </a>

      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
          <Link className="inline-flex min-h-11 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70" href="/" aria-label="CheCash, inicio">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground shadow-sm shadow-primary/20" aria-hidden="true">$</span>
            <span className="hidden text-xl font-bold tracking-[-0.04em] sm:inline">CheCash</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Navegación principal">
            <LandingThemeToggle />
            <Link className="hidden min-h-11 items-center rounded-xl px-3 text-sm font-semibold text-muted transition hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 md:inline-flex" href="/dashboard?auth=login">
              Ingresar
            </Link>
            <Link className={primaryLinkClassName} href="/dashboard?auth=register">
              Crear cuenta
            </Link>
          </nav>
        </div>
      </header>

      <main id="contenido">
        <section className="relative mx-auto grid min-h-[calc(100dvh-72px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:py-16">
          <div className="relative z-10 max-w-xl">
            <p className="text-sm font-semibold text-primary">Finanzas personales, en tus palabras</p>
            <h1 className="mt-5 text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.06em] text-foreground sm:text-6xl">
              Anotá tus gastos como los contás.
            </h1>
            <p className="mt-6 max-w-[36rem] text-lg leading-relaxed text-muted">
              Escribí un mensaje, confirmá el movimiento y mantené tus cuentas en pesos y dólares al día.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className={primaryLinkClassName} href="/dashboard?auth=register">
                Crear cuenta
                <ArrowRight aria-hidden="true" size={17} />
              </Link>
              <a className={secondaryLinkClassName} href="#como-funciona">
                Ver cómo funciona
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl lg:max-w-none">
            <div className="absolute -inset-5 -z-10 rounded-[2rem] bg-primary-muted/55" aria-hidden="true" />
            <div className="overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-2xl shadow-primary/10">
              <div className="flex items-center gap-2 border-b border-border bg-surface-muted/70 px-4 py-3" aria-hidden="true">
                <span className="size-2 rounded-full bg-danger/70" />
                <span className="size-2 rounded-full bg-warning/70" />
                <span className="size-2 rounded-full bg-success/70" />
                <span className="ml-2 text-xs font-medium text-muted">checash.app/chat</span>
              </div>
              <div className="relative aspect-[16/10] bg-surface">
                <Image
                  alt="Chat de CheCash con un gasto de supermercado listo para confirmar"
                  className="object-cover object-top"
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 56vw"
                  src="/images/checash-chat.webp"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="scroll-mt-24 border-y border-border bg-surface py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center lg:gap-20">
            <div className="relative overflow-hidden rounded-2xl border border-border-strong bg-background shadow-xl shadow-primary/5">
              <div className="relative aspect-[16/11]">
                <Image
                  alt="Panel de CheCash con patrimonio, ingresos, gastos y evolución mensual"
                  className="object-cover object-top"
                  fill
                  sizes="(max-width: 1023px) 100vw, 62vw"
                  src="/images/checash-dashboard.webp"
                />
              </div>
            </div>

            <div>
              <h2 className="text-balance text-4xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl">Tu plata, sin planillas.</h2>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">Del mensaje al panorama completo, sin cargar cada dato a mano.</p>
              <div className="mt-9 divide-y divide-border border-y border-border">
                {benefits.map(({ icon: Icon, title, description }) => (
                  <article className="grid grid-cols-[44px_1fr] gap-4 py-6" key={title}>
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary-muted text-primary" aria-hidden="true">
                      <Icon size={20} strokeWidth={1.8} />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
                      <p className="mt-2 leading-relaxed text-muted">{description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 rounded-2xl border border-primary/25 bg-primary-muted/55 p-7 sm:p-10 lg:flex-row lg:items-center lg:p-14">
            <div>
              <h2 className="text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Empezá con un mensaje.</h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">Creá tu cuenta y registrá tu primer movimiento con tus propias palabras.</p>
            </div>
            <Link className={cn(primaryLinkClassName, 'shrink-0')} href="/dashboard?auth=register">
              Crear cuenta
              <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-8 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold text-foreground">CheCash</p>
          <p>Finanzas personales en ARS y USD.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
