const base = require('@playwright/test');
const { chromium } = require('playwright');
 
const PLAYGROUND_URL =
  process.env.BASE_URL || 'https://www.lambdatest.com/selenium-playground/';
 
const test = base.test.extend({
  page: async ({}, use, testInfo) => {
    const [browserName, browserVersion, platform] = (testInfo.project.name || '').split(':');
 
    if (process.env.LT_USERNAME && process.env.LT_ACCESS_KEY) {
      const capabilities = {
        browserName: browserName || 'pw-chromium',
        browserVersion: browserVersion || 'latest',
        'LT:Options': {
          platform: platform || process.env.HYPEREXECUTE_PLATFORM || 'Windows 10',
          build: 'Playwright 102 Assignment - HyperExecute',
          name: `${testInfo.title} [${platform || process.env.HYPEREXECUTE_PLATFORM || 'Cloud'}]`,
          user: process.env.LT_USERNAME,
          accessKey: process.env.LT_ACCESS_KEY,
          network: true,
          video: true,
          visual: true,
          console: true,
        },
      };
 
      const browser = await chromium.connect(
        `wss://cdp.lambdatest.com/playwright?capabilities=${encodeURIComponent(
          JSON.stringify(capabilities)
        )}`
      );
      const context = await browser.newContext();
      const ltPage = await context.newPage();
 
      await use(ltPage);
 
      const testStatus = {
        action: 'setTestStatus',
        arguments: {
          status: testInfo.status === 'passed' ? 'passed' : 'failed',
          remark: testInfo.error ? testInfo.error.message : 'Test completed',
        },
      };
      await ltPage.evaluate(() => {}, `lambdatest_action: ${JSON.stringify(testStatus)}`);
 
      await ltPage.close();
      await context.close();
      await browser.close();
    } else {
      const browser = await chromium.launch();
      const context = await browser.newContext();
      const localPage = await context.newPage();
      await use(localPage);
      await localPage.close();
      await context.close();
      await browser.close();
    }
  },
});
 
const { expect } = base;
 
test.describe('Playwright 102 Assignment Scenarios', () => {
  test('Test Scenario 1: Simple Form Demo', async ({ page }) => {
    await page.goto(PLAYGROUND_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.getByRole('link', { name: 'Simple Form Demo' }).click();
    await expect(page).toHaveURL(/.*simple-form-demo/);
 
    const message = process.env.WELCOME_MESSAGE || 'Welcome to TestMu AI';
    const messageInput = page.locator('input#user-message');
    await messageInput.waitFor({ state: 'visible', timeout: 30000 });
    await messageInput.fill(message);
 
    await page.locator('#showInput').click();
    await expect(page.locator('#message')).toHaveText(message, { timeout: 15000 });
  });
 
  test('Test Scenario 2: Drag & Drop Sliders', async ({ page }) => {
    await page.goto(PLAYGROUND_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.getByRole('link', { name: 'Drag & Drop Sliders' }).click();
 
    const slider = page.locator('#slider3 input[type="range"]');
    const rangeOutput = page.locator('#rangeSuccess');
    await slider.waitFor({ state: 'visible', timeout: 30000 });
 
    await slider.fill('95');
    await slider.dispatchEvent('change');
    await expect(rangeOutput).toHaveText('95');
  });
 
  test('Test Scenario 3: Input Form Submit', async ({ page }) => {
    await page.goto(PLAYGROUND_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.getByRole('link', { name: 'Input Form Submit' }).click();
    await expect(page).toHaveURL(/.*input-form-demo/);
 
    const form = page.locator('#seleniumform');
    await form.waitFor({ state: 'visible', timeout: 30000 });
 
    await form.locator('#name').fill('Dhanush');
    await form.locator('#inputEmail4').fill('dhanush@test.com');
    await form.locator('#inputPassword4').fill('TestPassword123');
    await form.locator('#company').fill('Deloitte');
    await form.locator('#websitename').fill('https://www.testmuai.com');
    await form.locator('select[name="country"]').selectOption({ label: 'United States' });
    await form.locator('#inputCity').fill('Hyderabad');
    await form.locator('#inputAddress1').fill('123 Main St');
    await form.locator('#inputAddress2').fill('Suite 100');
    await form.locator('#inputState').fill('TX');
    await form.locator('#inputZip').fill('75001');
 
    await form.locator('button[type="submit"]').click();
 
    const successMsg = page.locator('.success-msg');
    await expect(successMsg).toBeVisible({ timeout: 30000 });
    await expect(successMsg).toContainText(
      'Thanks for contacting us, we will get back to you shortly.'
    );
  });
});