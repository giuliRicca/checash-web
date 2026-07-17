import { isValidMoneyInput } from '@/lib/money/format';
import type { CategoryRead, ChatDraft } from '~types/api';

export function getDraftValidationError(
  amount: string,
  transactionType: ChatDraft['transaction_type'],
  accountId: string,
  categoryId: string,
  destinationAccountId: string,
  rateOverride: string,
  categories: CategoryRead[],
): string | null {
  if (!isValidMoneyInput(amount)) return 'Enter an amount greater than 0.';
  if (accountId === '') return 'Select an account.';

  if (transactionType === 'transfer') {
    if (destinationAccountId === '') return 'Select a destination account.';
    if (destinationAccountId === accountId) return 'Transfer accounts must be different.';
    if (rateOverride.trim() !== '' && !isValidMoneyInput(rateOverride)) {
      return 'Rate override must be greater than 0.';
    }
    return null;
  }

  const category = categories.find((candidate) => candidate.id === categoryId);
  if (category === undefined || category.type !== transactionType) {
    return 'Select a category matching transaction type.';
  }
  return null;
}
