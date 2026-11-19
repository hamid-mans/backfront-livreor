import { defineConfig, devices } from '@playwright/test'
import { loadEnv } from 'vite'

// URL de l'API (Prism) lue depuis le fichier .env
const apiUrl = loadEnv('development', process.cwd(), 'VITE_').VITE_API_URL
if (!apiUrl) {
  throw new Error('VITE_API_URL est absent du fichier .env')
}

const FRONT_PORT = 5173
const FRONT_URL = `http://localhost:${FRONT_PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // En CI : annotations dans GitHub + rapport HTML (téléchargeable depuis le run)
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'html',

  use: {
    baseURL: FRONT_URL,
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  // Playwright démarre (ou réutilise s'ils tournent déjà) l'API mock et le front
  webServer: [
    {
      command: `npx prism mock ../docs/livreor-api.yaml -p ${new URL(apiUrl).port}`,
      url: `${apiUrl}/messages`,
      reuseExistingServer: true,
    },
    {
      command: `npm run dev -- --port ${FRONT_PORT} --strictPort`,
      url: FRONT_URL,
      reuseExistingServer: !process.env.CI,
    },
  ],
})
