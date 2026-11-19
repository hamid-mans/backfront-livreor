import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { getMessages, postMessage } from '@/services/messages'

function mockFetchResponse(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue({
    status,
    json: () => Promise.resolve(body),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('services/messages', () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('getMessages', () => {
    it('appelle GET /messages et renvoie la liste', async () => {
      const messages = [{ id: 1, content: 'Hello', author: 'Hamid', createdAt: '2026-11-19T10:00:00Z' }]
      const fetchMock = mockFetchResponse(200, messages)

      const result = await getMessages()

      expect(fetchMock).toHaveBeenCalledWith('http://api.test/messages')
      expect(result).toEqual(messages)
    })
  })

  describe('postMessage', () => {
    const input = { content: 'Super site', author: 'Alice' }

    it('envoie le message en POST au format JSON', async () => {
      const fetchMock = mockFetchResponse(201, { id: 2, ...input, createdAt: '2026-11-19T10:00:00Z' })

      await postMessage(input)

      expect(fetchMock).toHaveBeenCalledWith('http://api.test/messages', {
        method: 'POST',
        body: JSON.stringify(input),
        headers: { 'Content-Type': 'application/json' },
      })
    })

    it('renvoie le message créé en cas de 201', async () => {
      const created = { id: 2, ...input, createdAt: '2026-11-19T10:00:00Z' }
      mockFetchResponse(201, created)

      const result = await postMessage(input)

      expect(result).toEqual({ ok: true, message: created })
    })

    it('renvoie les erreurs de validation en cas de 422', async () => {
      const errors = { content: 'Le message est obligatoire' }
      mockFetchResponse(422, { errors })

      const result = await postMessage(input)

      expect(result).toEqual({ ok: false, errors })
    })

    it('lève une erreur pour un statut inattendu', async () => {
      mockFetchResponse(500, { message: 'Server error' })

      await expect(postMessage(input)).rejects.toThrow('500')
    })
  })
})
