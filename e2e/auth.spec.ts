import { expect, test } from '@playwright/test';

test('shows login form for unauthenticated visitor', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
});
