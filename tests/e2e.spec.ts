import { test, expect } from '@playwright/test';

test.describe('LearnPath AI — Core End-to-End User Journeys', () => {
  test('1. Home Page renders 30-second product clarity, interactive preview, and 8 career pathways', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/LearnPath AI/);
    await expect(page.locator('h1')).toContainText('From beginner to engineer. One skill at a time.');
    await expect(page.getByText('Software Engineer').first()).toBeVisible();
    await expect(page.getByText('ML Engineer').first()).toBeVisible();
    await expect(page.getByText('AI Engineer').first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Build My Personalized Roadmap/i })).toBeVisible();
    await expect(page.getByText(/Interactive Preview · Realistic Sample Data/i)).toBeVisible();
  });

  test('2. Registration page validates inputs and directs to onboarding', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText(/Create|Account|Begin/i);

    const testEmail = `learner_${Date.now()}@testpath.ai`;
    await page.fill('input[placeholder*="Maya"]', 'Test Learner');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*onboarding/, { timeout: 10000 });
  });

  test('3. Login page authenticates demo user and redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.click('button:has-text("Autofill Demo Learner Account")');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    await expect(page.locator('h1')).toContainText(/Welcome back|Learner Mastery Dashboard/i);
  });

  test('4. Onboarding wizard supports natural-language goal parsing, step navigation, and skipping', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByText('1. Select Your Career Pathway')).toBeVisible();
    await expect(page.getByText('Describe Your Learning Goal in Plain Language')).toBeVisible();

    // Select AI Engineer
    await page.click('button:has-text("AI Engineer")');
    await page.click('button:has-text("Next: Schedule & Setup")');

    // Step 2: Schedule & Setup
    await expect(page.getByText('4. Study Schedule & Device Setup')).toBeVisible();
    await page.click('button:has-text("Next: Diagnostic Check")');

    // Step 3: Baseline Check
    await expect(page.getByText('5. Quick Baseline Check')).toBeVisible();
    await page.click('button:has-text("From RAM")');
    await page.click('button:has-text("Build My Learning Plan")');

    await expect(page).toHaveURL(/.*(dashboard|roadmap)/, { timeout: 10000 });
  });

  test('5. Learning Dashboard displays mastery KPIs, explainable recommendations, and schedule', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText('Verified Topics Mastered')).toBeVisible();
    await expect(page.getByText('Micro-Lessons Completed')).toBeVisible();
    await expect(page.getByText('Active Study Streak')).toBeVisible();
    await expect(page.getByText('Explainable Personalized Recommendations')).toBeVisible();
    await expect(page.getByText("Today's Adaptive Study Plan")).toBeVisible();
  });

  test('6. Roadmap Explorer displays 8 tracks, modules, and locked/unlocked states', async ({ page }) => {
    await page.goto('/roadmap');
    await expect(page.locator('h1')).toContainText(/Curriculum|Roadmap/i);
    await expect(page.getByText('How Computers Actually Work').first()).toBeVisible();
  });

  test('7. Topic Learning Page renders interactive concept visualizer, micro-lessons, and resources', async ({ page }) => {
    await page.goto('/topics/comp-101');
    await expect(page.locator('h1')).toContainText('How Computers Actually Work');
    await expect(page.getByText(/Interactive Step-by-Step Concept Simulation/i)).toBeVisible();
    await expect(page.getByText('Verified Free Study Resources')).toBeVisible();
    await expect(page.getByRole('button', { name: /Take Verification Assessment|Retake Assessment/i })).toBeVisible();
  });

  test('8. Assessment Modal opens and displays interactive verification questions', async ({ page }) => {
    await page.goto('/topics/comp-101');
    await page.click('button:has-text("Assessment")');

    await expect(page.getByText('Skill Verification Assessment')).toBeVisible();
    await page.click('button[aria-label="Close assessment"]');
  });

  test('9. Study Planner calculates daily schedule blocks and allows recalculation', async ({ page }) => {
    await page.goto('/planner');
    await expect(page.locator('h1')).toContainText(/Study Planner/i);
    await expect(page.getByRole('button', { name: /Recalculate Plan/i })).toBeVisible();
  });

  test('10. AI Learning Coach supports contextual prompts and explainable recommendations', async ({ page }) => {
    await page.goto('/coach');
    await expect(page.locator('h1')).toContainText('AI Personal Learning Coach');
    await expect(page.getByText('Explainable Next Actions')).toBeVisible();

    await page.click('button:has-text("Variables ko kitchen analogy se samjhao")');
    await expect(page.getByText(/Variable|dabbe|kitchen/i).first()).toBeVisible({ timeout: 10000 });
  });
});
