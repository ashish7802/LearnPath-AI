import fs from 'node:fs';
import path from 'node:path';
import {
  CAREERS,
  SUBJECTS,
  getCareerById,
  getSubtopicsForTopic,
  resolveTopicSubjectId,
  type CareerDefinition,
  type SubjectDefinition,
  type Subtopic,
} from './curriculum-layers';

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
  track: 'foundation' | 'swe' | 'ml' | 'ai' | 'web' | 'mobile' | 'data' | 'systems' | 'cybersecurity' | 'cloud' | 'languages';
  subjectId?: string;
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
  subtopics?: Subtopic[];
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

let cachedCurriculum: Map<string, Topic> | null = null;
let cachedProjects: Project[] | null = null;

const CURRICULUM_FILES = [
  'foundations.json',
  'software-engineering.json',
  'machine-learning.json',
  'ai-engineering.json',
  'web-and-mobile.json',
  'data-cyber-cloud.json',
  'languages-hub.json',
];

export function getAllTopics(): Topic[] {
  if (cachedCurriculum) {
    return Array.from(cachedCurriculum.values());
  }

  const curriculumDir = path.join(process.cwd(), 'curriculum');
  const topicMap = new Map<string, Topic>();

  for (const file of CURRICULUM_FILES) {
    const fullPath = path.join(curriculumDir, file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const list: Topic[] = JSON.parse(content);
        for (const rawTopic of list) {
          const subjectId = resolveTopicSubjectId(rawTopic);
          const subtopics = rawTopic.subtopics && rawTopic.subtopics.length > 0
            ? rawTopic.subtopics
            : getSubtopicsForTopic(rawTopic);
          topicMap.set(rawTopic.id, {
            ...rawTopic,
            subjectId,
            subtopics,
          });
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
  return all.find((t) => t.id === id || t.slug === id);
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

export function getAllCareers(): CareerDefinition[] {
  return CAREERS;
}

export function getAllSubjects(): SubjectDefinition[] {
  return SUBJECTS;
}

export function getCareerTopics(careerId: string): Topic[] {
  const all = getAllTopics();
  if (careerId === 'all') {
    return all;
  }

  const career = getCareerById(careerId);
  const allowedTracks = new Set(career.tracks);
  const allowedSubjects = new Set(career.subjectIds);

  // Preserve deterministic foundational-first order
  const matched = all.filter(
    (t) => allowedTracks.has(t.track) || (t.subjectId && allowedSubjects.has(t.subjectId))
  );

  // Deduplicate and ensure any prerequisites of included topics are also included
  const byId = new Map<string, Topic>();
  const addWithPrereqs = (topic: Topic) => {
    if (byId.has(topic.id)) return;
    for (const prereqId of topic.prerequisites) {
      const prereq = all.find((x) => x.id === prereqId);
      if (prereq) addWithPrereqs(prereq);
    }
    byId.set(topic.id, topic);
  };

  // Always start with foundations first
  for (const t of all.filter((x) => x.track === 'foundation')) {
    addWithPrereqs(t);
  }
  for (const t of matched) {
    addWithPrereqs(t);
  }

  return Array.from(byId.values());
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
    missingPrereqs,
  };
}
