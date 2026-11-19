import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MessageList from '@/components/MessageList.vue'
import type { Message } from '@/types/message'

const messages: Message[] = [
  { id: 1, content: 'Premier message', author: 'Alice', createdAt: '2026-11-19T14:30:00' },
  { id: 2, content: 'Second message', author: 'Bob', createdAt: '2026-01-05T09:15:00' },
]

describe('MessageList', () => {
  it('affiche un élément par message', () => {
    const wrapper = mount(MessageList, { props: { messages } })

    expect(wrapper.findAll('li')).toHaveLength(2)
  })

  it('affiche le contenu et l\'auteur de chaque message', () => {
    const wrapper = mount(MessageList, { props: { messages } })
    const items = wrapper.findAll('li')

    expect(items[0]!.text()).toContain('Premier message')
    expect(items[0]!.text()).toContain('Par Alice')
    expect(items[1]!.text()).toContain('Second message')
    expect(items[1]!.text()).toContain('Par Bob')
  })

  it('formate la date en français', () => {
    const wrapper = mount(MessageList, { props: { messages } })

    expect(wrapper.findAll('li')[0]!.text()).toContain('19 novembre 2026 à 14:30')
  })

  it('n\'affiche aucun message si la liste est vide', () => {
    const wrapper = mount(MessageList, { props: { messages: [] } })

    expect(wrapper.findAll('li')).toHaveLength(0)
  })
})
