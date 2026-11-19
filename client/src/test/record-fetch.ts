import { vi } from 'vitest'

export type RecordedCall = {
  method: string
  url: string
  response: Response
}

/**
 * Espionne fetch SANS le simuler : les requêtes partent vraiment vers l'API,
 * mais on garde une copie de chaque réponse pour pouvoir la lire dans le test.
 */
export function recordFetch() {
  const calls: RecordedCall[] = []
  const realFetch = globalThis.fetch

  vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
    const response = await realFetch(input, init)
    calls.push({
      method: init?.method ?? 'GET',
      url: String(input),
      response: response.clone(),
    })
    return response
  })

  /** Attend la prochaine réponse correspondant à la méthode donnée et renvoie son JSON */
  async function waitForJson<T>(method: string, index = 0): Promise<T> {
    let call: RecordedCall | undefined
    await vi.waitFor(() => {
      call = calls.filter((c) => c.method === method)[index]
      if (!call) throw new Error(`Aucune réponse ${method} reçue`)
    })
    return call!.response.json() as Promise<T>
  }

  return { calls, waitForJson }
}
