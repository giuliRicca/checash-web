import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ActivityList, PaginatedActivityList } from '~features/activity/components/ActivityList';
import type { ActivityItem } from '~types/api';

function activityItem(overrides: Partial<ActivityItem>): ActivityItem {
  return {
    kind: 'transaction',
    id: 'transaction-1',
    created_at: '2026-07-22T12:00:00Z',
    occurred_at: '2026-07-22T12:00:00Z',
    account_id: 'account-1',
    source_account_id: null,
    destination_account_id: null,
    amount: '25.00',
    account_amount: '25.00',
    currency: 'ARS',
    account_currency: 'ARS',
    source_amount: null,
    source_currency: null,
    destination_amount: null,
    destination_currency: null,
    rate_used: null,
    is_adjustment: false,
    transaction_type: 'expense',
    category_id: 'category-1',
    category_name: 'Food',
    description: 'Groceries',
    ...overrides,
  };
}

describe('ActivityList', () => {
  it('keeps empty latest activity visible without pagination controls', () => {
    render(<ActivityList activity={{ items: [], next_cursor: null }} emptyMessage="No activity yet." hasMore={false} isLoadingMore={false} loadMoreError={null} onLoadMore={vi.fn()} title="Latest activity" />);

    expect(screen.getByText('No activity yet.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument();
  });

  it('renders transaction and transfer rows, then loads next page', () => {
    const onLoadMore = vi.fn();
    render(<ActivityList activity={{
      items: [
        activityItem({}),
        activityItem({ id: 'transfer-1', kind: 'transfer', occurred_at: null, account_id: null, amount: null, account_amount: null, currency: null, account_currency: null, transaction_type: null, category_id: null, category_name: null, description: 'Move cash', source_account_id: 'account-1', destination_account_id: 'account-2', source_amount: '10.00', source_currency: 'ARS', destination_amount: '10.00', destination_currency: 'USD' }),
      ],
      next_cursor: 'next',
    }} emptyMessage="No activity yet." hasMore isLoadingMore={false} loadMoreError={null} onLoadMore={onLoadMore} title="Latest activity" />);

    expect(screen.getByRole('heading', { name: 'Expense', level: 3 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Transfer', level: 3 })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(onLoadMore).toHaveBeenCalledOnce();
  });

  it('shows edit/delete only for regular transactions', () => {
    render(<ActivityList activity={{
      items: [
        activityItem({ id: 'transaction-1' }),
        activityItem({ id: 'adjustment-1', is_adjustment: true }),
        activityItem({ id: 'transfer-1', kind: 'transfer', occurred_at: null, account_id: null, amount: null, account_amount: null, currency: null, account_currency: null, transaction_type: null, category_id: null, category_name: null, source_account_id: 'account-1', destination_account_id: 'account-2', source_amount: '10.00', source_currency: 'ARS', destination_amount: '10.00', destination_currency: 'USD' }),
      ],
      next_cursor: null,
    }} emptyMessage="No activity yet." hasMore={false} isLoadingMore={false} loadMoreError={null} onLoadMore={vi.fn()} title="Latest activity" />);

    expect(screen.getAllByRole('button', { name: 'Edit' })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: 'Delete' })).toHaveLength(1);
  });

  it('disables pagination while loading and exposes error feedback', () => {
    render(<ActivityList activity={{ items: [activityItem({})], next_cursor: 'next' }} emptyMessage="No activity yet." hasMore isLoadingMore loadMoreError="Could not load more activity. Try again." onLoadMore={vi.fn()} title="Latest activity" />);

    expect(screen.getByRole('button', { name: 'Loading more activity...' })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent('Could not load more activity. Try again.');
  });
});

describe('PaginatedActivityList', () => {
  it('shows page controls without appending earlier page rows', () => {
    const onPreviousPage = vi.fn();
    const onNextPage = vi.fn();
    render(<PaginatedActivityList activity={{ items: [activityItem({ id: 'page-two', description: 'Second page item' })], next_cursor: null }} emptyMessage="No activity yet." hasNextPage={false} hasPreviousPage isLoadingPage={false} onNextPage={onNextPage} onPreviousPage={onPreviousPage} pageError={null} pageNumber={2} title="Latest activity" />);

    expect(screen.getByText('Page 2')).toBeInTheDocument();
    expect(screen.getByText('Second page item')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));
    expect(onPreviousPage).toHaveBeenCalledOnce();
  });
});
