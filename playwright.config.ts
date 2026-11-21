import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90000,
  expect: { timeout: 15000 },
  use: {
    storageState: process.env.PLAYWRIGHT_STORAGE_STATE,
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    browserName: "chromium",
    channel: process.env.CI ? undefined : "chrome",
    trace: "off",
    screenshot: "only-on-failure",
  },
  reporter: [["list"], ["html", { open: "never" }]],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120000,
      },
});
