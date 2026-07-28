'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { formatCompactMoneyAmount, formatMoneyWithCurrency } from '@/lib/money/format';
import { Panel } from '~components/ui';
import type { Currency, NetWorthHistoryRead } from '~types/api';

interface NetWorthGrowthChartProps {
  currency: Currency;
  history: NetWorthHistoryRead;
}

interface ChartPoint {
  date: string;
  value: number;
}

function formatDate(value: string, options: Intl.DateTimeFormatOptions): string {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('es-AR', options).format(new Date(year, month - 1, day));
}

function getChartPoints(history: NetWorthHistoryRead, currency: Currency): ChartPoint[] {
  return history.points.map((point) => ({
    date: point.date,
    value: Number(currency === 'ARS' ? point.total_ars : point.total_usd),
  }));
}

export function NetWorthGrowthChart({ currency, history }: NetWorthGrowthChartProps): JSX.Element {
  const points = getChartPoints(history, currency);
  const firstPoint = points.at(0);
  const lastPoint = points.at(-1);
  const change = firstPoint !== undefined && lastPoint !== undefined ? lastPoint.value - firstPoint.value : null;

  return (
    <Panel>
      <Panel.Header className="flex flex-col gap-2 border-b-0 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Net worth growth</p>
          <p className="mt-1 text-sm text-muted">Current month in {currency}</p>
        </div>
        {change === null ? null : (
          <p className={change >= 0 ? 'text-sm font-bold text-success' : 'text-sm font-bold text-danger'}>
            {change >= 0 ? '+' : ''}{formatMoneyWithCurrency(change, currency)}
          </p>
        )}
      </Panel.Header>
      <Panel.Body className="pt-0">
        {points.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-surface-muted px-6 text-center text-sm text-muted">
            Add an active account to see net worth growth.
          </div>
        ) : (
          <>
            <div className="h-64" role="img" aria-label={`Net worth trend from ${formatMoneyWithCurrency(firstPoint?.value ?? null, currency)} to ${formatMoneyWithCurrency(lastPoint?.value ?? null, currency)}`}>
              <ResponsiveContainer height="100%" width="100%">
                <AreaChart data={points} margin={{ top: 16, right: 8, bottom: 0, left: 4 }}>
                  <defs>
                    <linearGradient id="net-worth-growth-fill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 5" vertical={false} />
                  <XAxis
                    axisLine={false}
                    dataKey="date"
                    minTickGap={28}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value: string) => formatDate(value, { day: 'numeric', month: 'short' })}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value: number) => formatCompactMoneyAmount(value)}
                    tickLine={false}
                    width={62}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--surface-elevated))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '12px',
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value) => formatMoneyWithCurrency(Number(value), currency)}
                    labelFormatter={(value) => formatDate(String(value), { day: 'numeric', month: 'long', year: 'numeric' })}
                  />
                  <Area
                    dataKey="value"
                    fill="url(#net-worth-growth-fill)"
                    fillOpacity={1}
                    isAnimationActive={false}
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    type="monotone"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </Panel.Body>
    </Panel>
  );
}

export default NetWorthGrowthChart;
