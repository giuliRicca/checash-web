import { expect, test } from '@playwright/test';

test('shows login form for unauthenticated visitor', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
});

test('passes dynamic route account ID to account APIs', async ({ page }) => {
  const accountId = 'be0d5adc-0015-4157-8e1f-1cc31379dd04';
  const requestedPaths: string[] = [];

  await page.addInitScript(() => {
    window.localStorage.setItem('checash.access_token', 'test-token');
  });
  await page.route('http://localhost:8000/api/**', async (route) => {
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
