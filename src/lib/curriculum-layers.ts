import type { Topic } from './curriculum';

/**
 * Complete 6-Layer Educational Taxonomy:
 * Career -> Subject -> Module -> Topic -> Subtopic -> Micro-Lesson
 */

export interface MicroLessonCodeExample {
  language: 'python' | 'javascript' | 'html' | 'css' | 'sql' | 'bash' | 'c' | 'java' | 'go' | 'rust';
  title: string;
  code: string;
  runnable?: boolean;
  expectedOutput: string;
  lineByLine: { line: string; explanation: string }[];
}

export interface MicroLessonQuickCheck {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MicroLesson {
  id: string;
  title: string;
  estimatedMins: number;
  xpReward: number;
  meaning: string;
  purpose: string;
  realWorldAnalogy: string;
  stepByStep: string[];
  codeExample?: MicroLessonCodeExample;
  practicalUse: string;
  quickCheck: MicroLessonQuickCheck;
}

export interface Subtopic {
  id: string;
  title: string;
  summary: string;
  microLessons: MicroLesson[];
}

export interface SubjectDefinition {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  levelRange: string;
  order: number;
}

export interface CareerDefinition {
  id: string;
  title: string;
  shortTitle: string;
  category: string;
  duration: string;
  description: string;
  outcome: string;
  subjectIds: string[];
  tracks: string[];
}

export interface LanguageGuide {
  id: string;
  name: string;
  paradigm: string;
  usedFor: string;
  difficulty: 'Beginner Friendly' | 'Intermediate' | 'Systems & Advanced';
  relatedTopicId: string;
  starterConcept: string;
  runnableLanguage: 'javascript' | 'python';
  exampleCode: string;
  expectedOutput: string;
  syntaxBreakdown: { snippet: string; meaning: string }[];
}

export interface PracticeChallenge {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  language: 'javascript' | 'python';
  xpReward: number;
  instructions: string;
  starterCode: string;
  visibleTests: { input: string; expected: string; description: string }[];
  hiddenTests: { input: string; expected: string; description: string }[];
  solutionHint: string;
}

export const SUBJECTS: SubjectDefinition[] = [
  {
    id: 'subj-computer-basics',
    title: 'Computer Fundamentals & Operating Systems',
    shortTitle: 'Computer Basics',
    description: 'Start from absolute zero: binary, CPU, RAM, storage, operating systems, and command-line navigation.',
    levelRange: 'Zero to Beginner',
    order: 1,
  },
  {
    id: 'subj-programming-core',
    title: 'Programming Fundamentals & Languages',
    shortTitle: 'Programming & Languages',
    description: 'Variables, conditions, loops, functions, memory models, OOP, and modern languages (Python, JS, C, Java, Go, Rust).',
    levelRange: 'Beginner to Advanced',
    order: 2,
  },
  {
    id: 'subj-web-dev',
    title: 'Web Development (HTML, CSS, JS, React)',
    shortTitle: 'Web Development',
    description: 'Semantic markup, responsive layouts, DOM interactivity, TypeScript, and component-driven UI.',
    levelRange: 'Beginner to Intermediate',
    order: 3,
  },
  {
    id: 'subj-mobile-dev',
    title: 'Mobile App Development',
    shortTitle: 'Mobile Apps',
    description: 'Touch ergonomics, safe areas, stack & tab navigation, and offline-first cross-platform engineering.',
    levelRange: 'Beginner to Intermediate',
    order: 4,
  },
  {
    id: 'subj-software-eng',
    title: 'Software Engineering, Git, DSA & APIs',
    shortTitle: 'Software Engineering',
    description: 'Version control, data structures, time complexity, relational databases, and scalable backend APIs.',
    levelRange: 'Beginner to Advanced',
    order: 5,
  },
  {
    id: 'subj-databases-net',
    title: 'Networking, Internet Protocols & Databases',
    shortTitle: 'Networking & DBs',
    description: 'DNS, IP, TCP/IP, HTTP request/response cycles, SQL modeling, joins, and indexing.',
    levelRange: 'Beginner to Intermediate',
    order: 6,
  },
  {
    id: 'subj-data-science',
    title: 'Data Science & Practical Statistics',
    shortTitle: 'Data Science',
    description: 'Descriptive statistics, outliers, probability intuition, Pandas tabular workflows, and A/B analysis.',
    levelRange: 'Beginner to Intermediate',
    order: 7,
  },
  {
    id: 'subj-machine-learning',
    title: 'Machine Learning & Deep Learning',
    shortTitle: 'Machine Learning',
    description: 'Vectorized math, feature pipelines, supervised regression & classification, and neural networks.',
    levelRange: 'Intermediate to Advanced',
    order: 8,
  },
  {
    id: 'subj-ai-engineering',
    title: 'AI Engineering, LLMs, RAG & Agents',
    shortTitle: 'AI Engineering',
    description: 'Tokens, embeddings, semantic retrieval (RAG), tool-calling agents, and production guardrails.',
    levelRange: 'Intermediate to Advanced',
    order: 9,
  },
  {
    id: 'subj-cybersecurity',
    title: 'Cybersecurity & Defensive Engineering',
    shortTitle: 'Cybersecurity',
    description: 'CIA triad, salted hashing, encryption, OWASP defense against XSS & SQL injection, and threat modeling.',
    levelRange: 'Beginner to Intermediate',
    order: 10,
  },
  {
    id: 'subj-cloud-devops',
    title: 'Cloud Computing, Containers & DevOps',
    shortTitle: 'Cloud & DevOps',
    description: 'Linux workflows, Docker images & containers, CI/CD test pipelines, and resilient cloud architecture.',
    levelRange: 'Intermediate to Advanced',
    order: 11,
  },
];

export const CAREERS: CareerDefinition[] = [
  {
    id: 'software-engineer',
    title: 'Software Engineer',
    shortTitle: 'Software Eng',
    category: 'Core Engineering',
    duration: '4–6 months',
    description: 'Master computer internals, Python, Git workflows, data structures, SQL databases, networking, and backend APIs.',
    outcome: 'Build and ship tested backend services, CLI apps, and production software systems.',
    subjectIds: ['subj-computer-basics', 'subj-programming-core', 'subj-databases-net', 'subj-software-eng'],
    tracks: ['foundation', 'swe', 'systems', 'languages'],
  },
  {
    id: 'web-developer',
    title: 'Full-Stack Web Developer',
    shortTitle: 'Web Dev',
    category: 'Web & UI',
    duration: '4–5 months',
    description: 'Start from HTML & CSS Box Model, master JavaScript & React state, then connect to HTTP APIs and SQL databases.',
    outcome: 'Build responsive, accessible full-stack web applications end to end.',
    subjectIds: ['subj-computer-basics', 'subj-web-dev', 'subj-databases-net', 'subj-software-eng'],
    tracks: ['foundation', 'web', 'systems', 'swe'],
  },
  {
    id: 'mobile-developer',
    title: 'Mobile App Developer',
    shortTitle: 'Mobile Dev',
    category: 'Apps & Touch UX',
    duration: '4–5 months',
    description: 'Learn programming fundamentals, JavaScript & React component architecture, mobile touch layouts, and offline-first navigation.',
    outcome: 'Ship smooth cross-platform iOS & Android mobile apps with persistent local state.',
    subjectIds: ['subj-computer-basics', 'subj-web-dev', 'subj-mobile-dev', 'subj-databases-net'],
    tracks: ['foundation', 'web', 'mobile', 'systems'],
  },
  {
    id: 'ml-engineer',
    title: 'Machine Learning Engineer',
    shortTitle: 'ML Engineer',
    category: 'Data & Modeling',
    duration: '5–7 months',
    description: 'Progress from Python & practical statistics to NumPy/Pandas wrangling, Scikit-learn pipelines, and PyTorch deep learning.',
    outcome: 'Train, validate, and deploy leakage-free predictive models on real datasets.',
    subjectIds: ['subj-computer-basics', 'subj-programming-core', 'subj-data-science', 'subj-machine-learning'],
    tracks: ['foundation', 'data', 'ml'],
  },
  {
    id: 'ai-engineer',
    title: 'AI Engineer',
    shortTitle: 'AI Engineer',
    category: 'LLMs & Agents',
    duration: '4–6 months',
    description: 'Master Python, HTTP APIs, LLM tokenization, semantic embeddings, grounded RAG pipelines, and tool-using agents.',
    outcome: 'Engineer reliable, evaluated generative AI applications with citations and guardrails.',
    subjectIds: ['subj-computer-basics', 'subj-programming-core', 'subj-databases-net', 'subj-ai-engineering'],
    tracks: ['foundation', 'systems', 'ai'],
  },
  {
    id: 'data-scientist',
    title: 'Data Scientist',
    shortTitle: 'Data Science',
    category: 'Analytics & Stats',
    duration: '4–6 months',
    description: 'Combine Python, SQL queries, descriptive statistics, outlier detection, and supervised modeling for evidence-based decisions.',
    outcome: 'Clean messy datasets, run statistical experiments, and communicate clear analytical models.',
    subjectIds: ['subj-computer-basics', 'subj-programming-core', 'subj-data-science', 'subj-databases-net', 'subj-machine-learning'],
    tracks: ['foundation', 'data', 'ml'],
  },
  {
    id: 'cybersecurity-engineer',
    title: 'Cybersecurity Engineer',
    shortTitle: 'Cybersecurity',
    category: 'Defense & Trust',
    duration: '4–6 months',
    description: 'Understand OS & memory basics, terminal fluency, TCP/IP & HTTP networking, hashing/encryption, and OWASP defense.',
    outcome: 'Audit web and backend systems, remediate vulnerabilities, and author threat models.',
    subjectIds: ['subj-computer-basics', 'subj-databases-net', 'subj-cybersecurity', 'subj-programming-core'],
    tracks: ['foundation', 'systems', 'cybersecurity', 'languages'],
  },
  {
    id: 'cloud-devops-engineer',
    title: 'Cloud & DevOps Engineer',
    shortTitle: 'Cloud & DevOps',
    category: 'Infrastructure',
    duration: '4–6 months',
    description: 'Master the Linux shell, networking, Git automation, Docker containers, CI/CD pipelines, and resilient cloud systems.',
    outcome: 'Containerize, test, automate, and reliably operate multi-service cloud applications.',
    subjectIds: ['subj-computer-basics', 'subj-databases-net', 'subj-cloud-devops', 'subj-software-eng'],
    tracks: ['foundation', 'systems', 'cloud', 'swe'],
  },
];

export const LANGUAGE_GUIDES: LanguageGuide[] = [
  {
    id: 'python',
    name: 'Python',
    paradigm: 'Readable, General-Purpose',
    usedFor: 'Beginners, AI/ML, Data Science, Backend Automation',
    difficulty: 'Beginner Friendly',
    relatedTopicId: 'py-foundations-01',
    starterConcept: 'Clean indentation-based syntax that reads almost like plain English.',
    runnableLanguage: 'python',
    exampleCode: `def greet_learner(name, lessons_done):
    xp = lessons_done * 15
    return "Hello " + name + "! XP earned: " + str(xp)

print(greet_learner("Maya", 4))`,
    expectedOutput: 'Hello Maya! XP earned: 60',
    syntaxBreakdown: [
      { snippet: 'def greet_learner(...):', meaning: 'Defines a reusable function with named inputs.' },
      { snippet: 'xp = lessons_done * 15', meaning: 'Stores a calculated number in a variable named xp.' },
      { snippet: 'str(xp)', meaning: 'Converts the number into text so it can be joined with +.' },
    ],
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    paradigm: 'Event-Driven, Full-Stack',
    usedFor: 'Interactive Websites, React, Node.js APIs, Mobile Apps',
    difficulty: 'Beginner Friendly',
    relatedTopicId: 'web-js-01',
    starterConcept: 'Runs natively in every browser and on Node.js servers.',
    runnableLanguage: 'javascript',
    exampleCode: `const scores = [72, 85, 94, 60];
const passed = scores.filter(s => s >= 80);
console.log("Passed count:", passed.length);
console.log("Passing scores:", JSON.stringify(passed));`,
    expectedOutput: 'Passed count: 2\nPassing scores: [85,94]',
    syntaxBreakdown: [
      { snippet: 'const scores = [...]', meaning: 'Declares an immutable binding to a list (array) of numbers.' },
      { snippet: '.filter(s => s >= 80)', meaning: 'Keeps only values passing the condition without mutating the original list.' },
      { snippet: 'console.log(...)', meaning: 'Prints output to the developer console for inspection.' },
    ],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    paradigm: 'Typed JavaScript',
    usedFor: 'Large-Scale Frontend, Next.js, Enterprise Node.js',
    difficulty: 'Intermediate',
    relatedTopicId: 'web-react-01',
    starterConcept: 'Adds compile-time type safety on top of JavaScript so bugs are caught before running.',
    runnableLanguage: 'javascript',
    exampleCode: `// In TypeScript: function calcTotal(price: number, qty: number): number
function calcTotal(price, qty) {
  if (typeof price !== 'number' || typeof qty !== 'number') {
    throw new Error('Expected numeric inputs');
  }
  return price * qty;
}
console.log("Order total:", calcTotal(24, 3));`,
    expectedOutput: 'Order total: 72',
    syntaxBreakdown: [
      { snippet: 'price: number', meaning: 'Type annotations declare the exact shape of inputs and outputs.' },
      { snippet: 'interface Learner { ... }', meaning: 'Describes object shapes so editors autocomplete and catch typos immediately.' },
    ],
  },
  {
    id: 'sql',
    name: 'SQL',
    paradigm: 'Declarative Query Language',
    usedFor: 'PostgreSQL, SQLite, Analytics, Banking & User Data',
    difficulty: 'Beginner Friendly',
    relatedTopicId: 'swe-sql-01',
    starterConcept: 'Ask databases WHAT data you want using structured SELECT, WHERE, JOIN, and GROUP BY clauses.',
    runnableLanguage: 'javascript',
    exampleCode: `// Simulating: SELECT name, score FROM learners WHERE score >= 80 ORDER BY score DESC
const learners = [
  { name: "Aarav", score: 92 },
  { name: "Lin", score: 74 },
  { name: "Sofia", score: 88 }
];
const result = learners.filter(r => r.score >= 80).sort((a, b) => b.score - a.score);
console.log(JSON.stringify(result));`,
    expectedOutput: '[{"name":"Aarav","score":92},{"name":"Sofia","score":88}]',
    syntaxBreakdown: [
      { snippet: 'SELECT name, score', meaning: 'Picks only the columns you need.' },
      { snippet: 'WHERE score >= 80', meaning: 'Filters rows matching your condition.' },
      { snippet: 'ORDER BY score DESC', meaning: 'Sorts highest scores first.' },
    ],
  },
  {
    id: 'c',
    name: 'C',
    paradigm: 'Procedural, Close-to-Hardware',
    usedFor: 'Operating Systems, Embedded Hardware, Game Engines, Compilers',
    difficulty: 'Systems & Advanced',
    relatedTopicId: 'lang-c-01',
    starterConcept: 'Direct control over RAM addresses, pointers, and zero-overhead execution.',
    runnableLanguage: 'javascript',
    exampleCode: `// Simulating C memory slots (stack array of 4 integers)
const memory = [10, 20, 30, 40];
const pointerIndex = 2; // points to address #2
console.log("Value at pointer:", memory[pointerIndex]);
memory[pointerIndex] = 99;
console.log("Updated RAM:", JSON.stringify(memory));`,
    expectedOutput: 'Value at pointer: 30\nUpdated RAM: [10,20,99,40]',
    syntaxBreakdown: [
      { snippet: 'int *ptr = &x;', meaning: 'Stores the RAM address of variable x inside pointer ptr.' },
      { snippet: 'malloc / free', meaning: 'Requests and releases dynamic heap memory manually.' },
    ],
  },
  {
    id: 'java',
    name: 'Java',
    paradigm: 'Object-Oriented, Strongly Typed',
    usedFor: 'Enterprise Backends, Android Apps, Distributed Systems',
    difficulty: 'Intermediate',
    relatedTopicId: 'lang-java-01',
    starterConcept: 'Organizes complex software into encapsulated Classes, Objects, and Interfaces.',
    runnableLanguage: 'javascript',
    exampleCode: `class CourseProgress {
  constructor(title) {
    this.title = title;
    this.completed = 0;
  }
  completeLesson() {
    this.completed += 1;
  }
}
const c = new CourseProgress("Java OOP");
c.completeLesson();
c.completeLesson();
console.log(c.title + ": " + c.completed + " lessons done");`,
    expectedOutput: 'Java OOP: 2 lessons done',
    syntaxBreakdown: [
      { snippet: 'class CourseProgress', meaning: 'Blueprint defining fields (data) and methods (behavior).' },
      { snippet: 'new CourseProgress(...)', meaning: 'Instantiates an independent Object in memory.' },
    ],
  },
  {
    id: 'go',
    name: 'Go',
    paradigm: 'Concurrent, Cloud-Native',
    usedFor: 'Cloud Services, Docker/Kubernetes, High-Throughput APIs',
    difficulty: 'Intermediate',
    relatedTopicId: 'lang-go-rust-01',
    starterConcept: 'Minimal syntax, fast compilation, and effortless concurrency with goroutines & channels.',
    runnableLanguage: 'javascript',
    exampleCode: `// Modeling Go channel-style message passing between workers
const channel = [];
channel.push("Job 1: Build image");
channel.push("Job 2: Run tests");
while (channel.length > 0) {
  console.log("Worker received ->", channel.shift());
}`,
    expectedOutput: 'Worker received -> Job 1: Build image\nWorker received -> Job 2: Run tests',
    syntaxBreakdown: [
      { snippet: 'go worker(ch)', meaning: 'Spawns a lightweight concurrent goroutine.' },
      { snippet: 'ch <- value', meaning: 'Safely sends data across a typed channel.' },
    ],
  },
  {
    id: 'rust',
    name: 'Rust',
    paradigm: 'Memory-Safe Systems',
    usedFor: 'High-Performance Tooling, Browsers, Security-Critical Systems',
    difficulty: 'Systems & Advanced',
    relatedTopicId: 'lang-go-rust-01',
    starterConcept: 'Compile-time Ownership rules eliminate memory leaks and data races without a garbage collector.',
    runnableLanguage: 'javascript',
    exampleCode: `// Modeling Rust's single-owner transfer ("move") semantics
let ownerA = { data: "Important buffer" };
const ownerB = ownerA;
ownerA = null; // Ownership moved to ownerB
console.log("Current owner holds:", ownerB.data);`,
    expectedOutput: 'Current owner holds: Important buffer',
    syntaxBreakdown: [
      { snippet: 'let s2 = s1;', meaning: 'Moves ownership of heap memory so double-free bugs are impossible.' },
      { snippet: '&T / &mut T', meaning: 'Borrows a reference safely (many readers OR one writer).' },
    ],
  },
];

export const PRACTICE_CHALLENGES: PracticeChallenge[] = [
  {
    id: 'prac-binary-convert',
    title: 'Binary to Decimal Converter',
    category: 'Computer Fundamentals',
    difficulty: 'Beginner',
    language: 'javascript',
    xpReward: 40,
    instructions: 'Computers store everything in 0s and 1s. Write `binaryToDecimal(bits)` that converts a binary string like `"101"` into its base-10 integer (`5`).',
    starterCode: `function binaryToDecimal(bits) {\n  // Convert a string of '0' and '1' characters to a base-10 number\n  return 0;\n}`,
    visibleTests: [
      { input: "binaryToDecimal('101')", expected: '5', description: '1*4 + 0*2 + 1*1 = 5' },
      { input: "binaryToDecimal('1000')", expected: '8', description: '1*8 = 8' },
    ],
    hiddenTests: [
      { input: "binaryToDecimal('1111')", expected: '15', description: '4 ones equal 15' },
    ],
    solutionHint: 'You can loop over each character doubling a running total (`total = total * 2 + Number(ch)`), or use `parseInt(bits, 2)`.',
  },
  {
    id: 'prac-temp-convert',
    title: 'Celsius to Fahrenheit Converter (Python)',
    category: 'Python Basics',
    difficulty: 'Beginner',
    language: 'python',
    xpReward: 40,
    instructions: 'Write a Python function `to_fahrenheit(c)` that converts Celsius to Fahrenheit using the formula `(c * 9 / 5) + 32`.',
    starterCode: `def to_fahrenheit(c):\n    # Return temperature in Fahrenheit\n    return 0`,
    visibleTests: [
      { input: '0', expected: '32', description: 'Freezing point of water: 0°C -> 32°F' },
      { input: '100', expected: '212', description: 'Boiling point of water: 100°C -> 212°F' },
    ],
    hiddenTests: [
      { input: '25', expected: '77', description: 'Room temperature: 25°C -> 77°F' },
    ],
    solutionHint: 'Simply `return (c * 9 / 5) + 32`.',
  },
  {
    id: 'prac-word-freq',
    title: 'Count Word Occurrences',
    category: 'Data Structures & JS',
    difficulty: 'Intermediate',
    language: 'javascript',
    xpReward: 40,
    instructions: 'Write `countWord(sentence, target)` that counts how many times `target` appears as a whole word in `sentence` (case-insensitive).',
    starterCode: `function countWord(sentence, target) {\n  // Split into lowercase words and count exact matches\n  return 0;\n}`,
    visibleTests: [
      { input: "countWord('Code to learn and learn to code', 'learn')", expected: '2', description: 'Finds two occurrences of learn' },
      { input: "countWord('RAM and CPU work together', 'ram')", expected: '1', description: 'Matches case-insensitively' },
    ],
    hiddenTests: [
      { input: "countWord('hello world', 'python')", expected: '0', description: 'Returns 0 when not found' },
    ],
    solutionHint: 'Convert both strings with `.toLowerCase()`, split `sentence` by spaces, and `.filter(w => w === target.toLowerCase()).length`.',
  },
  {
    id: 'prac-password-strength',
    title: 'Password Policy Validator',
    category: 'Cybersecurity',
    difficulty: 'Intermediate',
    language: 'javascript',
    xpReward: 40,
    instructions: 'Write `isStrongPassword(pwd)` that returns `true` only if `pwd` has length >= 8, contains at least one uppercase letter, at least one lowercase letter, and at least one digit.',
    starterCode: `function isStrongPassword(pwd) {\n  // Verify length >= 8, uppercase, lowercase, and digit\n  return false;\n}`,
    visibleTests: [
      { input: "isStrongPassword('LearnPath2026')", expected: 'true', description: 'Strong mixed password passes' },
      { input: "isStrongPassword('short1A')", expected: 'false', description: 'Under 8 chars fails' },
      { input: "isStrongPassword('alllowercase123')", expected: 'false', description: 'Missing uppercase fails' },
    ],
    hiddenTests: [
      { input: "isStrongPassword('NoDigitsHere')", expected: 'false', description: 'Missing digit fails' },
    ],
    solutionHint: 'Check `pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /[0-9]/.test(pwd)`.',
  },
  {
    id: 'prac-slugify',
    title: 'URL Slug Generator',
    category: 'Web Development',
    difficulty: 'Beginner',
    language: 'javascript',
    xpReward: 40,
    instructions: 'Write `toSlug(title)` that trims whitespace, converts to lowercase, and replaces spaces with single hyphens (`-`). Example: `"  Learn Web Dev  "` -> `"learn-web-dev"`.',
    starterCode: `function toSlug(title) {\n  // Return clean lowercase hyphenated URL slug\n  return '';\n}`,
    visibleTests: [
      { input: "toSlug('Learn Web Dev')", expected: 'learn-web-dev', description: 'Converts spaces to hyphens' },
      { input: "toSlug('  Hello   World  ')", expected: 'hello-world', description: 'Collapses extra spaces and trims edges' },
    ],
    hiddenTests: [
      { input: "toSlug('Python Basics')", expected: 'python-basics', description: 'Lowercases all words' },
    ],
    solutionHint: 'Use `title.trim().toLowerCase().replace(/\\s+/g, "-")`.',
  },
];

// Curated hand-crafted deep Subtopics -> Micro-Lessons for flagship foundational & core topics
const CURATED_SUBTOPICS: Record<string, Subtopic[]> = {
  'comp-101': [
    {
      id: 'comp-101-sub-1',
      title: 'Binary & Digital Information (0s and 1s)',
      summary: 'How electricity turning ON and OFF represents every letter, photo, video, and app.',
      microLessons: [
        {
          id: 'comp-101-ml-1',
          title: 'What is a Bit and a Byte?',
          estimatedMins: 6,
          xpReward: 15,
          meaning: 'A bit (binary digit) is the smallest unit of information in a computer — just a single switch that can be OFF (0) or ON (1). Eight bits grouped together make 1 Byte, which is enough combinations (256) to store one typed letter like "A".',
          purpose: 'Computers run on electrical circuits, and detecting high voltage (1) vs low voltage (0) is vastly faster and less error-prone than measuring 10 different voltage levels.',
          realWorldAnalogy: 'Think of a bedroom light switch: DOWN means 0 (off) and UP means 1 (on). A row of 8 light switches on a wall can spell out any letter in the alphabet by turning specific switches on and off.',
          stepByStep: [
            '1 bit gives 2 possibilities: 0 or 1.',
            '2 bits give 4 possibilities: 00, 01, 10, 11.',
            '8 bits = 1 Byte = 256 possibilities (numbers 0 to 255).',
            '1,024 Bytes ≈ 1 Kilobyte (a short text note); 1,024 Megabytes ≈ 1 Gigabyte (a short movie).',
          ],
          codeExample: {
            language: 'javascript',
            title: 'See how a computer converts letters and numbers into Binary',
            runnable: true,
            code: `const number = 13;
console.log("13 in binary is:", number.toString(2));
const letterCode = "A".charCodeAt(0);
console.log("Letter A code:", letterCode, "-> Binary:", letterCode.toString(2));`,
            expectedOutput: '13 in binary is: 1101\nLetter A code: 65 -> Binary: 1000001',
            lineByLine: [
              { line: 'number.toString(2)', explanation: 'Converts base-10 number 13 into base-2 binary (8+4+0+1 = 1101).' },
              { line: '"A".charCodeAt(0)', explanation: 'Looks up the standard ASCII/Unicode number for capital A (65).' },
            ],
          },
          practicalUse: 'Explains file sizes (KB, MB, GB), image color depth (24-bit RGB), and why integer limits exist in programming languages.',
          quickCheck: {
            question: 'How many bits make up 1 Byte?',
            options: ['2 bits', '4 bits', '8 bits', '100 bits'],
            correctIndex: 2,
            explanation: '1 Byte always equals 8 bits, giving 2^8 = 256 distinct values.',
          },
        },
      ],
    },
    {
      id: 'comp-101-sub-2',
      title: 'CPU, RAM, Storage & The Operating System',
      summary: 'Meet the four core workers inside every laptop, phone, and cloud server.',
      microLessons: [
        {
          id: 'comp-101-ml-2',
          title: 'The Kitchen Analogy: CPU vs RAM vs SSD',
          estimatedMins: 8,
          xpReward: 15,
          meaning: 'The CPU executes instructions one step at a time, RAM holds the data currently being worked on (wiped when power turns off), and the SSD/Hard Drive stores files permanently even without electricity.',
          purpose: 'Permanent storage (SSD) is spacious but slower; RAM is super fast so the CPU does not sit idle waiting for ingredients.',
          realWorldAnalogy: 'CPU is the Chef cooking the meal. RAM is the Kitchen Counter holding the chopped vegetables currently in use. SSD is the Pantry where groceries stay stored overnight.',
          stepByStep: [
            'When you double-click an app icon, the Operating System copies the app from the SSD (pantry) into RAM (kitchen counter).',
            'The CPU (chef) fetches instructions from RAM billions of times per second.',
            'When you click Save, the Operating System writes your work from RAM back to the SSD.',
            'If power cuts out before saving, anything still only on the RAM counter vanishes.',
          ],
          practicalUse: 'When your code creates variables, they live in RAM. When you write to a file or database, it persists on SSD storage.',
          quickCheck: {
            question: 'In the kitchen analogy, what happens to items in RAM when the computer loses power?',
            options: [
              'They are permanently saved in the pantry',
              'They disappear because RAM is volatile working memory',
              'The CPU prints them to the screen forever',
              'They move into the keyboard',
            ],
            correctIndex: 1,
            explanation: 'RAM requires electricity to hold data. Only persistent storage (SSD/HDD) retains data without power.',
          },
        },
        {
          id: 'comp-101-ml-3',
          title: 'What Does an Operating System Actually Do?',
          estimatedMins: 6,
          xpReward: 15,
          meaning: 'An Operating System (Windows, macOS, Linux, Android, iOS) is the traffic controller between your programs and the physical hardware.',
          purpose: 'Without an OS, every single app would have to write raw electrical signals for every brand of keyboard, screen, Wi-Fi chip, and disk.',
          realWorldAnalogy: 'Think of the OS as a restaurant manager: it assigns tables (RAM), schedules shifts for chefs (CPU time slices), and locks the storage room (file permissions) so apps cannot corrupt each other.',
          stepByStep: [
            'Process scheduling: switches the CPU rapidly among your browser, music player, and code editor.',
            'Memory isolation: stops one buggy app from reading another app’s passwords in RAM.',
            'File system management: organizes bytes on disk into named folders and files.',
          ],
          practicalUse: 'Most cloud servers run Linux, so understanding OS processes, files, and permissions prepares you for every engineering career.',
          quickCheck: {
            question: 'Which of the following is a core responsibility of the Operating System?',
            options: [
              'Designing website logos',
              'Managing CPU scheduling, RAM allocation, and file permissions safely across apps',
              'Writing Python loops automatically',
              'Increasing monitor physical size',
            ],
            correctIndex: 1,
            explanation: 'The OS coordinates shared hardware safely among all running applications.',
          },
        },
      ],
    },
  ],
  'py-foundations-01': [
    {
      id: 'py-01-sub-1',
      title: 'Variables: Named Boxes in Computer Memory',
      summary: 'How to store, update, and reuse data cleanly in Python.',
      microLessons: [
        {
          id: 'py-01-ml-1',
          title: 'Creating and Updating Variables',
          estimatedMins: 7,
          xpReward: 15,
          meaning: 'A variable is a human-readable name attached to a piece of data stored in RAM. The equals sign `=` means "store the right-hand value into the left-hand label".',
          purpose: 'Instead of repeating raw numbers everywhere, variables let your program remember user inputs, scores, prices, and calculation results.',
          realWorldAnalogy: 'A labeled spice jar in a kitchen: the label (`score`) stays on the outside, while you can replace the contents inside (`10` -> `20`) whenever you like.',
          stepByStep: [
            'Pick a clear lowercase name with underscores, like `daily_minutes = 45`.',
            'Never start a variable name with a number or put spaces inside it.',
            'Update it later with `daily_minutes = daily_minutes + 15`.',
          ],
          codeExample: {
            language: 'python',
            title: 'Storing and updating learner XP',
            runnable: true,
            code: `learner_name = "Aarav"
xp = 100
xp = xp + 25
print(learner_name + " now has " + str(xp) + " XP")`,
            expectedOutput: 'Aarav now has 125 XP',
            lineByLine: [
              { line: 'learner_name = "Aarav"', explanation: 'Creates a text (string) variable holding "Aarav".' },
              { line: 'xp = 100', explanation: 'Creates an integer variable holding 100.' },
              { line: 'xp = xp + 25', explanation: 'Reads the old value (100), adds 25, and saves 125 back into xp.' },
            ],
          },
          practicalUse: 'Every app uses variables to track login status, shopping cart totals, sensor readings, and game health.',
          quickCheck: {
            question: 'After running `x = 10` and then `x = x + 5`, what value is stored in `x`?',
            options: ['10', '5', '15', 'Error'],
            correctIndex: 2,
            explanation: 'Python evaluates the right side first (10 + 5 = 15), then updates `x` to hold 15.',
          },
        },
        {
          id: 'py-01-ml-2',
          title: 'Core Data Types: int, float, str, and bool',
          estimatedMins: 7,
          xpReward: 15,
          meaning: 'Every value has a Data Type that tells the computer what operations are valid on it: whole numbers (`int`), decimals (`float`), text (`str`), and true/false flags (`bool`).',
          purpose: 'Adding two numbers (`5 + 5 = 10`) is completely different from joining two words (`"5" + "5" = "55"`). Knowing types prevents sudden crashes.',
          realWorldAnalogy: 'Just like you cannot pour soup into a paper envelope or mail a bowling ball in a letter slot, each container type fits specific operations.',
          stepByStep: [
            'Integer (`int`): whole numbers like `0`, `42`, `-7`.',
            'Float (`float`): decimals like `3.14`, `99.95`.',
            'String (`str`): text wrapped in quotes like `"Hello"`.',
            'Boolean (`bool`): strictly `True` or `False` for yes/no decisions.',
          ],
          codeExample: {
            language: 'python',
            title: 'Why types matter when adding values',
            runnable: true,
            code: `num_a = 5
num_b = 5
text_a = "5"
text_b = "5"
print("Numbers:", num_a + num_b)
print("Strings:", text_a + text_b)`,
            expectedOutput: 'Numbers: 10\nStrings: 55',
            lineByLine: [
              { line: 'num_a + num_b', explanation: 'Adds two integers mathematically to get 10.' },
              { line: 'text_a + text_b', explanation: 'Concatenates (glues) two strings together into "55".' },
            ],
          },
          practicalUse: 'User input from forms or terminals almost always arrives as strings, so converting with `int()` or `float()` is essential before doing math.',
          quickCheck: {
            question: 'What is the result of `"10" + "20"` in Python?',
            options: ['30', '"1020"', '200', '10'],
            correctIndex: 1,
            explanation: 'Because both values are quoted strings, `+` joins them side-by-side into `"1020"`.',
          },
        },
      ],
    },
  ],
  'web-html-01': [
    {
      id: 'web-html-sub-1',
      title: 'Anatomy of an HTML Element & Document',
      summary: 'How opening tags, attributes, and semantic landmarks build every website.',
      microLessons: [
        {
          id: 'web-html-ml-1',
          title: 'Tags, Attributes & Semantic Landmarks',
          estimatedMins: 7,
          xpReward: 15,
          meaning: 'An HTML element has an opening tag like `<h1>`, content inside, and a closing tag `</h1>`. Semantic tags like `<header>`, `<nav>`, `<main>`, and `<footer>` describe the MEANING of each region.',
          purpose: 'Browsers, Google search bots, and screen readers for blind users rely on semantic tags to jump straight to navigation, articles, and buttons.',
          realWorldAnalogy: 'Think of HTML like a book outline: Title, Table of Contents (`<nav>`), Main Chapters (`<main>`), and Index (`<footer>`).',
          stepByStep: [
            'Start every page with `<!DOCTYPE html>` so the browser uses modern standards.',
            'Use one `<h1>` for the page title, then `<h2>` and `<h3>` in logical order.',
            'Always include `alt="..."` on images and `<label>` on form inputs.',
          ],
          codeExample: {
            language: 'javascript',
            title: 'Inspecting semantic HTML structure',
            runnable: true,
            code: `const page = [
  "<header><nav><a href='/'>Home</a></nav></header>",
  "<main><h1>Learn HTML</h1><p>Start from zero.</p></main>",
  "<footer>Copyright 2026</footer>"
].join("\\n");
console.log(page);`,
            expectedOutput: "<header><nav><a href='/'>Home</a></nav></header>\n<main><h1>Learn HTML</h1><p>Start from zero.</p></main>\n<footer>Copyright 2026</footer>",
            lineByLine: [
              { line: '<header><nav>...', explanation: 'Marks the top navigation area cleanly.' },
              { line: '<main><h1>...', explanation: 'Holds the unique primary content of the page.' },
            ],
          },
          practicalUse: 'Every React, Next.js, Vue, and mobile WebView app renders HTML under the hood.',
          quickCheck: {
            question: 'Which element should wrap the primary navigation links at the top of a website?',
            options: ['<nav>', '<p>', '<small>', '<br>'],
            correctIndex: 0,
            explanation: '`<nav>` explicitly marks major navigation links for browsers and assistive technology.',
          },
        },
      ],
    },
  ],
};

/**
 * Resolve which Subject a Topic belongs to so the 6-Layer hierarchy
 * (Career -> Subject -> Module -> Topic -> Subtopic -> Micro-Lesson) is always complete.
 */
export function resolveTopicSubjectId(topic: Topic & { subjectId?: string }): string {
  if (topic.subjectId) return topic.subjectId;
  if (topic.id === 'comp-101' || topic.id === 'terminal-101') return 'subj-computer-basics';
  if (topic.track === 'foundation' || topic.track === 'languages') return 'subj-programming-core';
  if (topic.track === 'web') return 'subj-web-dev';
  if (topic.track === 'mobile') return 'subj-mobile-dev';
  if (topic.id === 'swe-sql-01' || topic.track === 'systems') return 'subj-databases-net';
  if (topic.track === 'swe') return 'subj-software-eng';
  if (topic.track === 'data') return 'subj-data-science';
  if (topic.track === 'ml') return 'subj-machine-learning';
  if (topic.track === 'ai') return 'subj-ai-engineering';
  if (topic.track === 'cybersecurity') return 'subj-cybersecurity';
  if (topic.track === 'cloud') return 'subj-cloud-devops';
  return 'subj-software-eng';
}

/**
 * Hydrate every Topic with deeply structured Subtopics & Micro-Lessons.
 * Uses hand-authored micro-lessons where available and generates structured,
 * beginner-friendly, topic-grounded Subtopics & Micro-Lessons from the topic's
 * verified explanation, objectives, mistakes, and code examples for all remaining topics.
 */
export function getSubtopicsForTopic(topic: Topic): Subtopic[] {
  if (CURATED_SUBTOPICS[topic.id]) {
    return CURATED_SUBTOPICS[topic.id];
  }

  const firstObj = topic.learningObjectives[0] || `Understand the fundamentals of ${topic.title}`;
  const secondObj = topic.learningObjectives[1] || `Apply ${topic.title} in practical exercises`;
  const thirdObj = topic.learningObjectives[2] || `Avoid common beginner pitfalls in ${topic.title}`;
  const firstMistake = topic.commonMistakes[0] || 'Skipping small step-by-step verification tests before moving on.';

  const firstQ = topic.assessment?.questions?.[0];
  const fallbackOptions =
    firstQ?.options && firstQ.options.length >= 2
      ? firstQ.options
      : [
          topic.learningObjectives[0] || 'Understand the core mechanism step by step',
          'Memorize syntax without understanding why it works',
          'Skip fundamentals and copy random code',
        ];
  const fallbackCorrectIdx =
    firstQ?.options && firstQ.correctAnswer
      ? Math.max(0, firstQ.options.indexOf(firstQ.correctAnswer))
      : 0;

  const subtopics: Subtopic[] = [
    {
      id: `${topic.id}-sub-1`,
      title: '1. Core Mental Model & Plain-Language Intuition',
      summary: `Build rock-solid intuition for ${topic.title} with zero unexplained jargon.`,
      microLessons: [
        {
          id: `${topic.id}-ml-1`,
          title: `Understanding ${topic.title.split(':')[0]}`,
          estimatedMins: Math.max(6, Math.round(topic.estimatedLessonMins * 0.45)),
          xpReward: 15,
          meaning: topic.plainExplanation,
          purpose: topic.whyItMatters,
          realWorldAnalogy: `Approach ${topic.title.split(':')[0]} like assembling a machine from labeled parts: understand what input enters, what single transformation happens inside, and what predictable output comes out.`,
          stepByStep: [
            `Goal 1: ${firstObj}.`,
            `Goal 2: ${secondObj}.`,
            `Goal 3: ${thirdObj}.`,
          ],
          practicalUse: `Used daily in production engineering whenever teams need reliable, maintainable solutions for ${topic.moduleTitle.toLowerCase()}.`,
          quickCheck: {
            question: firstQ?.prompt || `What is the primary goal when learning ${topic.title}?`,
            options: fallbackOptions,
            correctIndex: fallbackCorrectIdx,
            explanation: firstQ?.explanation || topic.plainExplanation,
          },
        },
      ],
    },
    {
      id: `${topic.id}-sub-2`,
      title: '2. Hands-On Walkthrough & Avoiding Common Pitfalls',
      summary: 'Trace real examples line by line and learn the exact mistakes beginners hit first.',
      microLessons: [
        {
          id: `${topic.id}-ml-2`,
          title: 'Step-by-Step Practical Application & Edge Cases',
          estimatedMins: Math.max(6, Math.round(topic.estimatedLessonMins * 0.55)),
          xpReward: 15,
          meaning: `Real mastery comes from applying ${topic.title.split(':')[0]} to concrete inputs and spotting subtle bugs early.`,
          purpose: `Preventing predictable mistakes — especially: "${firstMistake}" — saves hours of frustration in real projects.`,
          realWorldAnalogy: 'Just like pilots run a short pre-flight checklist before takeoff, engineers check edge cases (empty inputs, wrong types, boundary values) before trusting their code.',
          stepByStep: [
            'Read the problem inputs and expected output format carefully.',
            'Trace one small example by hand before writing code.',
            `Watch out for this frequent pitfall: ${firstMistake}`,
            'Verify your work with at least two normal cases and one edge case.',
          ],
          codeExample: topic.codingChallenge
            ? {
                language: topic.codingChallenge.language,
                title: `Starter Pattern: ${topic.codingChallenge.title}`,
                runnable: true,
                code: topic.codingChallenge.starterCode,
                expectedOutput: topic.codingChallenge.visibleTests[0]
                  ? `Target for ${topic.codingChallenge.visibleTests[0].input} -> ${topic.codingChallenge.visibleTests[0].expected}`
                  : 'Verify with the coding runner below.',
                lineByLine: [
                  { line: 'Function signature', explanation: 'Defines the exact input parameters your logic will receive.' },
                  { line: 'Return statement', explanation: 'Sends your computed answer back so automated tests can verify it.' },
                ],
              }
            : undefined,
          practicalUse: `Directly prepares you for the topic coding challenge and verification assessment (${topic.masteryThreshold}% passing mastery bar).`,
          quickCheck: {
            question: 'Which habit most reliably prevents silent bugs when practicing this topic?',
            options: [
              'Testing small inputs and edge cases step by step',
              'Ignoring error messages until the end of the week',
              'Avoiding writing any tests or checks',
              'Guessing outputs without tracing the logic',
            ],
            correctIndex: 0,
            explanation: 'Tracing small inputs and verifying edge cases immediately exposes assumptions and builds deep mastery.',
          },
        },
      ],
    },
  ];

  return subtopics;
}

export function getCareerById(careerId: string): CareerDefinition {
  return CAREERS.find((c) => c.id === careerId) || CAREERS[0];
}
