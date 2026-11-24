import fs from 'node:fs';
import path from 'node:path';

export interface Resource {
  title: string;
  url: string;
  provider: string;
  resourceType: 'primary-free' | 'documentation' | 'video' | 'tutorial' | 'practice';
  language: string;
  isFree: boolean;
  verifiedAt: string;
}

export interface Question {
  id?: string;
  questionType: 'mcq' | 'multi_select' | 'code_output' | 'find_bug' | 'explain_rubric';
  prompt: string;
  codeSnippet?: string | null;
  options?: string[] | null;
  correctAnswer: string;
  explanation: string;
  rubricCriteria?: string | null;
  order: number;
}

export interface CodingTestCase {
  input: string;
  expected: string;
  description: string;
}

export interface CodingChallenge {
  title: string;
  instructions: string;
  starterCode: string;
  language: 'python' | 'javascript';
  visibleTests: CodingTestCase[];
  hiddenTests: CodingTestCase[];
  solutionHint: string;
  timeLimitMs?: number;
}

export interface Topic {
  id: string;
  track: 'foundation' | 'swe' | 'ml' | 'ai';
  moduleId: string;
  moduleTitle: string;
  title: string;
  slug: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  prerequisites: string[];
  plainExplanation: string;
  whyItMatters: string;
  learningObjectives: string[];
  estimatedLessonMins: number;
  estimatedPracticeMins: number;
  assessmentType: string;
  masteryThreshold: number;
  commonMistakes: string[];
  resources: Resource[];
  assessment: {
    title: string;
    passingScore: number;
    questions: Question[];
  };
  codingChallenge?: CodingChallenge;
}

export interface Project {
  id: string;
  careerPathId: string;
  phaseNumber: number;
  title: string;
  description: string;
  objectives: string[];
  requirements: string[];
  deliverables: string[];
  rubricJson: string;
}

// In-memory cache for loaded curriculum
let cachedCurriculum: Map<string, Topic> | null = null;
let cachedProjects: Project[] | null = null;

export function getAllTopics(): Topic[] {
  if (cachedCurriculum) {
    return Array.from(cachedCurriculum.values());
  }

  const curriculumDir = path.join(process.cwd(), 'curriculum');
  const files = ['foundations.json', 'software-engineering.json', 'machine-learning.json', 'ai-engineering.json'];
  const topicMap = new Map<string, Topic>();

  for (const file of files) {
    const fullPath = path.join(curriculumDir, file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const list: Topic[] = JSON.parse(content);
        for (const t of list) {
          topicMap.set(t.id, t);
        }
      } catch (e) {
        console.error(`Failed loading ${file}:`, e);
      }
    }
  }

  cachedCurriculum = topicMap;
  return Array.from(topicMap.values());
}

export function getTopicById(id: string): Topic | undefined {
  const all = getAllTopics();
  return all.find(t => t.id === id || t.slug === id);
}

export function getProjects(): Project[] {
  if (cachedProjects) return cachedProjects;
  const filePath = path.join(process.cwd(), 'curriculum', 'projects.json');
  if (fs.existsSync(filePath)) {
    try {
      cachedProjects = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return cachedProjects || [];
    } catch {
      return [];
    }
  }
  return [];
}

export function getCareerTopics(careerId: string): Topic[] {
  const all = getAllTopics();
  // Every career includes shared foundations
  const foundations = all.filter(t => t.track === 'foundation');

  let trackTopics: Topic[] = [];
  if (careerId === 'software-engineer') {
    trackTopics = all.filter(t => t.track === 'swe');
  } else if (careerId === 'ml-engineer') {
    trackTopics = all.filter(t => t.track === 'ml');
  } else if (careerId === 'ai-engineer') {
    trackTopics = all.filter(t => t.track === 'ai');
  } else {
    trackTopics = all.filter(t => t.track !== 'foundation');
  }

  return [...foundations, ...trackTopics];
}

export function computeTopicLockStatus(
  topic: Topic,
  masteredTopicIds: Set<string>
): { isLocked: boolean; missingPrereqs: string[] } {
  const missingPrereqs: string[] = [];
  for (const prereqId of topic.prerequisites) {
    if (!masteredTopicIds.has(prereqId)) {
      const prereqTopic = getTopicById(prereqId);
      missingPrereqs.push(prereqTopic ? prereqTopic.title : prereqId);
    }
  }
  return {
    isLocked: missingPrereqs.length > 0,
    missingPrereqs
  };
}
