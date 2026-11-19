import { test, expect } from '@playwright/test'

// Tests E2E : un vrai navigateur ouvre l'application, qui appelle l'API mock (Prism).
// Prism renvoie toujours les exemples du contrat (docs/livreor-api.yaml).

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('affiche le titre de la page', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Bienvenue sur le livre d\'Or' })).toBeVisible()
})

test('affiche les messages renvoyés par l\'API', async ({ page }) => {
  const messages = page.getByRole('listitem')

  await expect(messages).toHaveCount(2)
  await expect(messages.first()).toContainText('Super site, bravo !')
  await expect(messages.first()).toContainText('Par Sophie')
  await expect(messages.nth(1)).toContainText('Par Lucas')
})

test('affiche la date des messages en français', async ({ page }) => {
  await expect(page.getByRole('listitem').first()).toContainText('29 octobre 2026')
})

test('publie un message et l\'ajoute en tête de liste', async ({ page }) => {
  const messages = page.getByRole('listitem')
  await expect(messages).toHaveCount(2)

  await page.getByPlaceholder('Votre message').fill('Super site, bravo !')
  await page.getByPlaceholder('Auteur').fill('Sophie')
  await page.getByRole('button', { name: 'Envoyer' }).click()

  await expect(messages).toHaveCount(3)
  await expect(messages.first()).toContainText('Par Sophie')
  await expect(page.getByPlaceholder('Votre message')).toHaveValue('')
  await expect(page.getByPlaceholder('Auteur')).toHaveValue('')
})

test('affiche une erreur si l\'auteur est trop court', async ({ page }) => {
  const messages = page.getByRole('listitem')
  await expect(messages).toHaveCount(2)

  await page.getByPlaceholder('Votre message').fill('Bonjour')
  await page.getByPlaceholder('Auteur').fill('A')
  await page.getByRole('button', { name: 'Envoyer' }).click()

  await expect(page.getByText('Le pseudo doit contenir au moins 2 caractères.')).toBeVisible()
  await expect(messages).toHaveCount(2)
  await expect(page.getByPlaceholder('Auteur')).toHaveValue('A')
})
