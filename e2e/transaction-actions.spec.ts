import { expect, test } from '@playwright/test';

test('edits and deletes a transaction from dashboard activity', async ({ page }) => {
  let transactionExists = true;
  const requests: Array<{ method: string; body: unknown }> = [];

  await page.addInitScript(() => window.localStorage.setItem('checash.access_token', 'test-token'));
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/api/auth/me') return route.fulfill({ json: { id: 'user-1', email: 'test@example.com', default_account_id: null, default_category_id: null } });
    if (path === '/api/accounts') return route.fulfill({ json: [{ id: 'account-1', name: 'Cash', currency: 'ARS', opening_balance: '100.00', balance: '80.00', rate_type: 'blue', archived_at: null }] });
    if (path === '/api/accounts/net-worth') return route.fulfill({ json: { total_ars: '80.00', total_usd: '0.08' } });
    if (path === '/api/accounts/net-worth/history') return route.fulfill({ json: { month_start: '2026-07-01', points: [] } });
    if (path === '/api/transactions/month-summary') return route.fulfill({ json: { month_start: '2026-07-01T00:00:00Z', month_end: '2026-08-01T00:00:00Z', income_ars: '0.00', income_usd: '0.00', expense_ars: '20.00', expense_usd: '0.00' } });
    if (path === '/api/budgets/month-summary') return route.fulfill({ json: [] });
    if (path === '/api/categories') return route.fulfill({ json: [{ id: 'category-1', user_id: null, name: 'Food', slug: 'food', type: 'expense', is_system: true }] });
    if (path === '/api/activity') return route.fulfill({ json: { items: transactionExists ? [{ kind: 'transaction', id: 'transaction-1', created_at: '2026-07-21T12:00:00Z', occurred_at: '2026-07-21T12:00:00Z', account_id: 'account-1', source_account_id: null, destination_account_id: null, amount: '20.00', account_amount: '20.00', currency: 'ARS', account_currency: 'ARS', source_amount: null, source_currency: null, destination_amount: null, destination_currency: null, rate_used: null, is_adjustment: false, transaction_type: 'expense', category_id: 'category-1', category_name: 'Food', description: 'Groceries' }] : [], next_cursor: null } });
    if (path === '/api/transactions/transaction-1' && request.method() === 'PATCH') {
      requests.push({ method: 'PATCH', body: request.postDataJSON() });
      return route.fulfill({ json: { id: 'transaction-1', account_id: 'account-1', category_id: 'category-1', category_name_snapshot: 'Food', amount: '30.00', account_amount: '30.00', currency: 'ARS', rate_used: null, is_adjustment: false, type: 'expense', description: 'Groceries', created_at: '2026-07-21T12:00:00Z', occurred_at: '2026-07-21T12:00:00Z' } });
    }
    if (path === '/api/transactions/transaction-1' && request.method() === 'DELETE') {
      requests.push({ method: 'DELETE', body: null });
      transactionExists = false;
      return route.fulfill({ status: 204 });
    }
    return route.fulfill({ status: 404, json: { detail: 'Not found' } });
  });

  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Amount').fill('30');
  await page.getByRole('button', { name: 'Save transaction' }).click();
  await expect(page.getByRole('listitem').getByText('ARS 20,00', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('alertdialog', { name: 'Delete this transaction?' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete transaction' }).click();
  await expect(page.getByText('No activity yet. Add a transaction or transfer to see it here.')).toBeVisible();
  expect(requests).toHaveLength(2);
  expect(requests[0]?.method).toBe('PATCH');
  expect(requests[0]?.body).toEqual(expect.objectContaining({ amount: '30.00', currency: 'ARS' }));
  expect(requests[1]).toEqual({ method: 'DELETE', body: null });
});
