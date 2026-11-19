import { spawn, type ChildProcess } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { loadEnv } from 'vite'

const root = fileURLToPath(new URL('../../', import.meta.url))
const specFile = fileURLToPath(new URL('../../../docs/livreor-api.yaml', import.meta.url))

const apiUrl = loadEnv('test', root, 'VITE_').VITE_API_URL
if (!apiUrl) {
  throw new Error('VITE_API_URL est absent du fichier .env')
}

async function isReachable(): Promise<boolean> {
  try {
    await fetch(`${apiUrl}/messages`, { signal: AbortSignal.timeout(1000) })
    return true
  } catch {
    return false
  }
}

async function waitUntilReachable(timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await isReachable()) return
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
  throw new Error(`Prism n'a pas démarré sur ${apiUrl} après ${timeoutMs / 1000}s`)
}

let prism: ChildProcess | undefined

export async function setup() {
  if (await isReachable()) {
    console.log(`[integration] API déjà disponible sur ${apiUrl}`)
    return
  }

  const port = new URL(apiUrl!).port || '80'
  console.log(`[integration] Démarrage de Prism sur le port ${port}...`)

  prism = spawn('npx', ['prism', 'mock', specFile, '-p', port], {
    cwd: root,
    stdio: 'ignore',
  })

  await waitUntilReachable(30_000)
}

export async function teardown() {
  prism?.kill()
}
