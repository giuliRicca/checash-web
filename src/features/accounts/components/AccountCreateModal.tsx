'use client';

import { Save, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/lib/api/errors';
import { parseMoneyInput } from '@/lib/money/format';
import { useLiveMoneyInput } from '@/lib/money/use-live-money-input';
import { Button, Field, MoneyInput, fieldControlClassName } from '~components/ui';
import { rateTypeOptions } from '~features/accounts/helpers/rate-types';
import { useCreateAccountMutation } from '~features/accounts/hooks/use-accounts';
import { useAuth } from '~features/auth';
import { usersApi } from '~features/users';
import type { AccountRead, Currency, RateType } from '~types/api';

interface AccountCreateModalProps {
  onClose: () => void;
}

function isValidOpeningBalance(value: string): boolean {
  return parseMoneyInput(value) !== '';
}

export function AccountCreateModal({ onClose }: AccountCreateModalProps): JSX.Element {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const createAccount = useCreateAccountMutation();
  const [name, setName] = useState('Cash');
  const [currency, setCurrency] = useState<Currency>('ARS');
  const { value: openingBalance, onChange: handleOpeningBalanceChange } = useLiveMoneyInput('0');
  const [rateType, setRateType] = useState<RateType>('blue');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferenceWarning, setPreferenceWarning] = useState<string | null>(null);
  const [createdAccountId, setCreatedAccountId] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const trimmedName = name.trim();
  const isOpeningBalanceValid = isValidOpeningBalance(openingBalance);
  const canSubmit = trimmedName.length > 0 && isOpeningBalanceValid && !createAccount.isPending && createdAccountId === null;
  const isDirty = trimmedName !== 'Cash' || currency !== 'ARS' || openingBalance !== '0' || rateType !== 'blue' || error !== null || preferenceWarning !== null;

  const handleClose = useCallback((): void => {
    if (!createAccount.isPending) {
      onClose();
    }
  }, [createAccount.isPending, onClose]);

  useEffect(() => {
    nameInputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        handleClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setHasSubmitted(true);

    if (!canSubmit) {
      setError(null);
      return;
    }

    setError(null);

    let account: AccountRead;
    try {
      account = await createAccount.mutateAsync({
        name: trimmedName,
        currency,
        opening_balance: parseMoneyInput(openingBalance),
        rate_type: rateType,
      });

      setCreatedAccountId(account.id);
    } catch (caughtError) {
      setError(caughtError instanceof ApiError ? caughtError.detail : 'Could not create account');
      return;
    }

    if (user?.default_account_id === null) {
      try {
        await usersApi.updatePreferences({ default_account_id: account.id });
        await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      } catch {
        setPreferenceWarning('Account created. Set default account later in settings.');
        return;
      }
    }

    onClose();
  }, [canSubmit, createAccount, currency, onClose, openingBalance, queryClient, rateType, trimmedName, user?.default_account_id]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 p-0 backdrop-blur-sm sm:items-center sm:p-4" role="presentation" onMouseDown={isDirty ? undefined : handleClose}>
      <section
        aria-labelledby="create-account-title"
        aria-modal="true"
        className="flex max-h-[calc(100dvh-1rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-border bg-surface shadow-2xl sm:max-h-[calc(100vh-2rem)] sm:rounded-2xl"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 border-b border-border bg-surface px-4 py-4 sm:px-6 sm:py-5">
          <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-border-strong sm:hidden" aria-hidden="true" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="create-account-title" className="text-2xl font-semibold text-foreground">Create account</h2>
              <p className="mt-2 text-sm text-muted">Name, currency, opening balance, exchange rate.</p>
            </div>
            <Button variant="ghost" size="icon" type="button" aria-label="Close create account" onClick={handleClose} disabled={createAccount.isPending}>
              <X size={18} />
            </Button>
          </div>
        </div>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6">
            <Field>
              <Field.Label>Name</Field.Label>
              <input ref={nameInputRef} className={fieldControlClassName} maxLength={120} required value={name} onChange={(event) => setName(event.target.value)} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <Field.Label>Currency</Field.Label>
                <select className={fieldControlClassName} value={currency} onChange={(event) => setCurrency(event.target.value as Currency)}>
                  <option value="ARS">ARS</option>
                  <option value="USD">USD</option>
                </select>
              </Field>

              <Field>
                <Field.Label>Rate type</Field.Label>
                <select className={fieldControlClassName} value={rateType} onChange={(event) => setRateType(event.target.value as RateType)}>
                  {rateTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </Field>
            </div>

            <Field>
              <Field.Label>Opening balance</Field.Label>
              <MoneyInput
                placeholder="0.00"
                value={openingBalance}
                onChange={handleOpeningBalanceChange}
                aria-invalid={hasSubmitted && !isOpeningBalanceValid}
                aria-describedby={hasSubmitted && !isOpeningBalanceValid ? 'opening-balance-error' : undefined}
              />
              {hasSubmitted && !isOpeningBalanceValid ? <Field.Error className="mt-1" id="opening-balance-error">Enter a valid opening balance.</Field.Error> : null}
            </Field>

            {error !== null ? <p className="rounded-xl border border-danger/40 bg-danger-muted px-4 py-3 text-sm text-danger" role="alert">{error}</p> : null}
            {preferenceWarning !== null ? <p className="rounded-xl border border-warning/40 bg-warning-muted px-4 py-3 text-sm text-warning" role="status">{preferenceWarning}</p> : null}
          </div>

          <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-border bg-surface px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 sm:flex-row sm:justify-end sm:px-6 sm:pb-6">
            <Button className="w-full sm:w-auto" variant="secondary" type="button" onClick={handleClose} disabled={createAccount.isPending}>Cancel</Button>
            <Button className="w-full sm:w-auto" type="submit" disabled={!canSubmit}>
              <Save size={17} />
              {createdAccountId !== null ? 'Account created' : createAccount.isPending ? 'Creating...' : 'Create account'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AccountCreateModal;
