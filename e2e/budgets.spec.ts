import { expect, test } from '@playwright/test';

interface Budget {
  id: string;
  category_id: string;
  category_name: string;
  amount: string;
  currency: 'ARS' | 'USD';
  spent: string;
  remaining: string;
  percentage: string;
  status: 'on_track' | 'at_limit' | 'over_budget';
  created_at: string;
}

test.use({ viewport: { width: 390, height: 844 } });

test('creates, edits, and deletes a budget from responsive modal flow', async ({ page }) => {
  let budgets: Budget[] = [];
  const requests: Array<{ method: string; body: unknown }> = [];

  await page.addInitScript(() => window.localStorage.setItem('checash.access_token', 'test-token'));
  await page.route('**/api/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/api/auth/me') return route.fulfill({ json: { id: 'user-1', email: 'test@example.com', default_account_id: null, default_category_id: null } });
    if (path === '/api/categories') return route.fulfill({ json: [{ id: 'category-food', user_id: null, name: 'Food', slug: 'food', type: 'expense', is_system: true }] });
    if (path === '/api/budgets/month-summary' && request.method() === 'GET') return route.fulfill({ json: budgets });

    if (path === '/api/budgets' && request.method() === 'POST') {
      const body = request.postDataJSON() as { category_id: string; amount: string; currency: 'ARS' | 'USD' };
      requests.push({ method: 'POST', body });
      budgets = [{ id: 'budget-1', category_id: body.category_id, category_name: 'Food', amount: body.amount, currency: body.currency, spent: '25.00', remaining: '75.00', percentage: '25.00', status: 'on_track', created_at: '2026-07-01T00:00:00Z' }];
      return route.fulfill({ status: 201, json: budgets[0] });
    }
    if (path === '/api/budgets/budget-1' && request.method() === 'PATCH') {
      const body = request.postDataJSON() as { amount: string; currency: 'ARS' | 'USD' };
      requests.push({ method: 'PATCH', body });
      budgets = [{ ...budgets[0], amount: body.amount, currency: body.currency, remaining: '175.00' }];
      return route.fulfill({ json: budgets[0] });
    }
    if (path === '/api/budgets/budget-1' && request.method() === 'DELETE') {
      requests.push({ method: 'DELETE', body: null });
      budgets = [];
      return route.fulfill({ status: 204 });
    }
    return route.fulfill({ status: 404, json: { detail: 'Not found' } });
  });

  await page.goto('/budgets');
  await page.getByRole('button', { name: 'Add first budget' }).click();
  await page.getByLabel('Monthly limit').fill('100');
  await page.getByRole('button', { name: 'Create budget' }).click();
  await expect(page.getByText('Food')).toBeVisible();
  await expect(page.getByRole('img', { name: /Current UTC month ARS budget allocation/ })).toBeVisible();

  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Monthly limit').fill('200');
  await page.getByRole('button', { name: 'Save budget' }).click();
  await expect(page.getByText('ARS 25,00 of ARS 200,00', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('alertdialog', { name: 'Delete Food budget?' })).toBeVisible();
  await page.getByRole('button', { name: 'Delete budget' }).click();
  await expect(page.getByText('No budgets yet')).toBeVisible();
  expect(requests).toEqual([
    { method: 'POST', body: { category_id: 'category-food', amount: '100.00', currency: 'ARS' } },
    { method: 'PATCH', body: { amount: '200.00', currency: 'ARS' } },
    { method: 'DELETE', body: null },
  ]);
});
