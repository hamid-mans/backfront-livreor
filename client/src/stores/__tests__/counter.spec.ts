import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCounterStore } from '@/stores/counter'

describe('useCounterStore', () => {
  beforeEach(() => {
    // Un nouveau Pinia par test pour repartir d'un état propre
    setActivePinia(createPinia())
  })

  it('démarre à 0', () => {
    const store = useCounterStore()

    expect(store.count).toBe(0)
    expect(store.doubleCount).toBe(0)
  })

  it('incrémente le compteur et recalcule le double', () => {
    const store = useCounterStore()

    store.increment()
    store.increment()

    expect(store.count).toBe(2)
    expect(store.doubleCount).toBe(4)
  })
})
