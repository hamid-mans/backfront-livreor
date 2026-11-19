import { test, expect, type Page } from '@playwright/test'
import type { Message } from '../src/types/message'

const isMessagesCall = (method: string) => (response: { url(): string; request(): { method(): string } }) =>
  response.url().endsWith('/messages') && response.request().method() === method

// Page accueil. Liste des messages = ok
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

// format de la date = ok
test('affiche la date des messages en français', async ({ page }) => {
  const messages = await openHome(page)
  test.skip(messages.length === 0, 'Aucun message à afficher')

  // Ex. : « 29 octobre 2026 à 12:09 »
  const frenchDate = /\d{1,2} (janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre) \d{4} à \d{2}:\d{2}/
  await expect(page.getByRole('listitem').first()).toContainText(frenchDate)
})

// Si affiche erreur = ok
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
