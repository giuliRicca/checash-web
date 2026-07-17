import { DollarSign, Landmark, WalletCards } from 'lucide-react';
import Link from 'next/link';

import { formatMoneyWithCurrency } from '@/lib/money/format';
import { IconBadge, Panel } from '~components/ui';
import type { AccountRead } from '~types/api';

interface AccountsOverviewProps {
  accounts: AccountRead[];
}

export function AccountsOverview({ accounts }: AccountsOverviewProps): JSX.Element {
  return (
    <section className="flex flex-col gap-5 sm:gap-8">
      <Panel>
        <Panel.Header className="flex items-center justify-between gap-4">
          <Panel.Title>Accounts</Panel.Title>
          <IconBadge>
            <Landmark size={20} />
          </IconBadge>
        </Panel.Header>
        <Panel.Body>
          <div className="grid gap-3 md:grid-cols-3">
          {accounts.map((account) => (
            <Link key={account.id} className="block rounded-2xl border border-border bg-surface-elevated p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background" href={`/accounts/${account.id}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <IconBadge className="size-10" tone={account.currency === 'ARS' ? 'primary' : 'success'}>
                    {account.currency === 'ARS' ? <DollarSign size={18} /> : <WalletCards size={18} />}
                  </IconBadge>
                  <div>
                    <h3 className="font-semibold text-foreground">{account.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{account.rate_type}</p>
                  </div>
                </div>
                <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-muted">{account.currency}</span>
              </div>
              <p className="mt-5 text-2xl font-bold tracking-tight text-foreground md:text-xl">{formatMoneyWithCurrency(account.balance, account.currency)}</p>
            </Link>
          ))}
          </div>
        </Panel.Body>
      </Panel>
    </section>
  );
}

export default AccountsOverview;
