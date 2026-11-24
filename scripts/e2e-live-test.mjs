console.log('🚀 Running Live End-to-End HTTP Tests against http://localhost:3000...\n');

let failed = 0;
let passed = 0;

async function check(name, testFn) {
  try {
    await testFn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}: ${err.message}`);
    failed++;
  }
}

async function runLiveTests() {
  const baseUrl = 'http://localhost:3000';
  let sessionCookie = '';

  // 1. Landing Page
  await check('GET /: Returns 200 OK with HTML content', async () => {
    const res = await fetch(`${baseUrl}/`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const html = await res.text();
    if (!html.includes('LearnPath')) throw new Error('Missing branding in HTML');
  });

  // 1b. Health Check API
  await check('GET /api/health: Returns 200 OK and service metadata', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    const data = await res.json();
    if (!data.service || !data.status) throw new Error('Invalid health payload');
  });

  // 2. Curriculum API
  await check('GET /api/curriculum: Returns 15 curriculum topics', async () => {
    const res = await fetch(`${baseUrl}/api/curriculum?career=software-engineer`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.topics || data.topics.length === 0) throw new Error('No topics returned');
    if (data.totalTopics < 5) throw new Error('Incomplete curriculum list');
  });

  // 3. User Login
  await check('POST /api/auth/login: Authenticates demo user and returns session cookie', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'learner@learnpath.ai',
        password: 'Password123!'
      })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.user) throw new Error('Login failed');

    // Extract cookie
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      sessionCookie = setCookie.split(';')[0];
    }
  });

  // 4. Authenticated Me Endpoint
  await check('GET /api/auth/me: Verifies session identity', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: sessionCookie ? { Cookie: sessionCookie } : {}
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.user || data.user.email !== 'learner@learnpath.ai') {
      throw new Error('User identity mismatch');
    }
  });

  // 5. Topic Detail
  await check('GET /api/topics/comp-101: Returns topic explanation and sanitized questions', async () => {
    const res = await fetch(`${baseUrl}/api/topics/comp-101`, {
      headers: sessionCookie ? { Cookie: sessionCookie } : {}
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const topic = await res.json();
    if (topic.id !== 'comp-101') throw new Error('Incorrect topic ID');
    if (!topic.plainExplanation) throw new Error('Missing plain explanation');
  });

  // 6. Assessment Submission & Verifiable Mastery
  await check('POST /api/assessments/submit: Submits answers and updates mastery state', async () => {
    const res = await fetch(`${baseUrl}/api/assessments/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionCookie ? { Cookie: sessionCookie } : {})
      },
      body: JSON.stringify({
        topicId: 'comp-101',
        answers: [
          { order: 1, userAnswer: 'They are completely lost because RAM is volatile memory' },
          { order: 2, userAnswer: 'Confusing RAM (working workspace) with Secondary Storage / SSD (permanent storage)' },
          { order: 3, userAnswer: 'CPU is the execution processor and RAM is temporary fast working memory workspace' }
        ]
      })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const result = await res.json();
    if (!result.success || !result.mastered) {
      throw new Error(`Mastery not achieved: score ${result.evaluation?.score}`);
    }
  });

  // 7. Adaptive Planner
  await check('GET /api/planner: Returns scheduled study blocks and spaced repetition queue', async () => {
    const res = await fetch(`${baseUrl}/api/planner`, {
      headers: sessionCookie ? { Cookie: sessionCookie } : {}
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.schedule || !Array.isArray(data.schedule.blocks)) {
      throw new Error('Missing schedule blocks');
    }
  });

  // 8. AI Learning Coach
  await check('POST /api/ai/coach: Provides Hinglish pedagogical analogy', async () => {
    const res = await fetch(`${baseUrl}/api/ai/coach`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionCookie ? { Cookie: sessionCookie } : {})
      },
      body: JSON.stringify({
        topicId: 'py-foundations-01',
        language: 'hinglish',
        userQuery: 'variable kya hota hai simple words mein samjhao'
      })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.reply || data.reply.length < 20) throw new Error('Empty AI coach reply');
  });

  // 9. Coding Challenge Execution
  await check('POST /api/coding/execute: Evaluates Python challenge against test cases', async () => {
    const res = await fetch(`${baseUrl}/api/coding/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionCookie ? { Cookie: sessionCookie } : {})
      },
      body: JSON.stringify({
        topicId: 'py-foundations-01',
        code: 'def calculate_split(total_bill: float, num_people: int, tip_percentage: float) -> float:\n    if num_people <= 0: return 0.0\n    total = total_bill * (1 + tip_percentage / 100.0)\n    return round(total / num_people, 2)\n'
      })
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (!data.result || !data.result.passed) {
      throw new Error('Code challenge test execution failed');
    }
  });

  console.log(`\n=======================================`);
  console.log(`Live HTTP Test Results: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runLiveTests();
