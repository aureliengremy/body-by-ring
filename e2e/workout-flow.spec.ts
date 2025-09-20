import { test, expect } from '@playwright/test'

test.describe('Workout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication state - assume user is logged in
    // In a real test, you might use a test database or mock API
    await page.goto('/')
    
    // Mock login state if needed
    await page.evaluate(() => {
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        experience_level: 'intermediate'
      }))
    })
    
    // Navigate to dashboard
    await page.goto('/dashboard')
  })

  test('should display dashboard with current program', async ({ page }) => {
    // Check dashboard elements
    await expect(page.locator('h1')).toContainText('Tableau de bord')
    
    // Should show current program info
    await expect(page.locator('text=Programme actuel')).toBeVisible()
    await expect(page.locator('text=Body by Rings')).toBeVisible()
    
    // Should show next workout
    await expect(page.locator('text=Prochaine séance')).toBeVisible()
    
    // Should show progress indicators
    await expect(page.locator('[data-testid="progress-indicator"]')).toBeVisible()
  })

  test('should start a workout session', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Click start workout button
    await page.click('text=Commencer la séance')
    
    // Should navigate to workout page
    await expect(page).toHaveURL(/.*\/workout\/.*/)
    
    // Should show workout interface
    await expect(page.locator('h1')).toContainText('Séance')
    await expect(page.locator('text=Exercice')).toBeVisible()
    
    // Should show exercise list or current exercise
    await expect(page.locator('[data-testid="exercise-card"]')).toBeVisible()
  })

  test('should complete an exercise set', async ({ page }) => {
    // Navigate to active workout
    await page.goto('/workout/test-workout-id')
    
    // Should show exercise interface
    await expect(page.locator('[data-testid="current-exercise"]')).toBeVisible()
    
    // Fill in set data
    await page.fill('input[name="reps"]', '8')
    await page.selectOption('select[name="rpe"]', '7')
    
    // Complete the set
    await page.click('button[data-testid="complete-set"]')
    
    // Should show success feedback
    await expect(page.locator('text=Série complétée')).toBeVisible()
    
    // Should update set counter
    await expect(page.locator('text=Série 1/3 complétée')).toBeVisible()
  })

  test('should handle rest timer between sets', async ({ page }) => {
    await page.goto('/workout/test-workout-id')
    
    // Complete a set
    await page.fill('input[name="reps"]', '8')
    await page.selectOption('select[name="rpe"]', '7')
    await page.click('button[data-testid="complete-set"]')
    
    // Should show rest timer
    await expect(page.locator('[data-testid="rest-timer"]')).toBeVisible()
    await expect(page.locator('text=Repos:')).toBeVisible()
    
    // Timer should count down
    const timerDisplay = page.locator('[data-testid="timer-display"]')
    const initialTime = await timerDisplay.textContent()
    
    // Wait a moment and check timer changed
    await page.waitForTimeout(2000)
    const newTime = await timerDisplay.textContent()
    expect(newTime).not.toBe(initialTime)
    
    // Should allow skipping rest
    await page.click('button[data-testid="skip-rest"]')
    await expect(page.locator('[data-testid="rest-timer"]')).not.toBeVisible()
  })

  test('should navigate between exercises', async ({ page }) => {
    await page.goto('/workout/test-workout-id')
    
    // Should show current exercise
    await expect(page.locator('[data-testid="current-exercise"]')).toBeVisible()
    
    // Complete all sets for current exercise
    for (let i = 0; i < 3; i++) {
      await page.fill('input[name="reps"]', '8')
      await page.selectOption('select[name="rpe"]', '7')
      await page.click('button[data-testid="complete-set"]')
      
      if (i < 2) {
        // Skip rest for faster testing
        await page.click('button[data-testid="skip-rest"]')
      }
    }
    
    // Should automatically move to next exercise or show completion
    await expect(
      page.locator('text=Exercice suivant').or(
        page.locator('text=Séance terminée')
      )
    ).toBeVisible()
  })

  test('should save workout progress', async ({ page }) => {
    await page.goto('/workout/test-workout-id')
    
    // Complete a set
    await page.fill('input[name="reps"]', '8')
    await page.selectOption('select[name="rpe"]', '7')
    await page.click('button[data-testid="complete-set"]')
    
    // Navigate away and back
    await page.goto('/dashboard')
    await page.goto('/workout/test-workout-id')
    
    // Progress should be saved
    await expect(page.locator('text=Série 1/3 complétée')).toBeVisible()
  })

  test('should handle workout completion', async ({ page }) => {
    await page.goto('/workout/test-workout-id')
    
    // Complete all exercises (simplified for test)
    await page.click('button[data-testid="complete-workout"]')
    
    // Should show completion screen
    await expect(page.locator('h1')).toContainText('Séance terminée')
    await expect(page.locator('text=Félicitations')).toBeVisible()
    
    // Should show workout summary
    await expect(page.locator('text=Résumé de la séance')).toBeVisible()
    await expect(page.locator('[data-testid="workout-stats"]')).toBeVisible()
    
    // Should show XP gained
    await expect(page.locator('text=XP gagné')).toBeVisible()
    
    // Should allow returning to dashboard
    await page.click('text=Retour au tableau de bord')
    await expect(page).toHaveURL(/.*\/dashboard/)
  })

  test('should handle exercise modifications', async ({ page }) => {
    await page.goto('/workout/test-workout-id')
    
    // Should allow modifying exercise
    await page.click('button[data-testid="modify-exercise"]')
    
    // Should show modification options
    await expect(page.locator('text=Modifier l\'exercice')).toBeVisible()
    await expect(page.locator('text=Trop facile')).toBeVisible()
    await expect(page.locator('text=Trop difficile')).toBeVisible()
    
    // Select modification
    await page.click('text=Trop difficile')
    await page.click('text=Progression plus lente')
    
    // Should apply modification
    await expect(page.locator('text=Exercice modifié')).toBeVisible()
  })

  test('should track workout metrics', async ({ page }) => {
    await page.goto('/workout/test-workout-id')
    
    // Should show workout metrics
    await expect(page.locator('[data-testid="workout-timer"]')).toBeVisible()
    await expect(page.locator('[data-testid="exercise-counter"]')).toBeVisible()
    
    // Should track time spent
    const workoutTimer = page.locator('[data-testid="workout-timer"]')
    const initialTime = await workoutTimer.textContent()
    
    await page.waitForTimeout(2000)
    const newTime = await workoutTimer.textContent()
    expect(newTime).not.toBe(initialTime)
  })

  test('should handle offline mode', async ({ page }) => {
    await page.goto('/workout/test-workout-id')
    
    // Simulate offline
    await page.context().setOffline(true)
    
    // Should still allow completing sets
    await page.fill('input[name="reps"]', '8')
    await page.selectOption('select[name="rpe"]', '7')
    await page.click('button[data-testid="complete-set"]')
    
    // Should show offline indicator
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible()
    
    // Should sync when back online
    await page.context().setOffline(false)
    await expect(page.locator('text=Données synchronisées')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/workout/test-workout-id')
    
    // Interface should be mobile-friendly
    await expect(page.locator('[data-testid="current-exercise"]')).toBeVisible()
    
    // Input fields should be appropriately sized
    const repsInput = page.locator('input[name="reps"]')
    const inputBox = await repsInput.boundingBox()
    expect(inputBox?.width).toBeGreaterThan(100)
    
    // Buttons should be touch-friendly
    const completeButton = page.locator('button[data-testid="complete-set"]')
    const buttonBox = await completeButton.boundingBox()
    expect(buttonBox?.height).toBeGreaterThan(44) // iOS minimum touch target
  })

  test('should handle exercise video playback', async ({ page }) => {
    await page.goto('/workout/test-workout-id')
    
    // Should show exercise video/demo
    await expect(page.locator('[data-testid="exercise-video"]')).toBeVisible()
    
    // Should allow playing video
    await page.click('button[data-testid="play-video"]')
    
    // Video should start playing
    const video = page.locator('video')
    await expect(video).toHaveAttribute('autoplay')
  })

  test('should validate input data', async ({ page }) => {
    await page.goto('/workout/test-workout-id')
    
    // Test invalid reps input
    await page.fill('input[name="reps"]', '-1')
    await page.click('button[data-testid="complete-set"]')
    
    // Should show validation error
    await expect(page.locator('text=Nombre de répétitions invalide')).toBeVisible()
    
    // Test missing RPE
    await page.fill('input[name="reps"]', '8')
    await page.click('button[data-testid="complete-set"]')
    
    // Should show validation error
    await expect(page.locator('text=RPE requis')).toBeVisible()
  })
})