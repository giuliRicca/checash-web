'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { formatMoneyWithCurrency } from '@/lib/money/format';
import { Panel } from '~components/ui';
import { groupBudgetChartRows } from '~features/budgets/helpers/budget-summary';
import type { BudgetMonthSummary, Currency } from '~types/api';

interface BudgetChartProps {
  budgets: BudgetMonthSummary[];
}

function CurrencyBudgetChart({ currency, budgets }: { currency: Currency; budgets: ReturnType<typeof groupBudgetChartRows>[Currency] }): JSX.Element | null {
  if (budgets.length === 0) return null;

  const total = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const summary = budgets.map((budget) => `${budget.categoryName}: ${formatMoneyWithCurrency(budget.amount, currency)}, ${((budget.amount / total) * 100).toFixed(0)} percent`).join('. ');

  return (
    <section aria-labelledby={`budget-chart-${currency}`}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id={`budget-chart-${currency}`} className="text-base font-semibold text-foreground">{currency} allocation</h3>
        <p className="text-sm text-muted">{formatMoneyWithCurrency(total, currency)} total</p>
      </div>
      <div className="mt-3" role="img" aria-label={`Current UTC month ${currency} budget allocation. Total ${formatMoneyWithCurrency(total, currency)}. ${summary}`}>
        <ResponsiveContainer height={264} width="100%">
          <PieChart>
            <Tooltip
              contentStyle={{ background: 'hsl(var(--surface-elevated))', border: '1px solid hsl(var(--border))', borderRadius: '12px', color: 'hsl(var(--foreground))' }}
              formatter={(value) => formatMoneyWithCurrency(Number(value), currency)}
            />
            <Pie cx="50%" cy="50%" data={budgets} dataKey="amount" innerRadius="56%" outerRadius="82%" nameKey="categoryName" paddingAngle={2} stroke="hsl(var(--surface))" strokeWidth={2}>
              {budgets.map((budget) => <Cell fill={budget.color} key={budget.id} />)}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="grid gap-2 text-sm sm:grid-cols-2">
        {budgets.map((budget) => <li className="flex items-center justify-between gap-3" key={budget.id}><span className="flex min-w-0 items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: budget.color }} /><span className="truncate text-muted">{budget.categoryName}</span></span><span className="shrink-0 font-medium text-foreground">{formatMoneyWithCurrency(budget.amount, currency)}</span></li>)}
      </ul>
    </section>
  );
}

export function BudgetChart({ budgets }: BudgetChartProps): JSX.Element | null {
  const groups = groupBudgetChartRows(budgets);
  if (groups.ARS.length === 0 && groups.USD.length === 0) return null;

  return (
    <Panel>
      <Panel.Header>
        <Panel.Title>Budget allocation</Panel.Title>
        <p className="mt-1 text-sm text-muted">Current UTC month limits by category. Currencies shown separately.</p>
      </Panel.Header>
      <Panel.Body className="grid gap-8">
        <CurrencyBudgetChart currency="ARS" budgets={groups.ARS} />
        <CurrencyBudgetChart currency="USD" budgets={groups.USD} />
      </Panel.Body>
    </Panel>
  );
}

export default BudgetChart;
