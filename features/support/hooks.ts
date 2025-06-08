import { Before, After } from '@cucumber/cucumber';
import { CustomWorld } from './world';

Before(async function (this: CustomWorld) {
  await this.openApplication();
  // Clear localStorage to ensure a clean state for each test
  await this.page.evaluate(() => window.localStorage.clear());
  // Reload the page to apply the cleared storage
  await this.page.reload();
});

After(async function (this: CustomWorld) {
  await this.closeApplication();
});