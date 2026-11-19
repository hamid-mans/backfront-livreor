import { describe, it, expect } from 'vitest'
import { getMessages, postMessage } from '@/services/messages'

// Tests d'intégration : appels réels vers l'API définie par VITE_API_URL (Prism)

const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/

describe('services/messages (intégration API)', () => {
  describe('getMessages', () => {
    it('renvoie une liste de messages conforme au contrat', async () => {
      const messages = await getMessages()

      expect(Array.isArray(messages)).toBe(true)
      expect(messages.length).toBeGreaterThan(0)

      for (const message of messages) {
        expect(message).toEqual({
          id: expect.any(Number),
          author: expect.any(String),
          content: expect.any(String),
          createdAt: expect.stringMatching(ISO_DATE),
        })
      }
    })
  })

  describe('postMessage', () => {
    it('crée un message valide (201)', async () => {
      const result = await postMessage({ author: 'Alice', content: 'Bonjour le livre d\'or' })

      expect(result.ok).toBe(true)
      if (!result.ok) return

      expect(result.message).toEqual({
        id: expect.any(Number),
        author: expect.any(String),
        content: expect.any(String),
        createdAt: expect.stringMatching(ISO_DATE),
      })
    })

    it('renvoie des erreurs de validation pour un auteur trop court (422)', async () => {
      const result = await postMessage({ author: 'A', content: 'Bonjour' })

      expect(result.ok).toBe(false)
      if (result.ok) return

      expect(result.errors).toBeTypeOf('object')
      expect(Object.keys(result.errors).length).toBeGreaterThan(0)
      for (const message of Object.values(result.errors)) {
        expect(message).toBeTypeOf('string')
      }
    })

    it('renvoie des erreurs de validation pour un message vide (422)', async () => {
      const result = await postMessage({ author: 'Alice', content: '' })

      expect(result.ok).toBe(false)
    })
  })
})
