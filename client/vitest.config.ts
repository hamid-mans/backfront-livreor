import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.ts'

const root = fileURLToPath(new URL('./', import.meta.url))

// Variables du fichier .env (dont VITE_API_URL, l'URL de Prism)
const env = loadEnv('test', root, 'VITE_')

const INTEGRATION_TESTS = 'src/**/*.int.spec.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      root,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            exclude: [...configDefaults.exclude, INTEGRATION_TESTS],
            // Fausse URL : les tests unitaires ne doivent jamais toucher le réseau
            env: { VITE_API_URL: 'http://api.test' },
          },
        },
        {
          extends: true,
          test: {
            name: 'integration',
            include: [INTEGRATION_TESTS],
            env: { VITE_API_URL: env.VITE_API_URL! },
            // Vérifie que Prism tourne (et le démarre sinon)
            globalSetup: ['./src/test/prism.global-setup.ts'],
          },
        },
      ],
    },
  }),
)
