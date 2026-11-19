import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'
import MessageList from '@/components/MessageList.vue'
import { getMessages, postMessage } from '@/services/messages'
import type { Message } from '@/types/message'

// On remplace le service par des fonctions simulées : aucun appel réseau
vi.mock('@/services/messages', () => ({
  getMessages: vi.fn(),
  postMessage: vi.fn(),
}))

const existing: Message[] = [
  { id: 1, content: 'Message existant', author: 'Alice', createdAt: '2026-11-18T10:00:00' },
]

async function mountView() {
  const wrapper = mount(HomeView)
  await flushPromises()
  return wrapper
}

async function fillAndSubmit(wrapper: Awaited<ReturnType<typeof mountView>>, content: string, author: string) {
  await wrapper.find('textarea').setValue(content)
  await wrapper.find('input').setValue(author)
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('HomeView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getMessages).mockResolvedValue(structuredClone(existing))
  })

  it('charge et affiche les messages au montage', async () => {
    const wrapper = await mountView()

    expect(getMessages).toHaveBeenCalledOnce()
    expect(wrapper.findComponent(MessageList).props('messages')).toEqual(existing)
    expect(wrapper.text()).toContain('Message existant')
  })

  it('envoie le contenu du formulaire', async () => {
    const wrapper = await mountView()
    vi.mocked(postMessage).mockResolvedValue({
      ok: true,
      message: { id: 2, content: 'Bonjour', author: 'Bob', createdAt: '2026-11-19T10:00:00' },
    })

    await fillAndSubmit(wrapper, 'Bonjour', 'Bob')

    expect(postMessage).toHaveBeenCalledWith({ content: 'Bonjour', author: 'Bob' })
  })

  it('ajoute le nouveau message en tête de liste et vide le formulaire (201)', async () => {
    const wrapper = await mountView()
    const created = { id: 2, content: 'Bonjour', author: 'Bob', createdAt: '2026-11-19T10:00:00' }
    vi.mocked(postMessage).mockResolvedValue({ ok: true, message: created })

    await fillAndSubmit(wrapper, 'Bonjour', 'Bob')

    const items = wrapper.findAll('li')
    expect(items).toHaveLength(2)
    expect(items[0]!.text()).toContain('Bonjour')
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
  })

  it('affiche les erreurs de validation (422)', async () => {
    const wrapper = await mountView()
    vi.mocked(postMessage).mockResolvedValue({
      ok: false,
      errors: { content: 'Le message est obligatoire', author: 'L\'auteur est obligatoire' },
    })

    await fillAndSubmit(wrapper, '', '')

    expect(wrapper.find('[data-test="error-content"]').text()).toBe('Le message est obligatoire')
    expect(wrapper.find('[data-test="error-author"]').text()).toBe('L\'auteur est obligatoire')
    expect(wrapper.findAll('li')).toHaveLength(1)
  })

  it('efface les anciennes erreurs lors d\'un nouvel envoi', async () => {
    const wrapper = await mountView()
    vi.mocked(postMessage).mockResolvedValueOnce({
      ok: false,
      errors: { content: 'Le message est obligatoire' },
    })
    await fillAndSubmit(wrapper, '', 'Bob')
    expect(wrapper.find('[data-test="error-content"]').exists()).toBe(true)

    vi.mocked(postMessage).mockResolvedValueOnce({
      ok: true,
      message: { id: 3, content: 'Corrigé', author: 'Bob', createdAt: '2026-11-19T10:00:00' },
    })
    await fillAndSubmit(wrapper, 'Corrigé', 'Bob')

    expect(wrapper.find('[data-test="error-content"]').exists()).toBe(false)
  })

  it('ne plante pas si l\'API renvoie une erreur inattendue', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await mountView()
    vi.mocked(postMessage).mockRejectedValue(new Error('Erreur inattendue de l\'API (500)'))

    await fillAndSubmit(wrapper, 'Bonjour', 'Bob')

    expect(consoleError).toHaveBeenCalled()
    expect(wrapper.findAll('li')).toHaveLength(1)
    consoleError.mockRestore()
  })
})
