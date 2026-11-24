import { PrismaClient } from '@prisma/client';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Careers
  const careers = [
    {
      id: 'software-engineer',
      slug: 'software-engineer',
      title: 'Software Engineer',
      description: 'Master computer science fundamentals, full-stack architectures, databases, APIs, testing, and modern developer workflows.',
      icon: 'Code2'
    },
    {
      id: 'ml-engineer',
      slug: 'ml-engineer',
      title: 'Machine Learning Engineer',
      description: 'From NumPy & data wrangling to supervised/unsupervised learning, model evaluation, PyTorch, and deep neural networks.',
      icon: 'BrainCircuit'
    },
    {
      id: 'ai-engineer',
      slug: 'ai-engineer',
      title: 'AI Engineer',
      description: 'Build modern AI applications: Token economics, Vector Databases, Grounded RAG, Autonomous Tool Calling Agents, and Guardrails.',
      icon: 'Sparkles'
    }
  ];

  for (const c of careers) {
    await prisma.careerPath.upsert({
      where: { id: c.id },
      update: c,
      create: c
    });
  }
  console.log('  ✅ Careers seeded.');

  // 2. Tracks & Modules
  const tracks = [
    { id: 'track-foundation', careerPathId: 'software-engineer', title: 'Phase 0: Absolute Beginner Foundations', order: 0 },
    { id: 'track-swe', careerPathId: 'software-engineer', title: 'Phase 1: Systems, Databases & Backend', order: 1 },
    { id: 'track-ml', careerPathId: 'ml-engineer', title: 'Phase 1: Tabular ML, Data Wrangling & PyTorch', order: 1 },
    { id: 'track-ai', careerPathId: 'ai-engineer', title: 'Phase 1: LLM Architectures, RAG & Agents', order: 1 }
  ];

  for (const t of tracks) {
    await prisma.learningTrack.upsert({
      where: { id: t.id },
      update: t,
      create: t
    });
  }

  const modules = [
    { id: 'mod-foundations-01', trackId: 'track-foundation', title: 'Digital Foundations & The Machine', description: 'Hardware, operating systems, memory and command line.', order: 1 },
    { id: 'mod-foundations-02', trackId: 'track-foundation', title: 'Python Core & Algorithmic Logic', description: 'Variables, loops, functions, and problem solving.', order: 2 },
    { id: 'mod-swe-workflow', trackId: 'track-swe', title: 'Developer Workflow & Version Control', description: 'Git, GitHub, branches, and code collaboration.', order: 1 },
    { id: 'mod-swe-cs', trackId: 'track-swe', title: 'Computer Science & Data Structures', description: 'Arrays, Hash Maps, Big-O complexity.', order: 2 },
    { id: 'mod-swe-db', trackId: 'track-swe', title: 'Databases & Systems Architecture', description: 'Relational data modeling, SQL queries and ACID principles.', order: 3 },
    { id: 'mod-swe-backend', trackId: 'track-swe', title: 'Web Architecture & APIs', description: 'HTTP, REST, JSON payloads, and authentication.', order: 4 },
    { id: 'mod-ml-data', trackId: 'track-ml', title: 'Data Foundations for Machine Learning', description: 'NumPy vectorized math, Pandas DataFrames and cleaning.', order: 1 },
    { id: 'mod-ml-core', trackId: 'track-ml', title: 'Supervised Learning & Model Evaluation', description: 'Regression, classification, metrics, and data leakage prevention.', order: 2 },
    { id: 'mod-ml-deep', trackId: 'track-ml', title: 'Neural Networks & Deep Learning', description: 'PyTorch autograd, forward pass, backpropagation.', order: 3 },
    { id: 'mod-ai-llm', trackId: 'track-ai', title: 'Large Language Models & Prompt Engineering', description: 'Tokens, embeddings, context windows and structured outputs.', order: 1 },
    { id: 'mod-ai-rag', trackId: 'track-ai', title: 'Retrieval-Augmented Generation (RAG) & Vector DBs', description: 'Chunking, semantic search, vector stores and citations.', order: 2 },
    { id: 'mod-ai-agents', trackId: 'track-ai', title: 'Autonomous Agents & Tool Calling', description: 'ReAct loops, function calling schemas and safety guardrails.', order: 3 }
  ];

  for (const m of modules) {
    await prisma.module.upsert({
      where: { id: m.id },
      update: m,
      create: m
    });
  }
  console.log('  ✅ Modules seeded.');

  // 3. Load all curriculum topics
  const curriculumDir = path.join(__dirname, '../curriculum');
  const files = ['foundations.json', 'software-engineering.json', 'machine-learning.json', 'ai-engineering.json'];

  const allTopics = [];
  for (const file of files) {
    const list = JSON.parse(fs.readFileSync(path.join(curriculumDir, file), 'utf8'));
    allTopics.push(...list);
  }

  // Create Topics first
  for (const t of allTopics) {
    await prisma.topic.upsert({
      where: { id: t.id },
      update: {
        moduleId: t.moduleId,
        title: t.title,
        slug: t.slug,
        difficulty: t.difficulty,
        order: t.order,
        plainExplanation: t.plainExplanation,
        whyItMatters: t.whyItMatters,
        learningObjectives: JSON.stringify(t.learningObjectives),
        estimatedLessonMins: t.estimatedLessonMins,
        estimatedPracticeMins: t.estimatedPracticeMins,
        assessmentType: t.assessmentType,
        masteryThreshold: t.masteryThreshold,
        commonMistakes: JSON.stringify(t.commonMistakes),
      },
      create: {
        id: t.id,
        moduleId: t.moduleId,
        title: t.title,
        slug: t.slug,
        difficulty: t.difficulty,
        order: t.order,
        plainExplanation: t.plainExplanation,
        whyItMatters: t.whyItMatters,
        learningObjectives: JSON.stringify(t.learningObjectives),
        estimatedLessonMins: t.estimatedLessonMins,
        estimatedPracticeMins: t.estimatedPracticeMins,
        assessmentType: t.assessmentType,
        masteryThreshold: t.masteryThreshold,
        commonMistakes: JSON.stringify(t.commonMistakes),
      }
    });

    // Resources
    for (const res of t.resources) {
      await prisma.topicResource.create({
        data: {
          topicId: t.id,
          title: res.title,
          url: res.url,
          provider: res.provider,
          resourceType: res.resourceType,
          language: res.language || 'en',
          isFree: res.isFree ?? true,
          verifiedAt: res.verifiedAt || '2026-03'
        }
      });
    }

    // Assessment & Questions
    if (t.assessment) {
      const assessment = await prisma.assessment.create({
        data: {
          topicId: t.id,
          title: t.assessment.title,
          passingScore: t.assessment.passingScore || 80
        }
      });

      for (const q of t.assessment.questions) {
        await prisma.question.create({
          data: {
            assessmentId: assessment.id,
            questionType: q.questionType,
            prompt: q.prompt,
            codeSnippet: q.codeSnippet || null,
            optionsJson: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            rubricCriteria: q.rubricCriteria || null,
            order: q.order
          }
        });
      }
    }

    // Coding Challenge
    if (t.codingChallenge) {
      await prisma.codingChallenge.create({
        data: {
          topicId: t.id,
          title: t.codingChallenge.title,
          instructions: t.codingChallenge.instructions,
          starterCode: t.codingChallenge.starterCode,
          language: t.codingChallenge.language || 'python',
          visibleTests: JSON.stringify(t.codingChallenge.visibleTests),
          hiddenTests: JSON.stringify(t.codingChallenge.hiddenTests),
          solutionHint: t.codingChallenge.solutionHint,
          timeLimitMs: 5000
        }
      });
    }
  }

  // Create Prerequisites
  for (const t of allTopics) {
    if (t.prerequisites && t.prerequisites.length > 0) {
      for (const prereqId of t.prerequisites) {
        await prisma.topicPrerequisite.upsert({
          where: {
            topicId_prerequisiteId: {
              topicId: t.id,
              prerequisiteId: prereqId
            }
          },
          update: {},
          create: {
            topicId: t.id,
            prerequisiteId: prereqId
          }
        });
      }
    }
  }
  console.log(`  ✅ ${allTopics.length} Topics, Resources, and Prerequisites seeded.`);

  // 4. Projects
  const projects = JSON.parse(fs.readFileSync(path.join(curriculumDir, 'projects.json'), 'utf8'));
  for (const p of projects) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: {
        careerPathId: p.careerPathId,
        phaseNumber: p.phaseNumber,
        title: p.title,
        description: p.description,
        objectives: JSON.stringify(p.objectives),
        requirements: JSON.stringify(p.requirements),
        deliverables: JSON.stringify(p.deliverables),
        rubricJson: p.rubricJson
      },
      create: {
        id: p.id,
        careerPathId: p.careerPathId,
        phaseNumber: p.phaseNumber,
        title: p.title,
        description: p.description,
        objectives: JSON.stringify(p.objectives),
        requirements: JSON.stringify(p.requirements),
        deliverables: JSON.stringify(p.deliverables),
        rubricJson: p.rubricJson
      }
    });
  }
  console.log('  ✅ Projects seeded.');

  // 5. Demo / Beginner User
  const demoPasswordHash = await bcrypt.hash('Password123!', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'learner@learnpath.ai' },
    update: {},
    create: {
      email: 'learner@learnpath.ai',
      passwordHash: demoPasswordHash,
      name: 'Alex Rivera',
      role: 'learner',
      profile: {
        create: {
          careerGoal: 'software-engineer',
          experienceLevel: 'absolute-zero',
          preferredLanguage: 'english',
          mathComfort: 'basic',
          dailyStudyMinutes: 60,
          availableDays: 'mon,tue,wed,thu,fri,sat,sun',
          preferredMethod: 'practice-first',
          deviceType: 'browser-only',
          targetMilestone: 'job-ready',
          onboardingCompleted: true,
          diagnosticScore: 85
        }
      },
      enrollments: {
        create: {
          careerPathId: 'software-engineer',
          isActive: true
        }
      }
    }
  });

  // Seed demo topic progress:
  // comp-101 is MASTERED
  await prisma.userTopicProgress.upsert({
    where: {
      userId_topicId: {
        userId: demoUser.id,
        topicId: 'comp-101'
      }
    },
    update: {},
    create: {
      userId: demoUser.id,
      topicId: 'comp-101',
      status: 'MASTERED',
      bestScore: 100,
      attemptsCount: 1,
      firstStudiedAt: new Date(),
      masteredAt: new Date()
    }
  });

  // Seed spaced revision item for comp-101
  await prisma.revisionItem.upsert({
    where: {
      userId_topicId: {
        userId: demoUser.id,
        topicId: 'comp-101'
      }
    },
    update: {},
    create: {
      userId: demoUser.id,
      topicId: 'comp-101',
      nextReviewDate: new Date(Date.now() + 86400000), // Tomorrow
      intervalDays: 1,
      repetitionCount: 1,
      easeFactor: 2.5
    }
  });

  console.log('  ✅ Demo user seeded: learner@learnpath.ai / Password123!');
  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
