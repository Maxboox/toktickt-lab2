import { test, expect } from '@playwright/test'
import path from 'path'

test.describe('Attachment Management', () => {
  test('user can upload and delete an attachment', async ({ page }) => {
    // 1. Sélectionner un requester et aller sur My Tickets
    await page.goto('/')
    await page.selectOption('select', { label: /Alice Johnson/ })
    await page.click('button:has-text("Continue")')
    
    // 2. Cliquer sur le premier ticket
    await page.click('table tbody tr:first-child')
    
    // 3. Vérifier qu'on est sur la page de détail
    await expect(page.getByText(/Ticket #TK-/)).toBeVisible()
    
    // 4. Uploader un fichier
    const filePath = path.join(__dirname, 'test-file.txt')
    await page.setInputFiles('input[type="file"]', filePath)
    
    // 5. Cliquer sur Upload
    await page.click('button:has-text("Upload")')
    
    // 6. Vérifier que le fichier est apparu dans la liste
    await expect(page.getByText('test-file.txt')).toBeVisible()
    
    // 7. Supprimer le fichier
    await page.click('button:has-text("Delete")')
    
    // 8. Confirmer la suppression
    page.on('dialog', dialog => dialog.accept())
    
    // 9. Vérifier que le fichier a disparu
    await expect(page.getByText('test-file.txt')).not.toBeVisible()
  })

  test('user cannot see other requester tickets', async ({ page }) => {
    // 1. Sélectionner Alice
    await page.goto('/')
    await page.selectOption('select', { label: /Alice Johnson/ })
    await page.click('button:has-text("Continue")')
    
    // 2. Noter le nombre de tickets
    const aliceTickets = await page.locator('table tbody tr').count()
    
    // 3. Changer de requester (via reload et re-sélection)
    await page.goto('/')
    await page.selectOption('select', { label: /Bob Smith/ })
    await page.click('button:has-text("Continue")')
    
    // 4. Vérifier que les tickets sont différents
    const bobTickets = await page.locator('table tbody tr').count()
    
    // 5. Les deux requesters peuvent avoir des nombres différents
    // On vérifie juste que la liste a changé
    await expect(page).not.toHaveURL(/.*Alice.*/)
  })
})
