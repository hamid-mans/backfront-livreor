import { test, expect, type Page } from '@playwright/test'
import type { Message } from '../src/types/message'

// Tests E2E : un vrai navigateur ouvre l'application, qui appelle l'API (VITE_API_URL).
//
// On ne compare pas l'affichage à des données écrites en dur, mais à ce que l'API
// a réellement renvoyé pendant le test : ça marche avec Prism comme avec de vraies données.

const isMessagesCall = (method: string) => (response: { url(): string; request(): { method(): string } }) =>
  response.url().endsWith('/messages') && response.request().method() === method

/** Ouvre la page d'accueil et renvoie la liste de messages reçue de l'API */
async function openHome(page: Page): Promise<Message[]> {
  const responsePromise = page.waitForResponse(isMessagesCall('GET'))
  await page.goto('/')
  const messages: Message[] = await (await responsePromise).json()
  await expect(page.getByRole('listitem')).toHaveCount(messages.length)
  return messages
}

async function fillAndSubmit(page: Page, content: string, author: string) {
  await page.getByPlaceholder('Votre message').fill(content)
  await page.getByPlaceholder('Auteur').fill(author)
  await page.getByRole('button', { name: 'Envoyer' }).click()
}

test('affiche le titre de la page', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Bienvenue sur le livre d\'Or' })).toBeVisible()
})

test('affiche les messages renvoyés par l\'API, dans le même ordre', async ({ page }) => {
  const messages = await openHome(page)
  const items = page.getByRole('listitem')

  for (const [i, message] of messages.entries()) {
    await expect(items.nth(i)).toContainText(message.content)
    await expect(items.nth(i)).toContainText(`Par ${message.author}`)
  }
})

test('affiche la date des messages en français', async ({ page }) => {
  const messages = await openHome(page)
  test.skip(messages.length === 0, 'Aucun message à afficher')

  // Ex. : « 29 octobre 2026 à 12:09 »
  const frenchDate = /\d{1,2} (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre) \d{4} à \d{2}:\d{2}/
  await expect(page.getByRole('listitem').first()).toContainText(frenchDate)
})

test('publie un message et l\'ajoute en tête de liste', async ({ page }) => {
  const messages = await openHome(page)

  const responsePromise = page.waitForResponse(isMessagesCall('POST'))
  await fillAndSubmit(page, `Message E2E ${Date.now()}`, 'Playwright')
  const response = await responsePromise
  expect(response.status()).toBe(201)
  const created: Message = await response.json()

  const items = page.getByRole('listitem')
  await expect(items).toHaveCount(messages.length + 1)
  await expect(items.first()).toContainText(created.content)
  await expect(items.first()).toContainText(`Par ${created.author}`)
  await expect(page.getByPlaceholder('Votre message')).toHaveValue('')
  await expect(page.getByPlaceholder('Auteur')).toHaveValue('')
})

test('affiche une erreur si l\'auteur est trop court', async ({ page }) => {
  const messages = await openHome(page)

  const responsePromise = page.waitForResponse(isMessagesCall('POST'))
  await fillAndSubmit(page, 'Bonjour', 'A')
  expect((await responsePromise).status()).toBe(422)

  const error = page.locator('[data-test="error-author"]')
  await expect(error).toBeVisible()
  await expect(error).not.toBeEmpty()
  await expect(page.getByRole('listitem')).toHaveCount(messages.length)
  await expect(page.getByPlaceholder('Auteur')).toHaveValue('A')
})
