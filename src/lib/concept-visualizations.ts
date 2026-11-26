/**
 * Client-safe Interactive Animated Concept Visualization Specifications.
 * Covers:
 * 1. Binary Search (O(log n) halving)
 * 2. CPU, RAM & Storage (Fetch-Decode-Execute cycle)
 * 3. Recursion & Call Stack (Base case vs unwinding)
 * 4. Database Joins (INNER JOIN vs LEFT JOIN)
 * 5. RAG Pipeline & Vector Embeddings
 */

export interface ConceptAnimationStep {
  stepNumber: number;
  label: string;
  whatChanges: string;
  codeOrFormula: string;
  visualState: {
    items: {
      id: string;
      label: string;
      sublabel?: string;
      status: 'default' | 'active' | 'eliminated' | 'found' | 'flowing';
    }[];
    pointerLabel?: string;
    metricLabel?: string;
  };
}

export interface ConceptVisualizationSpec {
  id: string;
  title: string;
  category: string;
  relatedTopicIds: string[];
  problemIntroduction: string;
  conceptConnection: string;
  practicalExample: string;
  steps: ConceptAnimationStep[];
  comprehensionQuestion: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const CONCEPT_VISUALIZATIONS: ConceptVisualizationSpec[] = [
  {
    id: 'binary-search',
    title: 'Binary Search: Halving the Search Space (O(log n))',
    category: 'Algorithms & Data Structures',
    relatedTopicIds: ['swe-dsa-01', 'swe-dsa-02', 'py-control-02'],
    problemIntroduction:
      'Imagine looking for a word in a 1,000-page sorted dictionary. Flipping page by page takes up to 1,000 checks. Opening straight to the middle lets you throw away half the book on every single step.',
    conceptConnection:
      'Binary search maintains three pointers (Low, Mid, High) on a sorted array. Comparing the middle element against the target eliminates 50% of remaining elements each iteration.',
    practicalExample:
      'Database B-Tree indexes and Git bisect use binary search to locate a record among 1,000,000 sorted rows in at most 20 comparisons.',
    steps: [
      {
        stepNumber: 1,
        label: 'Initial Sorted Array (Find Target = 42)',
        whatChanges:
          'Set Low = index 0 (value 4) and High = index 6 (value 64). Compute Mid = floor((0 + 6) / 2) = index 3.',
        codeOrFormula: 'low = 0, high = 6 -> mid = 3 (arr[3] == 23)',
        visualState: {
          pointerLabel: 'Low=0 · Mid=3 · High=6',
          metricLabel: '7 candidates active',
          items: [
            { id: '0', label: '4', sublabel: 'idx 0 (Low)', status: 'default' },
            { id: '1', label: '9', sublabel: 'idx 1', status: 'default' },
            { id: '2', label: '16', sublabel: 'idx 2', status: 'default' },
            { id: '3', label: '23', sublabel: 'idx 3 (Mid)', status: 'active' },
            { id: '4', label: '42', sublabel: 'idx 4', status: 'default' },
            { id: '5', label: '55', sublabel: 'idx 5', status: 'default' },
            { id: '6', label: '64', sublabel: 'idx 6 (High)', status: 'default' },
          ],
        },
      },
      {
        stepNumber: 2,
        label: 'Discard Left Half (23 < 42)',
        whatChanges:
          'Since arr[3] (23) is smaller than 42, the target cannot be at or left of index 3. Move Low to Mid + 1 = index 4.',
        codeOrFormula: '23 < 42 -> low = mid + 1 = 4, high = 6',
        visualState: {
          pointerLabel: 'Low=4 · Mid=5 · High=6',
          metricLabel: '4 elements eliminated in 1 check',
          items: [
            { id: '0', label: '4', sublabel: 'eliminated', status: 'eliminated' },
            { id: '1', label: '9', sublabel: 'eliminated', status: 'eliminated' },
            { id: '2', label: '16', sublabel: 'eliminated', status: 'eliminated' },
            { id: '3', label: '23', sublabel: 'eliminated', status: 'eliminated' },
            { id: '4', label: '42', sublabel: 'idx 4 (Low)', status: 'default' },
            { id: '5', label: '55', sublabel: 'idx 5 (Mid)', status: 'active' },
            { id: '6', label: '64', sublabel: 'idx 6 (High)', status: 'default' },
          ],
        },
      },
      {
        stepNumber: 3,
        label: 'Discard Right Half (55 > 42)',
        whatChanges:
          'New Mid is index 5 (value 55). Because 55 > 42, discard index 5 and everything to its right. Move High to Mid - 1 = index 4.',
        codeOrFormula: '55 > 42 -> high = mid - 1 = 4',
        visualState: {
          pointerLabel: 'Low=4 · Mid=4 · High=4',
          metricLabel: '1 candidate remaining',
          items: [
            { id: '0', label: '4', sublabel: 'eliminated', status: 'eliminated' },
            { id: '1', label: '9', sublabel: 'eliminated', status: 'eliminated' },
            { id: '2', label: '16', sublabel: 'eliminated', status: 'eliminated' },
            { id: '3', label: '23', sublabel: 'eliminated', status: 'eliminated' },
            { id: '4', label: '42', sublabel: 'idx 4 (Mid)', status: 'active' },
            { id: '5', label: '55', sublabel: 'eliminated', status: 'eliminated' },
            { id: '6', label: '64', sublabel: 'eliminated', status: 'eliminated' },
          ],
        },
      },
      {
        stepNumber: 4,
        label: 'Target Found at Index 4!',
        whatChanges:
          'Mid = floor((4 + 4) / 2) = 4. arr[4] equals 42! Found in 3 comparisons instead of scanning every item.',
        codeOrFormula: 'arr[4] == 42 -> return 4 (O(log n) complete)',
        visualState: {
          pointerLabel: 'Found at Index 4',
          metricLabel: 'Total checks: 3 (vs 5 linear)',
          items: [
            { id: '0', label: '4', sublabel: 'eliminated', status: 'eliminated' },
            { id: '1', label: '9', sublabel: 'eliminated', status: 'eliminated' },
            { id: '2', label: '16', sublabel: 'eliminated', status: 'eliminated' },
            { id: '3', label: '23', sublabel: 'eliminated', status: 'eliminated' },
            { id: '4', label: '42', sublabel: 'MATCH (idx 4)', status: 'found' },
            { id: '5', label: '55', sublabel: 'eliminated', status: 'eliminated' },
            { id: '6', label: '64', sublabel: 'eliminated', status: 'eliminated' },
          ],
        },
      },
    ],
    comprehensionQuestion: {
      question: 'Why must an array be sorted before running Binary Search?',
      options: [
        'Because comparing the middle element only tells us which half to discard if values are in order',
        'Because unsorted arrays cannot be stored in RAM',
        'Because Python lists only accept sorted numbers',
      ],
      correctIndex: 0,
      explanation:
        'Disregarding an entire half of the array is only valid when we know every item to the left is smaller and every item to the right is larger.',
    },
  },
  {
    id: 'cpu-ram-cycle',
    title: 'CPU, RAM & Storage: The Fetch–Decode–Execute Cycle',
    category: 'Computer Fundamentals',
    relatedTopicIds: ['comp-101', 'terminal-101', 'lang-c-01'],
    problemIntroduction:
      'Beginners often wonder why a computer needs both a 512GB SSD and 16GB of RAM. Why not run programs straight from the SSD?',
    conceptConnection:
      'An SSD keeps files permanently even when power is off, but it is too slow for nanosecond CPU math. RAM acts as the ultra-fast active workbench where running code and variables live.',
    practicalExample:
      'Opening a Python script copies it from SSD into RAM; the CPU then fetches one instruction at a time into its internal registers.',
    steps: [
      {
        stepNumber: 1,
        label: 'Program Stored on SSD (Cold Storage)',
        whatChanges:
          'Your file script.py sits safely on the non-volatile SSD disk. RAM and CPU registers are idle.',
        codeOrFormula: 'SSD [script.py: x = 10 + 5] -> Persistent on disk',
        visualState: {
          pointerLabel: 'Stage 1: Program at Rest',
          metricLabel: 'SSD Latency: ~50,000 ns',
          items: [
            { id: 'ssd', label: 'SSD Storage', sublabel: 'script.py saved', status: 'active' },
            { id: 'ram', label: 'RAM Workbench', sublabel: 'Waiting for load', status: 'default' },
            { id: 'cpu', label: 'CPU Core & ALU', sublabel: 'Idle', status: 'default' },
            { id: 'out', label: 'Screen Output', sublabel: 'No output yet', status: 'default' },
          ],
        },
      },
      {
        stepNumber: 2,
        label: 'OS Loads Instructions into RAM',
        whatChanges:
          'When you run python script.py, the Operating System copies instructions and variables into fast RAM memory addresses.',
        codeOrFormula: 'OS Loader -> RAM[0x1040] = "LOAD 10, ADD 5"',
        visualState: {
          pointerLabel: 'Stage 2: Loaded in RAM',
          metricLabel: 'RAM Latency: ~15 ns (3,000x faster)',
          items: [
            { id: 'ssd', label: 'SSD Storage', sublabel: 'Read complete', status: 'default' },
            { id: 'ram', label: 'RAM Workbench', sublabel: '0x1040: x = 10 + 5', status: 'flowing' },
            { id: 'cpu', label: 'CPU Core & ALU', sublabel: 'Fetching 0x1040', status: 'active' },
            { id: 'out', label: 'Screen Output', sublabel: 'Pending', status: 'default' },
          ],
        },
      },
      {
        stepNumber: 3,
        label: 'CPU ALU Executes Math & Writes Result',
        whatChanges:
          'The CPU Arithmetic Logic Unit (ALU) adds 10 + 5 in binary (1111) and writes 15 back to variable x in RAM and prints to screen.',
        codeOrFormula: 'CPU ALU: 00001010 + 00000101 = 00001111 (15)',
        visualState: {
          pointerLabel: 'Stage 3: Execute & Store',
          metricLabel: 'CPU Cycle: < 1 ns',
          items: [
            { id: 'ssd', label: 'SSD Storage', sublabel: 'Unchanged', status: 'default' },
            { id: 'ram', label: 'RAM Workbench', sublabel: 'x = 15 stored', status: 'found' },
            { id: 'cpu', label: 'CPU Core & ALU', sublabel: 'Computed 10+5=15', status: 'found' },
            { id: 'out', label: 'Screen Output', sublabel: 'Displays: 15', status: 'found' },
          ],
        },
      },
    ],
    comprehensionQuestion: {
      question: 'What happens to variables stored in RAM if the computer suddenly loses power?',
      options: [
        'They vanish immediately because RAM is volatile working memory',
        'They are automatically saved to the SSD hard drive',
        'They stay inside the monitor cable',
      ],
      correctIndex: 0,
      explanation:
        'RAM requires continuous electrical charge to hold bits. Only data explicitly written to SSD/disk survives a power loss.',
    },
  },
  {
    id: 'recursion-call-stack',
    title: 'Recursion & The Call Stack: Base Case vs Unwinding',
    category: 'Programming Fundamentals',
    relatedTopicIds: ['py-foundations-01', 'swe-dsa-01', 'swe-dsa-02'],
    problemIntroduction:
      'When a function calls itself, how does the computer remember where to return without getting trapped in an infinite loop?',
    conceptConnection:
      'Every function call pushes a new Stack Frame onto RAM with its own local variables. Once the Base Case is reached, frames pop off in reverse order (Last-In, First-Out).',
    practicalExample:
      'Traversing nested folder directories, parsing JSON trees, and Divide-and-Conquer sorting (MergeSort/QuickSort).',
    steps: [
      {
        stepNumber: 1,
        label: 'Push Frames Down Toward Base Case',
        whatChanges:
          'factorial(3) calls factorial(2), which calls factorial(1). Each call pauses and waits on the Call Stack.',
        codeOrFormula: 'Stack: [fact(3)] -> [fact(2)] -> [fact(1) BASE CASE]',
        visualState: {
          pointerLabel: 'Phase 1: Pushing Stack Frames',
          metricLabel: 'Stack Depth: 3 frames',
          items: [
            { id: 'f3', label: 'factorial(3)', sublabel: 'waiting for 3 * fact(2)', status: 'default' },
            { id: 'f2', label: 'factorial(2)', sublabel: 'waiting for 2 * fact(1)', status: 'default' },
            { id: 'f1', label: 'factorial(1)', sublabel: 'Base Case! returns 1', status: 'active' },
          ],
        },
      },
      {
        stepNumber: 2,
        label: 'Base Case Reached -> Unwind Frame 2',
        whatChanges:
          'factorial(1) returns 1 and pops off the stack. Now factorial(2) resumes: 2 * 1 = 2.',
        codeOrFormula: 'fact(1) -> 1 | fact(2) computes 2 * 1 = 2',
        visualState: {
          pointerLabel: 'Phase 2: Unwinding Stack',
          metricLabel: 'fact(1) popped',
          items: [
            { id: 'f3', label: 'factorial(3)', sublabel: 'waiting for 3 * fact(2)', status: 'default' },
            { id: 'f2', label: 'factorial(2)', sublabel: '2 * 1 = returns 2', status: 'active' },
            { id: 'f1', label: 'factorial(1)', sublabel: 'Popped (returned 1)', status: 'eliminated' },
          ],
        },
      },
      {
        stepNumber: 3,
        label: 'Final Frame Resolves (3 * 2 = 6)',
        whatChanges:
          'factorial(2) returns 2 to factorial(3), which computes 3 * 2 = 6 and pops the final frame.',
        codeOrFormula: 'fact(3) computes 3 * 2 = 6 -> Stack Empty',
        visualState: {
          pointerLabel: 'Phase 3: Complete',
          metricLabel: 'Final Return Value: 6',
          items: [
            { id: 'f3', label: 'factorial(3)', sublabel: '3 * 2 = returns 6', status: 'found' },
            { id: 'f2', label: 'factorial(2)', sublabel: 'Popped (returned 2)', status: 'eliminated' },
            { id: 'f1', label: 'factorial(1)', sublabel: 'Popped (returned 1)', status: 'eliminated' },
          ],
        },
      },
    ],
    comprehensionQuestion: {
      question: 'What happens if a recursive function is missing its Base Case?',
      options: [
        'Stack frames keep pushing until RAM runs out (StackOverflow / RecursionError)',
        'The function automatically stops after 3 calls',
        'It converts itself into a SQL query',
      ],
      correctIndex: 0,
      explanation:
        'Without a base case to stop recursion, new stack frames allocate continuously until the call stack limit is exceeded.',
    },
  },
  {
    id: 'sql-joins',
    title: 'Database Joins: INNER JOIN vs LEFT JOIN',
    category: 'Databases & SQL',
    relatedTopicIds: ['swe-db-01', 'swe-api-01', 'ds-stats-01'],
    problemIntroduction:
      'Relational databases store Users in one table and Orders in another so data is never duplicated. How do we combine them in a single query?',
    conceptConnection:
      'A JOIN matches rows where the Foreign Key (orders.user_id) equals the Primary Key (users.id). INNER JOIN keeps only matching pairs; LEFT JOIN keeps all left rows even if they have zero orders.',
    practicalExample:
      'Generating an e-commerce customer dashboard showing every customer and their total orders (including new customers with 0 orders).',
    steps: [
      {
        stepNumber: 1,
        label: 'Two Normalized Tables (Users & Orders)',
        whatChanges:
          'Users has Alice (id=1) and Bob (id=2). Orders has Order #101 belonging to user_id=1 (Alice). Bob has no orders yet.',
        codeOrFormula: 'Users: [1: Alice, 2: Bob] | Orders: [#101 -> user_id: 1]',
        visualState: {
          pointerLabel: 'Normalized Tables',
          metricLabel: '2 Users · 1 Order',
          items: [
            { id: 'u1', label: 'User 1: Alice', sublabel: 'PK id = 1', status: 'active' },
            { id: 'u2', label: 'User 2: Bob', sublabel: 'PK id = 2 (no orders)', status: 'default' },
            { id: 'o1', label: 'Order #101 ($49)', sublabel: 'FK user_id = 1', status: 'active' },
          ],
        },
      },
      {
        stepNumber: 2,
        label: 'INNER JOIN (Strict Intersection)',
        whatChanges:
          'Matches users.id = orders.user_id. Only Alice has a match, so Bob is excluded from the result set.',
        codeOrFormula: 'SELECT name, total FROM users INNER JOIN orders ON users.id = orders.user_id',
        visualState: {
          pointerLabel: 'INNER JOIN Result: 1 Row',
          metricLabel: 'Unmatched rows dropped',
          items: [
            { id: 'r1', label: 'Alice ↔ Order #101 ($49)', sublabel: 'id=1 matches user_id=1', status: 'found' },
            { id: 'r2', label: 'Bob (Excluded)', sublabel: 'No matching order row', status: 'eliminated' },
          ],
        },
      },
      {
        stepNumber: 3,
        label: 'LEFT JOIN (Preserve All Left Rows)',
        whatChanges:
          'Keeps every row from the left table (Users) and fills missing right-side columns with NULL for Bob.',
        codeOrFormula: 'SELECT name, total FROM users LEFT JOIN orders ON users.id = orders.user_id',
        visualState: {
          pointerLabel: 'LEFT JOIN Result: 2 Rows',
          metricLabel: 'Bob preserved with NULL order',
          items: [
            { id: 'r1', label: 'Alice ↔ Order #101 ($49)', sublabel: 'Matched row', status: 'found' },
            {
              id: 'r2',
              label: 'Bob ↔ Order: NULL',
              sublabel: 'Left row kept, right is NULL',
              status: 'flowing',
            },
          ],
        },
      },
    ],
    comprehensionQuestion: {
      question:
        'Which JOIN should you use to list all registered users, including those who have never placed an order?',
      options: [
        'LEFT JOIN from users to orders',
        'INNER JOIN from users to orders',
        'DROP TABLE orders',
      ],
      correctIndex: 0,
      explanation:
        'LEFT JOIN preserves every row from the left table (users) and populates NULL for right-table columns when no match exists.',
    },
  },
  {
    id: 'rag-pipeline',
    title: 'RAG Pipeline & Embeddings: Grounding LLMs in Real Data',
    category: 'AI & LLM Engineering',
    relatedTopicIds: ['ai-llm-01', 'ai-rag-01', 'ai-agents-01', 'ml-math-01'],
    problemIntroduction:
      'An LLM does not know your private company docs or today’s facts out of the box, and retraining a model on every document edit is too slow and expensive.',
    conceptConnection:
      'Retrieval-Augmented Generation (RAG) converts documents into semantic vector embeddings, retrieves the top-K relevant chunks via cosine similarity, and injects them into the prompt so the LLM answers with grounded citations.',
    practicalExample:
      'LearnPath AI’s own Study Coach and enterprise documentation assistants use RAG to cite exact curriculum sections without hallucinating.',
    steps: [
      {
        stepNumber: 1,
        label: '1. Chunk & Embed Documents into Vectors',
        whatChanges:
          'Source docs are split into 400-token chunks and passed through an Embedding Model to create numerical vector coordinates.',
        codeOrFormula: 'embed("RAM is volatile memory") -> [0.82, -0.14, 0.55, ...]',
        visualState: {
          pointerLabel: 'Stage 1: Vector Indexing',
          metricLabel: 'Cosine Vector Space',
          items: [
            { id: 'doc', label: 'Curriculum Docs', sublabel: '27 structured topics', status: 'active' },
            { id: 'emb', label: 'Embedding Model', sublabel: 'Text -> 768-d Vector', status: 'flowing' },
            { id: 'vdb', label: 'Vector Index', sublabel: 'Stored with metadata', status: 'found' },
          ],
        },
      },
      {
        stepNumber: 2,
        label: '2. Semantic Retrieval (Top-K Cosine Match)',
        whatChanges:
          'The learner asks a question. We embed the question into the same vector space and fetch the closest matching chunks.',
        codeOrFormula: 'similarity(query_vec, chunk_vec) = 0.94 -> Top-3 chunks retrieved',
        visualState: {
          pointerLabel: 'Stage 2: Semantic Search',
          metricLabel: 'Top Match Similarity: 0.94',
          items: [
            { id: 'q', label: 'User Question', sublabel: '"Why is RAM faster?"', status: 'active' },
            { id: 'vdb', label: 'Vector Search', sublabel: 'Finds comp-101 chunk', status: 'flowing' },
            { id: 'ctx', label: 'Retrieved Context', sublabel: 'Verified lesson excerpt', status: 'found' },
          ],
        },
      },
      {
        stepNumber: 3,
        label: '3. Grounded Prompt + Cited Generation',
        whatChanges:
          'The retrieved chunks are prepended to the LLM system prompt with strict instructions to answer using only the verified facts.',
        codeOrFormula: 'Prompt = [System Rules] + [Retrieved Facts] + [User Query] -> Cited Answer',
        visualState: {
          pointerLabel: 'Stage 3: Grounded Synthesis',
          metricLabel: 'Hallucination Risk Minimized',
          items: [
            { id: 'ctx', label: 'Augmented Prompt', sublabel: 'Context + Query combined', status: 'active' },
            { id: 'llm', label: 'LLM Generator', sublabel: 'Synthesizes explanation', status: 'flowing' },
            { id: 'ans', label: 'Grounded Reply', sublabel: 'Includes source citation', status: 'found' },
          ],
        },
      },
    ],
    comprehensionQuestion: {
      question: 'Why does RAG use vector embeddings instead of only exact keyword matching?',
      options: [
        'Vector embeddings capture semantic meaning, so "short-term memory" matches "RAM" even when exact words differ',
        'Vector embeddings compress images into MP3 files',
        'Keywords are illegal in JSON requests',
      ],
      correctIndex: 0,
      explanation:
        'Embeddings map conceptually similar phrases close together in high-dimensional space, enabling meaning-based retrieval.',
    },
  },
];

export function getVisualizationForTopic(topicId: string): ConceptVisualizationSpec {
  const direct = CONCEPT_VISUALIZATIONS.find((v) => v.relatedTopicIds.includes(topicId));
  if (direct) return direct;
  if (topicId.startsWith('ai-') || topicId.startsWith('ml-')) {
    return CONCEPT_VISUALIZATIONS.find((v) => v.id === 'rag-pipeline')!;
  }
  if (topicId.includes('db') || topicId.includes('sql')) {
    return CONCEPT_VISUALIZATIONS.find((v) => v.id === 'sql-joins')!;
  }
  if (topicId.includes('dsa') || topicId.includes('control')) {
    return CONCEPT_VISUALIZATIONS.find((v) => v.id === 'binary-search')!;
  }
  return CONCEPT_VISUALIZATIONS[1]; // CPU/RAM cycle default
}
