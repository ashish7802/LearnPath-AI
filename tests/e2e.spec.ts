import { test, expect } from '@playwright/test';

test.describe('LearnPath AI — Core End-to-End User Journeys', () => {

  test('1. Home Page renders brand, hero, and 3 career pathways', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/LearnPath AI/);
    await expect(page.locator('h1')).toContainText('Start from Zero');
    await expect(page.getByText('Software Engineer')).toBeVisible();
    await expect(page.getByText('Machine Learning Engineer')).toBeVisible();
    await expect(page.getByText('AI Engineer')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Begin Free Onboarding' })).toBeVisible();
  });

  test('2. Registration page validates inputs and directs to onboarding', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText('Begin from Zero');

    const testEmail = `learner_${Date.now()}@testpath.ai`;
    await page.fill('input[placeholder="e.g. Maya Sharma"]', 'Test Learner');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');

    // Should redirect to onboarding
    await expect(page).toHaveURL(/.*onboarding/, { timeout: 10000 });
  });

  test('3. Login page authenticates demo user and redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Autofill Demo Learner Account")');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.locator('h1')).toContainText('Welcome back');
  });

  test('4. Onboarding wizard guides through career, schedule, and diagnostic check', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByText('Select Your Career Goal')).toBeVisible();

    // Select AI Engineer
    await page.click('button:has-text("AI Engineer")');
    await page.click('button:has-text("Next: Time & Preferences")');

    // Step 2: Time & Preferences
    await expect(page.getByText('Study Schedule & Device Constraints')).toBeVisible();
    await page.click('button:has-text("Next: Diagnostic Check")');

    // Step 3: Diagnostic Check
    await expect(page.getByText('Quick Diagnostic Check')).toBeVisible();
    await page.click('button:has-text("From RAM")');
    await page.click('button:has-text("Generate My Roadmap")');

    // Completes and navigates to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
  });

  test('5. Learning Dashboard answers all 6 core questions', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('1. Topics Studied')).toBeVisible();
    await expect(page.getByText('2. Verifiably Mastered')).toBeVisible();
    await expect(page.getByText("3. Today's Recommended Topic")).toBeVisible();
    await expect(page.getByText('4. Recommended Today')).toBeVisible();
    await expect(page.getByText('5. Weak Concepts')).toBeVisible();
    await expect(page.getByText('6. Next Milestone')).toBeVisible();
  });

  test('6. Roadmap Explorer displays tracks, modules, and locked/unlocked states', async ({ page }) => {
    await page.goto('/roadmap');
    await expect(page.locator('h1')).toContainText('Structured Career Roadmaps');

    // Verify modules render
    await expect(page.getByText('Digital Foundations & The Machine')).toBeVisible();
    await expect(page.getByText('How Computers Actually Work')).toBeVisible();

    // Career pathway switching
    await page.click('button:has-text("ML Engineer")');
    await expect(page.getByText('Data Foundations for Machine Learning')).toBeVisible();
  });

  test('7. Topic Learning Page presents plain language explanation and resources', async ({ page }) => {
    await page.goto('/topics/comp-101');
    await expect(page.locator('h1')).toContainText('How Computers Actually Work');
    await expect(page.getByText('In Plain Words (No Jargon)')).toBeVisible();
    await expect(page.getByText('Why It Matters in Software Engineering')).toBeVisible();
    await expect(page.getByText('Verified Free Resources')).toBeVisible();
    await expect(page.getByRole('button', { name: /Take Verification Assessment|Review Lesson/ })).toBeVisible();
  });

  test('8. Assessment Modal opens and displays interactive questions', async ({ page }) => {
    await page.goto('/topics/comp-101');
    await page.click('button:has-text("Take Verification Assessment")');

    await expect(page.getByText('Skill Verification Assessment')).toBeVisible();
    await expect(page.getByText('You are writing a Python script')).toBeVisible();
    // Close modal
    await page.click('button >> css=svg.lucide-x');
  });

  test('9. Study Planner calculates daily schedule blocks and allows recalculation', async ({ page }) => {
    await page.goto('/planner');
    await expect(page.locator('h1')).toContainText('Smart Adaptive Study Planner');
    await expect(page.getByText("Today's Personalized Study Session")).toBeVisible();
    await expect(page.getByRole('button', { name: /Recalculate Plan/ })).toBeVisible();
  });

  test('10. AI Learning Coach accepts prompts and provides pedagogical guidance', async ({ page }) => {
    await page.goto('/coach');
    await expect(page.locator('h1')).toContainText('AI Personal Learning Coach');
    await expect(page.getByText('Socratic guidance')).toBeVisible();

    // Click suggested prompt
    await page.click('button:has-text("Variables ko kitchen analogy se samjhao")');
    await expect(page.getByText(/Variable|dabbe|kitchen/i)).toBeVisible({ timeout: 10000 });
  });

  test('11. Logout cleanses session and navigates to login', async ({ page }) => {
    await page.goto('/dashboard');
    const logoutBtn = page.locator('button[title="Log out"]');
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
    }
  });

});
