import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './',
  timeout: 60000,
  use: { headless: true, baseURL: 'https://bthwani1.github.io/web-test/' },
});

