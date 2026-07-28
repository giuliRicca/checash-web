import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import { describe, expect, it, vi } from 'vitest';

const { list } = vi.hoisted(() => ({ list: vi.fn() }));

vi.mock('~features/activity/api/activity-api', () => ({ activityApi: { list } }));

import { useActivityQuery } from '~features/activity/hooks/use-activity';

function ActivityQueryProbe(): JSX.Element {
  const { activity, pageNumber, hasPreviousPage, hasNextPage, previousPage, nextPage } = useActivityQuery('token', 'user-1', 15);

  return (
    <>
      <p>{activity.items.map((item) => item.id).join(',')}</p>
      <p>Page {pageNumber}</p>
      <button type="button" onClick={previousPage} disabled={!hasPreviousPage}>Previous</button>
      <button type="button" onClick={nextPage} disabled={!hasNextPage}>Next</button>
    </>
  );
}

describe('useActivityQuery', () => {
  it('shows one cursor page at a time and reuses cached pages', async () => {
    list
      .mockResolvedValueOnce({ items: [{ id: 'first' }], next_cursor: 'cursor-1' })
      .mockResolvedValueOnce({ items: [{ id: 'second' }], next_cursor: null });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<p>Loading</p>}>
          <ActivityQueryProbe />
        </Suspense>
      </QueryClientProvider>,
    );

    await screen.findByText('first');
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await waitFor(() => expect(screen.getByText('second')).toBeInTheDocument());
    expect(screen.getByText('Page 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(list).toHaveBeenNthCalledWith(1, 15, null, 'token');
    expect(list).toHaveBeenNthCalledWith(2, 15, 'cursor-1', 'token');

    fireEvent.click(screen.getByRole('button', { name: 'Previous' }));

    await waitFor(() => expect(screen.getByText('first')).toBeInTheDocument());
    expect(screen.getByText('Page 1')).toBeInTheDocument();
    expect(list).toHaveBeenCalledTimes(2);
  });
});
