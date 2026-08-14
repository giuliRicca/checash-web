import { expect, test } from '@playwright/test';

test('presents product and routes each auth intent', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'Anotá tus gastos como los contás.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Crear cuenta' }).first()).toHaveAttribute('href', '/dashboard?auth=register');
  await expect(page.getByRole('link', { name: 'Ingresar' })).toHaveAttribute('href', '/dashboard?auth=login');
  await expect(page.getByRole('img', { name: /Chat de CheCash/ })).toBeVisible();

  await page.getByRole('link', { name: 'Ver cómo funciona' }).click();
  await expect(page.getByRole('heading', { name: 'Tu plata, sin planillas.' })).toBeInViewport();
});

test('toggles theme and avoids mobile horizontal overflow', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem('checash.theme', 'light'));
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  await page.getByRole('button', { name: 'Cambiar a tema oscuro' }).click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.getByRole('link', { name: 'Crear cuenta' }).first()).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasHorizontalOverflow).toBe(false);
});
