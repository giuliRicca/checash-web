import { DollarSign, Landmark, WalletCards } from 'lucide-react';

import { IconBadge, MetricCard, Panel } from '~components/ui';
import type { AccountRead, NetWorthRead } from '~types/api';

interface AccountsOverviewProps {
  accounts: AccountRead[];
  netWorth: NetWorthRead;
}

function formatMoney(value: string, currency: string): string {
  return `${currency} ${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function AccountsOverview({ accounts, netWorth }: AccountsOverviewProps): JSX.Element {
  return (
    <section className="flex flex-col gap-5 sm:gap-8">
      <div className="grid gap-3 md:grid-cols-2">
        <MetricCard icon={<DollarSign size={22} />} label="Net Worth ARS" tone="primary" trend="ARS" value={formatMoney(netWorth.total_ars, 'ARS')} />
        <MetricCard icon={<DollarSign size={22} />} label="Net Worth USD" tone="success" trend="USD" value={formatMoney(netWorth.total_usd, 'USD')} />
      </div>

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
            <article key={account.id} className="rounded-2xl border border-border bg-surface-elevated p-4 shadow-sm">
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
              <p className="mt-5 text-2xl font-bold tracking-tight text-foreground md:text-xl">{formatMoney(account.balance, account.currency)}</p>
            </article>
          ))}
          </div>
        </Panel.Body>
      </Panel>
    </section>
  );
}

export default AccountsOverview;
