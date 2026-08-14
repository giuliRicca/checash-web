import { expect, test } from '@playwright/test';

test('shows login form for unauthenticated visitor', async ({ page }) => {
  await page.goto('/dashboard?auth=login');

  await expect(page.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();
});

test('opens registration form from registration link', async ({ page }) => {
  await page.goto('/dashboard?auth=register');

  await expect(page.getByRole('heading', { name: 'Creá tu cuenta' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible();
});

test('passes dynamic route account ID to account APIs', async ({ page }) => {
  const accountId = 'be0d5adc-0015-4157-8e1f-1cc31379dd04';
  const requestedPaths: string[] = [];

  await page.addInitScript(() => {
    window.localStorage.setItem('checash.access_token', 'test-token');
  });
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    requestedPaths.push(path);

    if (path === '/api/auth/me') {
      await route.fulfill({ json: { id: 'user-1', email: 'test@example.com', default_account_id: null, default_category_id: null } });
      return;
    }
    if (path === `/api/accounts/${accountId}`) {
      await route.fulfill({ json: { id: accountId, name: 'Test account', currency: 'ARS', opening_balance: '0.00', balance: '0.00', rate_type: 'blue', archived_at: null } });
      return;
    }
    if (path === `/api/accounts/${accountId}/activity`) {
      await route.fulfill({ json: { items: [], next_cursor: null } });
      return;
    }

    await route.fulfill({ status: 404, json: { detail: 'Not found' } });
  });

  await page.goto(`/accounts/${accountId}`);

  await expect(page.getByRole('heading', { name: 'Test account' })).toBeVisible();
  expect(requestedPaths).toContain(`/api/accounts/${accountId}`);
  expect(requestedPaths).toContain(`/api/accounts/${accountId}/activity`);
  expect(requestedPaths).not.toContain('/api/accounts/undefined');
});

test('shows current-month net worth growth on dashboard', async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('checash.access_token', 'test-token');
  });
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;

    if (path === '/api/auth/me') {
      await route.fulfill({ json: { id: 'user-1', email: 'test@example.com', default_account_id: null, default_category_id: null } });
      return;
    }
    if (path === '/api/accounts') {
      await route.fulfill({ json: [{ id: 'account-1', name: 'Cash', currency: 'ARS', opening_balance: '0.00', balance: '1500.00', rate_type: 'blue', archived_at: null }] });
      return;
    }
    if (path === '/api/accounts/net-worth') {
      await route.fulfill({ json: { total_ars: '1500.00', total_usd: '1.50' } });
      return;
    }
    if (path === '/api/accounts/net-worth/history') {
      await route.fulfill({
        json: {
          month_start: '2026-07-01',
          points: [
            { date: '2026-07-20', total_ars: '1000.00', total_usd: '1.00' },
            { date: '2026-07-21', total_ars: '1500.00', total_usd: '1.50' },
          ],
        },
      });
      return;
    }
    if (path === '/api/transactions/month-summary') {
      await route.fulfill({ json: { month_start: '2026-07-01T00:00:00Z', month_end: '2026-08-01T00:00:00Z', income_ars: '500.00', income_usd: '0.50', expense_ars: '0.00', expense_usd: '0.00' } });
      return;
    }
    if (path === '/api/activity') {
      await route.fulfill({ json: { items: [], next_cursor: null } });
      return;
    }

    await route.fulfill({ status: 404, json: { detail: 'Not found' } });
  });

  await page.goto('/dashboard');

  await expect(page.getByText('Net worth growth')).toBeVisible();
  await expect(page.getByText('+ARS 500,00')).toBeVisible();
  await expect(page.getByRole('img', { name: /Net worth trend from ARS 1.000,00 to ARS 1.500,00/ })).toBeVisible();
});
