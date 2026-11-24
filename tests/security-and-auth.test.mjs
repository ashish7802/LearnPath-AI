import test from 'node:test';
import assert from 'node:assert/strict';
import {
  registerSchema,
  loginSchema,
  onboardingSchema,
  codingExecuteSchema,
  projectSubmitSchema
} from '../src/lib/validations.ts';
import { checkRateLimit } from '../src/lib/rate-limit.ts';

test('1. Security Validation: Register schema enforces min 8 char password and email format', () => {
  const shortPass = registerSchema.safeParse({
    name: 'Alice',
    email: 'alice@example.com',
    password: 'short'
  });
  assert.equal(shortPass.success, false, 'Should reject password under 8 characters');

  const invalidEmail = registerSchema.safeParse({
    name: 'Alice',
    email: 'not-an-email',
    password: 'ValidPassword123!'
  });
  assert.equal(invalidEmail.success, false, 'Should reject malformed email');

  const valid = registerSchema.safeParse({
    name: 'Alice Cooper',
    email: 'alice@example.com',
    password: 'SecurePassword123!'
  });
  assert.equal(valid.success, true, 'Should accept valid registration payload');
});

test('2. Security Validation: Login schema requires non-empty credentials', () => {
  const empty = loginSchema.safeParse({ email: '', password: '' });
  assert.equal(empty.success, false);

  const valid = loginSchema.safeParse({ email: 'user@example.com', password: 'Password123!' });
  assert.equal(valid.success, true);
});

test('3. Security Validation: Onboarding schema enforces valid career pathways', () => {
  const invalidCareer = onboardingSchema.safeParse({
    careerGoal: 'crypto-trader' // Invalid path
  });
  assert.equal(invalidCareer.success, false, 'Should reject invalid career path');

  const validSWE = onboardingSchema.safeParse({
    careerGoal: 'software-engineer',
    dailyStudyMinutes: 45
  });
  assert.equal(validSWE.success, true);
});

test('4. Security Validation: Project submission requires valid public GitHub URL', () => {
  const nonGithub = projectSubmitSchema.safeParse({
    projectId: 'proj-1',
    repoUrl: 'https://gitlab.com/user/project',
    reflection: 'This is a sufficiently long reflection explaining trade-offs.'
  });
  assert.equal(nonGithub.success, false, 'Should require GitHub repository URL');

  const validGithub = projectSubmitSchema.safeParse({
    projectId: 'proj-1',
    repoUrl: 'https://github.com/ashish7802/LearnPath-AI',
    reflection: 'Detailed reflection on architecture, error handling, and tests.'
  });
  assert.equal(validGithub.success, true);
});

test('5. Rate Limiter: Blocks excessive requests after limit is reached', () => {
  const key = `test_limit_${Date.now()}`;
  const limit = 3;
  const windowSecs = 10;

  const r1 = checkRateLimit(key, limit, windowSecs);
  assert.equal(r1.allowed, true);
  assert.equal(r1.remaining, 2);

  const r2 = checkRateLimit(key, limit, windowSecs);
  assert.equal(r2.allowed, true);
  assert.equal(r2.remaining, 1);

  const r3 = checkRateLimit(key, limit, windowSecs);
  assert.equal(r3.allowed, true);
  assert.equal(r3.remaining, 0);

  // 4th request must be blocked
  const r4 = checkRateLimit(key, limit, windowSecs);
  assert.equal(r4.allowed, false, '4th request must be rate-limited');
  assert.equal(r4.remaining, 0);
  assert.ok(r4.resetInSeconds > 0);
});

test('6. Code Runner Security: Blocks oversized submissions', () => {
  const giantCode = 'a'.repeat(25000);
  const oversized = codingExecuteSchema.safeParse({
    topicId: 'comp-101',
    code: giantCode
  });
  assert.equal(oversized.success, false, 'Should reject code payloads over 20,000 characters');
});
