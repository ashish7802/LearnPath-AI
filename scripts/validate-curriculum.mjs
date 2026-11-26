import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const curriculumDir = path.resolve(__dirname, '../curriculum');

console.log('🔍 [Curriculum Validation] Starting comprehensive curriculum verification...');

const files = [
  'foundations.json',
  'software-engineering.json',
  'machine-learning.json',
  'ai-engineering.json',
  'web-and-mobile.json',
  'data-cyber-cloud.json',
  'languages-hub.json',
];

const allTopics = new Map();
const prerequisiteGraph = new Map();
let totalErrors = 0;

function reportError(msg) {
  console.error(`❌ ERROR: ${msg}`);
  totalErrors++;
}

// 1. Read and parse files
for (const file of files) {
  const filePath = path.join(curriculumDir, file);
  if (!fs.existsSync(filePath)) {
    reportError(`File missing: ${file}`);
    continue;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const topics = JSON.parse(content);
    if (!Array.isArray(topics)) {
      reportError(`${file} does not contain a JSON array.`);
      continue;
    }

    console.log(`  📄 Loaded ${file}: ${topics.length} topics`);
    for (const topic of topics) {
      if (allTopics.has(topic.id)) {
        reportError(`Duplicate topic ID detected: "${topic.id}" in ${file}`);
      }
      allTopics.set(topic.id, { ...topic, sourceFile: file });
      prerequisiteGraph.set(topic.id, topic.prerequisites || []);
    }
  } catch (err) {
    reportError(`Failed parsing ${file}: ${err.message}`);
  }
}

console.log(`\n📊 Total Unique Topics Registered: ${allTopics.size}`);

// 2. Validate Topic Fields & Educational Completeness
for (const [id, topic] of allTopics.entries()) {
  if (!topic.title || topic.title.trim() === '') {
    reportError(`Topic [${id}] has missing or blank title.`);
  }
  if (!topic.plainExplanation || topic.plainExplanation.length < 20) {
    reportError(`Topic [${id}] lacks an adequate beginner-friendly plainExplanation.`);
  }
  if (!topic.whyItMatters || topic.whyItMatters.length < 15) {
    reportError(`Topic [${id}] lacks a 'whyItMatters' motivation statement.`);
  }
  if (!Array.isArray(topic.learningObjectives) || topic.learningObjectives.length === 0) {
    reportError(`Topic [${id}] must define at least one explicit learning objective.`);
  }
  if (!Array.isArray(topic.resources) || topic.resources.length === 0) {
    reportError(`Topic [${id}] must provide at least one verified learning resource.`);
  } else {
    for (const res of topic.resources) {
      if (!res.url || !res.url.startsWith('http')) {
        reportError(`Topic [${id}] resource "${res.title}" has invalid URL: ${res.url}`);
      }
      if (!res.provider) {
        reportError(`Topic [${id}] resource "${res.title}" missing provider name.`);
      }
    }
  }

  // Check assessment completeness
  if (!topic.assessment || !Array.isArray(topic.assessment.questions) || topic.assessment.questions.length === 0) {
    reportError(`Topic [${id}] missing required assessment or questions.`);
  } else {
    for (const q of topic.assessment.questions) {
      if (!q.prompt) reportError(`Topic [${id}] assessment has question with empty prompt.`);
      if (!q.correctAnswer && !q.rubricCriteria) {
        reportError(`Topic [${id}] question "${q.prompt.slice(0, 30)}..." missing correctAnswer or rubric.`);
      }
    }
  }
}

// 3. Verify Prerequisite Integrity (No phantom IDs)
console.log('\n🔗 Verifying Prerequisite References...');
for (const [topicId, prereqs] of prerequisiteGraph.entries()) {
  for (const prereqId of prereqs) {
    if (!allTopics.has(prereqId)) {
      reportError(`Topic [${topicId}] references nonexistent prerequisite ID: "${prereqId}"`);
    }
  }
}

// 4. Cycle Detection (DFS)
console.log('🔄 Checking for Circular Dependencies...');
const visited = new Set();
const recursionStack = new Set();

function hasCycle(node, pathStack = []) {
  visited.add(node);
  recursionStack.add(node);
  pathStack.push(node);

  const neighbors = prerequisiteGraph.get(node) || [];
  for (const neighbor of neighbors) {
    if (!visited.has(neighbor)) {
      if (hasCycle(neighbor, [...pathStack])) return true;
    } else if (recursionStack.has(neighbor)) {
      reportError(`Circular dependency detected: ${pathStack.join(' -> ')} -> ${neighbor}`);
      return true;
    }
  }

  recursionStack.delete(node);
  return false;
}

for (const topicId of prerequisiteGraph.keys()) {
  if (!visited.has(topicId)) {
    hasCycle(topicId);
  }
}

// 5. Check Projects
const projectsPath = path.join(curriculumDir, 'projects.json');
if (fs.existsSync(projectsPath)) {
  const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
  console.log(`\n🚀 Loaded ${projects.length} Milestone Projects`);
  for (const p of projects) {
    if (!p.id || !p.title || !p.requirements || !p.rubricJson) {
      reportError(`Project [${p.id || 'unknown'}] is missing required fields.`);
    }
  }
}

console.log('\n=======================================');
if (totalErrors > 0) {
  console.error(`❌ Curriculum validation FAILED with ${totalErrors} errors.`);
  process.exit(1);
} else {
  console.log(`✅ Curriculum validation PASSED! All topics, dependencies, and rubrics are sound.`);
  process.exit(0);
}
