import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '@/views/HomeView.vue'

// Tests d'intégration : le composant utilise le vrai service, qui appelle Prism.
// Prism renvoie toujours les exemples du contrat (docs/livreor-api.yaml).
//
// Contrairement aux tests unitaires, les requêtes passent par le vrai réseau :
// flushPromises() ne suffit pas, on attend donc que le DOM change avec vi.waitFor().

async function mountView() {
  const wrapper = mount(HomeView)
  await vi.waitFor(() => expect(wrapper.findAll('li').length).toBeGreaterThan(0))
  return wrapper
}

type Wrapper = Awaited<ReturnType<typeof mountView>>

async function fillAndSubmit(wrapper: Wrapper, content: string, author: string) {
  await wrapper.find('textarea').setValue(content)
  await wrapper.find('input').setValue(author)
  await wrapper.find('form').trigger('submit')
}

describe('HomeView (intégration API)', () => {
  it('affiche les messages renvoyés par l\'API', async () => {
    const wrapper = await mountView()

    expect(wrapper.text()).toContain('Sophie')
    expect(wrapper.text()).toContain('Lucas')
  })

  it('ajoute le message créé en tête de liste et vide le formulaire', async () => {
    const wrapper = await mountView()
    const before = wrapper.findAll('li').length

    await fillAndSubmit(wrapper, 'Super site, bravo !', 'Sophie')

    await vi.waitFor(() => expect(wrapper.findAll('li')).toHaveLength(before + 1))
    expect((wrapper.find('textarea').element as HTMLTextAreaElement).value).toBe('')
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('')
  })

  it('affiche les erreurs de validation renvoyées par l\'API', async () => {
    const wrapper = await mountView()
    const before = wrapper.findAll('li').length

    await fillAndSubmit(wrapper, 'Bonjour', 'A')

    await vi.waitFor(() => expect(wrapper.find('[data-test="error-author"]').exists()).toBe(true))
    expect(wrapper.find('[data-test="error-author"]').text()).not.toBe('')
    expect(wrapper.findAll('li')).toHaveLength(before)
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('A')
  })
})
