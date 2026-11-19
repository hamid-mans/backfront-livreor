import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'
import type { Message } from '@/types/message'
import { recordFetch } from '@/test/record-fetch'

// Tests d'intégration : le composant utilise le vrai service, qui appelle l'API (VITE_API_URL).
//
// On ne compare pas l'affichage à des données écrites en dur, mais à ce que l'API
// a réellement renvoyé pendant le test : ça marche avec Prism comme avec de vraies données.
//
// Les requêtes passent par le vrai réseau : flushPromises() ne suffit pas,
// on attend donc que le DOM change avec vi.waitFor().

let api: ReturnType<typeof recordFetch>

beforeEach(() => {
  api = recordFetch()
})

afterEach(() => {
  vi.restoreAllMocks()
})

/** Monte la page et attend qu'elle affiche la liste renvoyée par l'API */
async function mountView() {
  const wrapper = mount(HomeView)
  const initialMessages = await api.waitForJson<Message[]>('GET')
  await vi.waitFor(() => expect(wrapper.findAll('li')).toHaveLength(initialMessages.length))
  return { wrapper, initialMessages }
}

type Wrapper = Awaited<ReturnType<typeof mountView>>['wrapper']

async function fillAndSubmit(wrapper: Wrapper, content: string, author: string) {
  await wrapper.find('textarea').setValue(content)
  await wrapper.find('input').setValue(author)
  await wrapper.find('form').trigger('submit')
}

describe('HomeView (intégration API)', () => {
  it('affiche les messages renvoyés par l\'API', async () => {
    const { wrapper, initialMessages } = await mountView()
    const items = wrapper.findAll('li')

    initialMessages.forEach((message, i) => {
      expect(items[i]!.text()).toContain(message.content)
      expect(items[i]!.text()).toContain(`Par ${message.author}`)
    })
  })

  it('ajoute le message créé en tête de liste et vide le formulaire', async () => {
    const { wrapper, initialMessages } = await mountView()

    await fillAndSubmit(wrapper, `Message d'intégration ${Date.now()}`, 'Vitest')
    const created = await api.waitForJson<Message>('POST')

    await vi.waitFor(() => expect(wrapper.findAll('li')).toHaveLength(initialMessages.length + 1))
    const first = wrapper.findAll('li')[0]!
    expect(first.text()).toContain(created.content)
    expect(first.text()).toContain(`Par ${created.author}`)
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
  })

  it('affiche les erreurs de validation renvoyées par l\'API', async () => {
    const { wrapper, initialMessages } = await mountView()

    await fillAndSubmit(wrapper, 'Bonjour', 'A')

    await vi.waitFor(() => expect(wrapper.find('[data-test="error-author"]').exists()).toBe(true))
    expect(wrapper.find('[data-test="error-author"]').text()).not.toBe('')
    expect(wrapper.findAll('li')).toHaveLength(initialMessages.length)
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('A')
  })
})
