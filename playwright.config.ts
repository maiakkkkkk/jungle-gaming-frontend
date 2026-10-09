import { defineConfig, devices } from '@playwright/test'

const chromePath = process.env.PLAYWRIGHT_CHROME_PATH
  ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    launchOptions: { executablePath: chromePath },
  },
  webServer: {
    command: 'node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 },
    env: { ...process.env, VITE_ENABLE_MOCKS: 'true' },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
