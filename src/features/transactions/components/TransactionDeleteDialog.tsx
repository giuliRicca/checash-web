'use client';

import { useEffect, useRef, useState } from 'react';

import { ApiError } from '@/lib/api/errors';
import { Button } from '~components/ui';
import { useDeleteTransactionMutation } from '~features/transactions/hooks/use-transaction-mutations';
import type { ActivityItem } from '~types/api';

interface TransactionDeleteDialogProps { transaction: ActivityItem; onClose: () => void; }

export function TransactionDeleteDialog({ transaction, onClose }: TransactionDeleteDialogProps): JSX.Element {
  const deleteTransaction = useDeleteTransactionMutation();
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => { dialogRef.current?.querySelector<HTMLButtonElement>('[data-cancel]')?.focus(); }, []);

  async function handleDelete(): Promise<void> {
    setError(null);
    try { await deleteTransaction.mutateAsync(transaction.id); onClose(); } catch (caughtError) { setError(caughtError instanceof ApiError ? caughtError.detail : 'Could not delete transaction'); }
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" role="presentation" onMouseDown={deleteTransaction.isPending ? undefined : onClose}><section ref={dialogRef} aria-labelledby="delete-transaction-title" aria-modal="true" className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl" role="alertdialog" onMouseDown={(event) => event.stopPropagation()}><h2 id="delete-transaction-title" className="text-lg font-semibold text-foreground">Delete this transaction?</h2><p className="mt-2 text-sm text-muted">Its account balance, monthly totals, and budgets will recalculate.</p>{error === null ? null : <p className="mt-4 rounded-xl border border-danger/40 bg-danger-muted px-4 py-3 text-sm text-danger" role="alert">{error}</p>}<div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button data-cancel variant="secondary" type="button" onClick={onClose} disabled={deleteTransaction.isPending}>Cancel</Button><Button variant="danger" type="button" onClick={() => void handleDelete()} disabled={deleteTransaction.isPending}>{deleteTransaction.isPending ? 'Deleting...' : 'Delete transaction'}</Button></div></section></div>;
}

export default TransactionDeleteDialog;
