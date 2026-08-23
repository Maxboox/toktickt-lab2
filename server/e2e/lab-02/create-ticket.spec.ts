import { test, expect } from '@playwright/test'

test.describe('Ticket Creation Flow', () => {
  test('user can select a requester and create a ticket', async ({ page }) => {
    // 1. Aller sur la page d'accueil
    await page.goto('/')
    
    // 2. Vérifier qu'on est sur l'écran de sélection
    await expect(page.getByText('TokTickT')).toBeVisible()
    await expect(page.getByText('Development Requester')).toBeVisible()
    
    // 3. Sélectionner un requester
    await page.selectOption('select', { label: /Alice Johnson/ })
    
    // 4. Cliquer sur Continue
    await page.click('button:has-text("Continue")')
    
    // 5. Vérifier qu'on est sur la page My Tickets
    await expect(page.getByText('My Tickets')).toBeVisible()
    
    // 6. Cliquer sur "New Ticket"
    await page.click('button:has-text("New Ticket")')
    
    // 7. Remplir le formulaire
    await page.selectOption('select[name="categoryId"]', { label: 'Hardware' })
    await page.selectOption('select[name="systemId"]', { label: 'Corporate Laptop' })
    await page.fill('input[name="summary"]', 'Test ticket from E2E test')
    await page.fill('textarea[name="description"]', 'This is a test ticket created by Playwright E2E test')
    
    // 8. Soumettre le formulaire
    await page.click('button:has-text("Create Ticket")')
    
    // 9. Vérifier le message de succès
    await expect(page.getByText('Ticket Created Successfully')).toBeVisible()
    await expect(page.getByText('TK-2026-')).toBeVisible()
    
    // 10. Cliquer sur "Create Another Ticket"
    await page.click('button:has-text("Create Another Ticket")')
    
    // 11. Vérifier qu'on est revenu sur My Tickets
    await expect(page.getByText('My Tickets')).toBeVisible()
  })

  test('user can view ticket details', async ({ page }) => {
    // 1. Aller sur la page d'accueil
    await page.goto('/')
    
    // 2. Sélectionner un requester
    await page.selectOption('select', { label: /Alice Johnson/ })
    await page.click('button:has-text("Continue")')
    
    // 3. Cliquer sur le premier ticket dans la liste
    await page.click('table tbody tr:first-child')
    
    // 4. Vérifier qu'on est sur la page de détail
    await expect(page.getByText(/Ticket #TK-/)).toBeVisible()
    await expect(page.getByText('Attachments')).toBeVisible()
    
    // 5. Vérifier les informations du ticket
    await expect(page.getByText('Summary')).toBeVisible()
    await expect(page.getByText('Description')).toBeVisible()
    await expect(page.getByText('Status')).toBeVisible()
  })
})
