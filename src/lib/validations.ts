import { z } from 'zod';

export const CAREER_IDS = [
  'software-engineer',
  'web-developer',
  'mobile-developer',
  'ml-engineer',
  'ai-engineer',
  'data-scientist',
  'cybersecurity-engineer',
  'cloud-devops-engineer',
] as const;

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email too long'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password too long'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const onboardingSchema = z.object({
  careerGoal: z.enum(CAREER_IDS),
  experienceLevel: z.string().default('absolute-zero'),
  preferredLanguage: z.enum(['english', 'hindi', 'hinglish']).default('english'),
  mathComfort: z.enum(['weak', 'basic', 'comfortable', 'strong']).default('basic'),
  dailyStudyMinutes: z.number().int().min(10).max(240).default(60),
  availableDays: z.union([z.string(), z.array(z.string())]).default('mon,tue,wed,thu,fri,sat,sun'),
  preferredMethod: z.string().default('practice-first'),
  deviceType: z.string().default('browser-only'),
  targetMilestone: z.string().default('job-ready'),
  diagnosticScore: z.number().int().min(0).max(100).optional().default(80),
});

export const studyProgressSchema = z.object({
  topicId: z.string().min(1, 'Topic ID is required'),
});

export const microLessonProgressSchema = z.object({
  topicId: z.string().min(1, 'Topic ID is required'),
  microLessonId: z.string().min(1, 'Micro-lesson ID is required'),
  completed: z.boolean().default(true),
});

export const assessmentSubmitSchema = z.object({
  topicId: z.string().min(1, 'Topic ID is required'),
  answers: z.array(
    z.object({
      order: z.number().int(),
      questionId: z.string().optional(),
      userAnswer: z.string().max(5000),
    })
  ),
});

export const codingExecuteSchema = z.object({
  topicId: z.string().min(1, 'Topic ID is required'),
  code: z.string().max(20000, 'Code submission exceeds 20,000 characters limit'),
});

export const practiceExecuteSchema = z.object({
  challengeId: z.string().min(1, 'Challenge ID is required'),
  code: z.string().max(20000, 'Code submission exceeds 20,000 characters limit'),
});

export const playgroundRunSchema = z.object({
  language: z.enum(['javascript', 'python']),
  code: z.string().min(1, 'Code cannot be empty').max(10000, 'Snippet too large'),
});

export const revisionCompleteSchema = z.object({
  topicId: z.string().min(1, 'Topic ID is required'),
  quality: z.number().int().min(0).max(5),
});

export const projectSubmitSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  repoUrl: z.string().trim().url('Must be a valid URL').refine(
    (url) => url.startsWith('https://github.com/'),
    'Repository must be a valid public GitHub URL (https://github.com/...)'
  ),
  demoUrl: z.string().trim().url('Must be a valid URL').optional().or(z.literal('')),
  reflection: z.string().trim().min(10, 'Reflection must be at least 10 characters').max(5000),
  checkedRequirements: z.array(z.number().int().min(0)).optional().default([]),
});

export const aiCoachSchema = z.object({
  topicId: z.string().optional(),
  userQuery: z.string().trim().min(1, 'Query cannot be empty').max(2000, 'Query exceeds 2,000 character limit'),
  language: z.enum(['english', 'hindi', 'hinglish']).optional().default('english'),
  hintLevel: z.number().int().min(1).max(3).optional(),
  userCodeAttempt: z.string().max(10000, 'Code snippet exceeds 10,000 character limit').optional(),
});
