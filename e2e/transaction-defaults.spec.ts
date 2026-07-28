import { expect, test } from '@playwright/test';

test('uses valid saved defaults for a new expense transaction', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('checash.access_token', 'test-token'));
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/auth/me') return route.fulfill({ json: { id: 'user-1', email: 'test@example.com', default_account_id: 'account-2', default_category_id: 'category-2' } });
    if (path === '/api/accounts') return route.fulfill({ json: [
      { id: 'account-1', name: 'Cash', currency: 'ARS', opening_balance: '100.00', balance: '100.00', rate_type: 'blue', archived_at: null },
      { id: 'account-2', name: 'Dollar account', currency: 'USD', opening_balance: '10.00', balance: '10.00', rate_type: 'blue', archived_at: null },
    ] });
    if (path === '/api/categories') return route.fulfill({ json: [
      { id: 'category-1', user_id: null, name: 'Miscellaneous', slug: 'miscellaneous', type: 'expense', is_system: true },
      { id: 'category-2', user_id: null, name: 'Food', slug: 'food', type: 'expense', is_system: true },
    ] });
    if (path === '/api/activity') return route.fulfill({ json: { items: [], next_cursor: null } });
    if (path === '/api/accounts/net-worth') return route.fulfill({ json: { total_ars: '0.00', total_usd: '0.00' } });
    if (path === '/api/accounts/net-worth/history') return route.fulfill({ json: { month_start: '2026-07-01', points: [] } });
    if (path === '/api/transactions/month-summary') return route.fulfill({ json: { month_start: '2026-07-01T00:00:00Z', month_end: '2026-08-01T00:00:00Z', income_ars: '0.00', income_usd: '0.00', expense_ars: '0.00', expense_usd: '0.00' } });
    if (path === '/api/budgets/month-summary') return route.fulfill({ json: [] });
    return route.fulfill({ status: 404, json: { detail: 'Not found' } });
  });

  await page.goto('/');
  await page.getByRole('button', { name: /add transaction/i }).click();

  await expect(page.getByLabel('Account')).toHaveValue('account-2');
  await expect(page.getByLabel('Category')).toHaveValue('category-2');
  await expect(page.getByLabel('Add expense').getByRole('button', { name: 'USD' })).toHaveAttribute('aria-pressed', 'true');
});
