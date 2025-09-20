import { test, expect } from '@playwright/test'

test.describe('Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock a new user who just signed up
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        id: 'new-user-id',
        email: 'newuser@example.com',
        onboarding_completed: false
      }))
    })
  })

  test('should start onboarding for new users', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to onboarding
    await expect(page).toHaveURL(/.*\/onboarding/)
    
    // Should show welcome screen
    await expect(page.locator('h1')).toContainText('Bienvenue')
    await expect(page.locator('text=Body by Rings')).toBeVisible()
    
    // Should show start button
    await expect(page.locator('text=Commencer')).toBeVisible()
  })

  test('should complete experience level selection', async ({ page }) => {
    await page.goto('/onboarding')
    
    // Click start
    await page.click('text=Commencer')
    
    // Should show experience level selection
    await expect(page.locator('h2')).toContainText('Niveau d\'expérience')
    
    // Should show all experience options
    await expect(page.locator('text=Débutant')).toBeVisible()
    await expect(page.locator('text=Intermédiaire')).toBeVisible()
    await expect(page.locator('text=Avancé')).toBeVisible()
    
    // Select intermediate
    await page.click('[data-testid="experience-intermediate"]')
    
    // Should highlight selection
    await expect(page.locator('[data-testid="experience-intermediate"]')).toHaveClass(/selected/)
    
    // Continue to next step
    await page.click('text=Continuer')
    
    // Should proceed to next step
    await expect(page.locator('h2')).toContainText('Objectifs')
  })

  test('should complete goals selection', async ({ page }) => {
    await page.goto('/onboarding/goals')
    
    // Should show goals selection
    await expect(page.locator('h2')).toContainText('Objectifs')
    
    // Should show goal options
    await expect(page.locator('text=Force')).toBeVisible()
    await expect(page.locator('text=Muscle')).toBeVisible()
    await expect(page.locator('text=Endurance')).toBeVisible()
    await expect(page.locator('text=Équilibre')).toBeVisible()
    
    // Allow multiple selections
    await page.click('[data-testid="goal-strength"]')
    await page.click('[data-testid="goal-muscle"]')
    
    // Should highlight selections
    await expect(page.locator('[data-testid="goal-strength"]')).toHaveClass(/selected/)
    await expect(page.locator('[data-testid="goal-muscle"]')).toHaveClass(/selected/)
    
    // Continue
    await page.click('text=Continuer')
    
    // Should proceed to next step
    await expect(page.locator('h2')).toContainText('Disponibilité')
  })

  test('should complete availability setup', async ({ page }) => {
    await page.goto('/onboarding/availability')
    
    // Should show availability options
    await expect(page.locator('h2')).toContainText('Disponibilité')
    
    // Should show workout frequency options
    await expect(page.locator('text=2-3 fois par semaine')).toBeVisible()
    await expect(page.locator('text=3-4 fois par semaine')).toBeVisible()
    await expect(page.locator('text=4-5 fois par semaine')).toBeVisible()
    
    // Select frequency
    await page.click('[data-testid="frequency-3-4"]')
    
    // Should show session duration options
    await expect(page.locator('text=30-45 minutes')).toBeVisible()
    await expect(page.locator('text=45-60 minutes')).toBeVisible()
    await expect(page.locator('text=60+ minutes')).toBeVisible()
    
    // Select duration
    await page.click('[data-testid="duration-45-60"]')
    
    // Continue
    await page.click('text=Continuer')
    
    // Should proceed to equipment setup
    await expect(page.locator('h2')).toContainText('Équipement')
  })

  test('should complete equipment selection', async ({ page }) => {
    await page.goto('/onboarding/equipment')
    
    // Should show equipment options
    await expect(page.locator('h2')).toContainText('Équipement')
    
    // Should show equipment categories
    await expect(page.locator('text=Anneaux de gymnastique')).toBeVisible()
    await expect(page.locator('text=Barre de traction')).toBeVisible()
    await expect(page.locator('text=Barres parallèles')).toBeVisible()
    
    // Select equipment
    await page.click('[data-testid="equipment-rings"]')
    await page.click('[data-testid="equipment-pullup-bar"]')
    
    // Should show equipment details/setup instructions
    await expect(page.locator('text=Installation recommandée')).toBeVisible()
    
    // Continue
    await page.click('text=Continuer')
    
    // Should proceed to program generation
    await expect(page.locator('h2')).toContainText('Programme personnalisé')
  })

  test('should generate personalized program', async ({ page }) => {
    await page.goto('/onboarding/program')
    
    // Should show program generation
    await expect(page.locator('h2')).toContainText('Programme personnalisé')
    
    // Should show loading state while generating
    await expect(page.locator('[data-testid="program-generating"]')).toBeVisible()
    await expect(page.locator('text=Génération en cours')).toBeVisible()
    
    // Wait for generation to complete
    await page.waitForSelector('[data-testid="program-generated"]', { timeout: 10000 })
    
    // Should show generated program summary
    await expect(page.locator('text=Programme généré')).toBeVisible()
    await expect(page.locator('[data-testid="program-summary"]')).toBeVisible()
    
    // Should show program details
    await expect(page.locator('text=Phase 1')).toBeVisible()
    await expect(page.locator('text=4 séances par semaine')).toBeVisible()
    
    // Should allow reviewing program
    await page.click('text=Voir le programme détaillé')
    await expect(page.locator('[data-testid="program-details"]')).toBeVisible()
    
    // Accept program
    await page.click('text=Accepter le programme')
    
    // Should proceed to final step
    await expect(page.locator('h2')).toContainText('Prêt à commencer')
  })

  test('should complete onboarding successfully', async ({ page }) => {
    await page.goto('/onboarding/complete')
    
    // Should show completion screen
    await expect(page.locator('h2')).toContainText('Prêt à commencer')
    await expect(page.locator('text=Félicitations')).toBeVisible()
    
    // Should show onboarding summary
    await expect(page.locator('text=Récapitulatif')).toBeVisible()
    await expect(page.locator('text=Niveau: Intermédiaire')).toBeVisible()
    await expect(page.locator('text=Objectifs: Force, Muscle')).toBeVisible()
    
    // Should show tips for getting started
    await expect(page.locator('text=Conseils pour bien commencer')).toBeVisible()
    
    // Finish onboarding
    await page.click('text=Commencer mon entraînement')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/)
    
    // Should show welcome message on dashboard
    await expect(page.locator('text=Bienvenue dans votre parcours')).toBeVisible()
  })

  test('should allow navigation between onboarding steps', async ({ page }) => {
    await page.goto('/onboarding/goals')
    
    // Should show progress indicator
    await expect(page.locator('[data-testid="progress-indicator"]')).toBeVisible()
    
    // Should allow going back
    await page.click('button[data-testid="back-button"]')
    await expect(page).toHaveURL(/.*\/onboarding\/experience/)
    
    // Should allow going forward again
    await page.click('text=Continuer')
    await expect(page).toHaveURL(/.*\/onboarding\/goals/)
  })

  test('should save progress during onboarding', async ({ page }) => {
    await page.goto('/onboarding/experience')
    
    // Select experience level
    await page.click('[data-testid="experience-intermediate"]')
    await page.click('text=Continuer')
    
    // Navigate away and back
    await page.goto('/dashboard')
    await page.goto('/onboarding')
    
    // Should resume from where left off
    await expect(page).toHaveURL(/.*\/onboarding\/goals/)
    
    // Should remember previous selection
    await page.click('button[data-testid="back-button"]')
    await expect(page.locator('[data-testid="experience-intermediate"]')).toHaveClass(/selected/)
  })

  test('should handle validation errors', async ({ page }) => {
    await page.goto('/onboarding/experience')
    
    // Try to continue without selection
    await page.click('text=Continuer')
    
    // Should show validation error
    await expect(page.locator('text=Veuillez sélectionner votre niveau')).toBeVisible()
    
    // Should not proceed to next step
    await expect(page).toHaveURL(/.*\/onboarding\/experience/)
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/onboarding/experience')
    
    // Content should be properly sized for mobile
    await expect(page.locator('h2')).toBeVisible()
    
    // Option cards should be touch-friendly
    const experienceCard = page.locator('[data-testid="experience-intermediate"]')
    const cardBox = await experienceCard.boundingBox()
    expect(cardBox?.height).toBeGreaterThan(44) // Minimum touch target
    
    // Navigation should work on mobile
    await page.click('[data-testid="experience-intermediate"]')
    await page.click('text=Continuer')
    await expect(page).toHaveURL(/.*\/onboarding\/goals/)
  })

  test('should handle skipping optional steps', async ({ page }) => {
    await page.goto('/onboarding/goals')
    
    // Should allow skipping optional steps
    await page.click('text=Passer cette étape')
    
    // Should proceed to next step with default values
    await expect(page).toHaveURL(/.*\/onboarding\/availability/)
  })

  test('should provide help and explanations', async ({ page }) => {
    await page.goto('/onboarding/experience')
    
    // Should show help tooltips
    await page.hover('[data-testid="help-experience"]')
    await expect(page.locator('[data-testid="tooltip"]')).toBeVisible()
    
    // Should show detailed explanations for each option
    await page.click('[data-testid="experience-beginner"]')
    await expect(page.locator('text=Nouveau aux anneaux')).toBeVisible()
    
    await page.click('[data-testid="experience-intermediate"]')
    await expect(page.locator('text=Quelques mois d\'expérience')).toBeVisible()
  })
})