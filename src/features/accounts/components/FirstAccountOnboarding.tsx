'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Wallet } from 'lucide-react';
import { useState } from 'react';

import { ApiError } from '@/lib/api/errors';
import { Button, Field, IconBadge, Panel, fieldControlClassName } from '~components/ui';
import { accountsApi } from '~features/accounts/api/accounts-api';
import { accountsQueryKey, netWorthQueryKey } from '~features/accounts/hooks/use-accounts';
import type { Currency, RateType } from '~types/api';

export function FirstAccountOnboarding(): JSX.Element {
  const queryClient = useQueryClient();
  const [name, setName] = useState('Cash');
  const [currency, setCurrency] = useState<Currency>('ARS');
  const [openingBalance, setOpeningBalance] = useState('0.00');
  const [rateType, setRateType] = useState<RateType>('blue');
  const [error, setError] = useState<string | null>(null);

  const createAccount = useMutation({
    mutationFn: accountsApi.create,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: accountsQueryKey }),
        queryClient.invalidateQueries({ queryKey: netWorthQueryKey }),
      ]);
    },
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);

    try {
      await createAccount.mutateAsync({
        name,
        currency,
        opening_balance: openingBalance,
        rate_type: rateType,
      });
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.detail : 'Could not create account');
    }
  }

  return (
    <Panel className="border-primary/30 bg-primary-muted/30">
      <Panel.Body>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <IconBadge tone="primary">
            <Wallet size={22} />
          </IconBadge>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Create your first account</h2>
            <p className="text-sm text-muted">Chat needs an account before it can parse expenses.</p>
          </div>
        </div>
      </div>

      <form className="mt-6 grid gap-4 md:grid-cols-4" onSubmit={handleSubmit}>
        <Field className="md:col-span-2">
          <Field.Label>Name</Field.Label>
          <input
            className={fieldControlClassName}
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </Field>
        <Field>
          <Field.Label>Currency</Field.Label>
          <select
            className={fieldControlClassName}
            value={currency}
            onChange={(event) => setCurrency(event.target.value as Currency)}
          >
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
          </select>
        </Field>
        <Field>
          <Field.Label>Rate type</Field.Label>
          <select
            className={fieldControlClassName}
            value={rateType}
            onChange={(event) => setRateType(event.target.value as RateType)}
          >
            <option value="blue">Blue</option>
            <option value="mep">MEP</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </Field>
        <Field className="md:col-span-2">
          <Field.Label>Opening balance</Field.Label>
          <input
            className={fieldControlClassName}
            inputMode="decimal"
            value={openingBalance}
            onChange={(event) => setOpeningBalance(event.target.value)}
            required
          />
        </Field>
        <div className="flex items-end md:col-span-2">
          <Button className="w-full" size="lg" type="submit" disabled={createAccount.isPending}>
            {createAccount.isPending ? 'Creating...' : 'Create account'}
          </Button>
        </div>
        {error !== null ? <p className="rounded-xl border border-danger/40 bg-danger-muted px-4 py-3 text-sm text-danger md:col-span-4">{error}</p> : null}
      </form>
      </Panel.Body>
    </Panel>
  );
}

export default FirstAccountOnboarding;
