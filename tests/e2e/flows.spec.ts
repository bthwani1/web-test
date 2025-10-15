import { test, expect } from '@playwright/test';

test('homepage loads and shows products grid', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#productsGrid')).toBeVisible();
});

test('login, create, and delete product (admin flow)', async ({ page }) => {
  await page.goto('/');

  // login
  await page.locator('#loginEmail').fill('owner@example.com');
  await page.locator('#loginPass').fill('ChangeMe123');
  await page.locator('#loginBtn').click();

  // admin panel visible
  await expect(page.locator('#adminPanel')).toBeVisible();

  // create product (without image)
  const name = `E2E Product ${Date.now()}`;
  await page.locator('#pName').fill(name);
  await page.locator('#pPrice').fill('1234');
  await page.locator('#pCategory').fill('اكسسوارات');
  await page.locator('#btnCreateProd').click();

  // product list refreshes
  await expect(page.locator('#adminProductsList')).toContainText(name);

  // delete just-created product via first delete (simplified)
  await page.locator('#adminProductsList button:has-text("حذف")').first().click();
  await page.on('dialog', dlg => dlg.accept());
});

