import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start each test by going to the home page
    await page.goto('/')
  })

  test('should display landing page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Body by Rings/)

    // Check main heading
    await expect(page.locator('h1')).toContainText('Body by Rings')

    // Check that login/signup buttons are visible
    await expect(page.locator('text=Se connecter')).toBeVisible()
    await expect(page.locator('text=Créer un compte')).toBeVisible()
  })

  test('should navigate to sign up page', async ({ page }) => {
    // Click on sign up button
    await page.click('text=Créer un compte')

    // Should navigate to signup page
    await expect(page).toHaveURL(/.*\/signup/)

    // Check signup form elements
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('text=Créer un compte')).toBeVisible()

    // Check validation messages for empty form
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Email requis')).toBeVisible()
    await expect(page.locator('text=Mot de passe requis')).toBeVisible()
  })

  test('should show validation errors for invalid inputs', async ({ page }) => {
    await page.goto('/signup')

    // Test invalid email
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', 'short')
    await page.click('button[type="submit"]')

    // Should show validation errors
    await expect(page.locator('text=Email invalide')).toBeVisible()
    await expect(page.locator('text=Le mot de passe doit contenir au moins 8 caractères')).toBeVisible()
  })

  test('should navigate to sign in page', async ({ page }) => {
    await page.click('text=Se connecter')

    // Should navigate to signin page
    await expect(page).toHaveURL(/.*\/signin/)

    // Check signin form elements
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('text=Se connecter')).toBeVisible()

    // Check link to signup
    await expect(page.locator('text=Créer un compte')).toBeVisible()
  })

  test('should handle sign up process', async ({ page }) => {
    await page.goto('/signup')

    // Fill in valid signup form
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'SecurePass123!')
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!')
    
    // Submit form
    await page.click('button[type="submit"]')

    // Should show success message or redirect to onboarding
    await expect(
      page.locator('text=Compte créé avec succès').or(
        page.locator('text=Vérifiez votre email')
      )
    ).toBeVisible()
  })

  test('should handle sign in process', async ({ page }) => {
    await page.goto('/signin')

    // Fill in signin form
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'SecurePass123!')
    
    // Submit form
    await page.click('button[type="submit"]')

    // Should either redirect to dashboard or show error
    // In a real app, this would redirect to dashboard if credentials are valid
    // For testing, we can check for either success or error states
    const successRedirect = page.locator('text=Tableau de bord')
    const errorMessage = page.locator('text=Identifiants incorrects')
    
    await expect(successRedirect.or(errorMessage)).toBeVisible()
  })

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/signin')

    // Click forgot password link
    await page.click('text=Mot de passe oublié')

    // Should navigate to password reset page
    await expect(page).toHaveURL(/.*\/reset-password/)

    // Fill email for password reset
    await page.fill('input[type="email"]', 'test@example.com')
    await page.click('button[type="submit"]')

    // Should show success message
    await expect(page.locator('text=Email de réinitialisation envoyé')).toBeVisible()
  })

  test('should maintain form state during navigation', async ({ page }) => {
    await page.goto('/signup')

    // Fill some form data
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'MyPassword123')

    // Navigate to signin and back
    await page.click('text=Déjà un compte')
    await expect(page).toHaveURL(/.*\/signin/)
    
    await page.click('text=Créer un compte')
    await expect(page).toHaveURL(/.*\/signup/)

    // Form should be cleared (good UX practice)
    await expect(page.locator('input[type="email"]')).toHaveValue('')
    await expect(page.locator('input[type="password"]')).toHaveValue('')
  })

  test('should be accessible', async ({ page }) => {
    // Test keyboard navigation
    await page.goto('/signup')
    
    // Tab through form elements
    await page.keyboard.press('Tab') // Email field
    await expect(page.locator('input[type="email"]')).toBeFocused()
    
    await page.keyboard.press('Tab') // Password field
    await expect(page.locator('input[type="password"]')).toBeFocused()
    
    await page.keyboard.press('Tab') // Submit button
    await expect(page.locator('button[type="submit"]')).toBeFocused()

    // Test form submission with Enter key
    await page.locator('input[type="email"]').focus()
    await page.fill('input[type="email"]', 'test@example.com')
    await page.keyboard.press('Enter')
    
    // Should show validation error for missing password
    await expect(page.locator('text=Mot de passe requis')).toBeVisible()
  })

  test('should handle loading states', async ({ page }) => {
    await page.goto('/signin')

    // Fill form
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'SecurePass123!')

    // Click submit and check loading state
    await page.click('button[type="submit"]')
    
    // Button should show loading state
    await expect(page.locator('button[type="submit"]')).toContainText('Connexion...')
    
    // Or check for loading spinner
    await expect(page.locator('.loading-spinner').or(
      page.locator('[data-testid="loading"]')
    )).toBeVisible()
  })

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/signup')

    // Form should be responsive
    await expect(page.locator('form')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    
    // Check that form fields are properly sized for mobile
    const emailInput = page.locator('input[type="email"]')
    const inputBox = await emailInput.boundingBox()
    
    expect(inputBox?.width).toBeGreaterThan(250) // Should be wide enough on mobile
  })
})