import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://badnet.fr/');

  // City
  await page.getByPlaceholder('Rechercher une ville...').click();
  await page.getByPlaceholder('Rechercher une ville...').fill('Neuilly-sur-Marne');
  await page.getByText('Neuilly-sur-Marne (93, Île-de').click();
  // Km
  await page.locator('#rayon').click();
  await page.locator('#rayon').fill('50');

  await page.locator('div:nth-child(3) > .flex > div:nth-child(4) > label').click();
  await page.locator('div:nth-child(6) > .flex > .div-p > label').click();
  await page.locator('div:nth-child(2) > label').first().click();
  await page.locator('div:nth-child(2) > .flex > div > label').first().click();
  await page.locator('div:nth-child(2) > div:nth-child(2) > .flex > div > label').first().click();
  await page.locator('div:nth-child(2) > div:nth-child(2) > .flex > div:nth-child(2) > label').click();
  await page.locator('div:nth-child(2) > div:nth-child(2) > .flex > div:nth-child(3) > label').click();
});