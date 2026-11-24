import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';

const DB_PATH = path.join(process.cwd(), '.local-store.json');

export interface LocalDbData {
  users: any[];
  userProfiles: any[];
  userEnrollments: any[];
  userTopicProgress: any[];
  assessmentAttempts: any[];
  codeSubmissions: any[];
  projectSubmissions: any[];
  revisionItems: any[];
  aiCoachMessages: any[];
}

function getInitialData(): LocalDbData {
  const demoUserId = 'demo-learner-uuid-101';
  const passwordHash = bcrypt.hashSync('Password123!', 10);

  return {
    users: [
      {
        id: demoUserId,
        email: 'learner@learnpath.ai',
        passwordHash,
        name: 'Alex Rivera',
        role: 'learner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    userProfiles: [
      {
        id: 'prof-1',
        userId: demoUserId,
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
    ],
    userEnrollments: [
      {
        id: 'enr-1',
        userId: demoUserId,
        careerPathId: 'software-engineer',
        isActive: true
      }
    ],
    userTopicProgress: [
      {
        id: 'prog-1',
        userId: demoUserId,
        topicId: 'comp-101',
        status: 'MASTERED',
        bestScore: 100,
        attemptsCount: 1,
        masteredAt: new Date().toISOString()
      }
    ],
    assessmentAttempts: [],
    codeSubmissions: [],
    projectSubmissions: [],
    revisionItems: [
      {
        id: 'rev-1',
        userId: demoUserId,
        topicId: 'comp-101',
        nextReviewDate: new Date(Date.now() + 86400000).toISOString(),
        intervalDays: 1,
        repetitionCount: 1,
        easeFactor: 2.5
      }
    ],
    aiCoachMessages: []
  };
}

let memoryDb: LocalDbData | null = null;

export function getLocalDb(): LocalDbData {
  if (memoryDb) return memoryDb;
  if (fs.existsSync(DB_PATH)) {
    try {
      memoryDb = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      return memoryDb!;
    } catch {
      // Fallback
    }
  }
  memoryDb = getInitialData();
  saveLocalDb();
  return memoryDb!;
}

export function saveLocalDb() {
  if (!memoryDb) return;
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(memoryDb, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not write .local-store.json:', err);
  }
}

export const localStore = {
  user: {
    findUnique: async ({ where, include }: any) => {
      const db = getLocalDb();
      const user = db.users.find(u =>
        (where.email && u.email.toLowerCase() === where.email.toLowerCase()) ||
        (where.id && u.id === where.id)
      );
      if (!user) return null;
      const res = { ...user };
      if (include?.profile) {
        res.profile = db.userProfiles.find(p => p.userId === user.id) || null;
      }
      if (include?.enrollments) {
        res.enrollments = db.userEnrollments.filter(e => e.userId === user.id);
      }
      if (include?.topicProgress) {
        res.topicProgress = db.userTopicProgress.filter(p => p.userId === user.id);
      }
      if (include?.revisionItems) {
        res.revisionItems = db.revisionItems.filter(r => r.userId === user.id).map(r => ({
          ...r,
          topic: { title: r.topicId }
        }));
      }
      return res;
    },
    create: async ({ data, include }: any) => {
      const db = getLocalDb();
      const id = 'user_' + Math.random().toString(36).substring(2, 9);
      const newUser = {
        id,
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        role: data.role || 'learner',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.users.push(newUser);

      if (data.profile?.create) {
        const newProf = {
          id: 'prof_' + Math.random().toString(36).substring(2, 9),
          userId: id,
          ...data.profile.create
        };
        db.userProfiles.push(newProf);
      }
      if (data.enrollments?.create) {
        db.userEnrollments.push({
          id: 'enr_' + Math.random().toString(36).substring(2, 9),
          userId: id,
          ...data.enrollments.create
        });
      }
      saveLocalDb();

      return localStore.user.findUnique({ where: { id }, include });
    }
  },
  userProfile: {
    findUnique: async ({ where }: any) => {
      const db = getLocalDb();
      return db.userProfiles.find(p => p.userId === where.userId) || null;
    },
    upsert: async ({ where, update, create }: any) => {
      const db = getLocalDb();
      let prof = db.userProfiles.find(p => p.userId === where.userId);
      if (prof) {
        Object.assign(prof, update);
      } else {
        prof = { id: 'prof_' + Math.random().toString(36).substring(2, 9), ...create };
        db.userProfiles.push(prof);
      }
      saveLocalDb();
      return prof;
    }
  },
  userEnrollment: {
    upsert: async ({ where, update, create }: any) => {
      const db = getLocalDb();
      let enr = db.userEnrollments.find(e =>
        e.userId === where.userId_careerPathId?.userId &&
        e.careerPathId === where.userId_careerPathId?.careerPathId
      );
      if (enr) {
        Object.assign(enr, update);
      } else {
        enr = { id: 'enr_' + Math.random().toString(36).substring(2, 9), ...create };
        db.userEnrollments.push(enr);
      }
      saveLocalDb();
      return enr;
    }
  },
  userTopicProgress: {
    findMany: async ({ where }: any) => {
      const db = getLocalDb();
      return db.userTopicProgress.filter(p => {
        if (where?.userId && p.userId !== where.userId) return false;
        if (where?.status && p.status !== where.status) return false;
        return true;
      });
    },
    findUnique: async ({ where }: any) => {
      const db = getLocalDb();
      const { userId, topicId } = where.userId_topicId;
      return db.userTopicProgress.find(p => p.userId === userId && p.topicId === topicId) || null;
    },
    upsert: async ({ where, update, create }: any) => {
      const db = getLocalDb();
      const { userId, topicId } = where.userId_topicId;
      let prog = db.userTopicProgress.find(p => p.userId === userId && p.topicId === topicId);
      if (prog) {
        const attempts = (prog.attemptsCount || 0) + (update.attemptsCount?.increment || 0);
        Object.assign(prog, update, { attemptsCount: attempts });
      } else {
        prog = { id: 'prog_' + Math.random().toString(36).substring(2, 9), ...create };
        db.userTopicProgress.push(prog);
      }
      saveLocalDb();
      return prog;
    }
  },
  assessment: {
    findFirst: async ({ where }: any) => {
      return { id: 'asm_' + where.topicId, topicId: where.topicId, title: 'Assessment', passingScore: 80 };
    }
  },
  assessmentAttempt: {
    create: async ({ data }: any) => {
      const db = getLocalDb();
      const attempt = { id: 'att_' + Date.now(), ...data, createdAt: new Date().toISOString() };
      db.assessmentAttempts.push(attempt);
      saveLocalDb();
      return attempt;
    }
  },
  codingChallenge: {
    findFirst: async ({ where }: any) => {
      return { id: 'ch_' + where.topicId, topicId: where.topicId, title: 'Challenge' };
    }
  },
  codeSubmission: {
    create: async ({ data }: any) => {
      const db = getLocalDb();
      const sub = { id: 'csub_' + Date.now(), ...data, createdAt: new Date().toISOString() };
      db.codeSubmissions.push(sub);
      saveLocalDb();
      return sub;
    }
  },
  projectSubmission: {
    create: async ({ data }: any) => {
      const db = getLocalDb();
      const sub = { id: 'psub_' + Date.now(), ...data, createdAt: new Date().toISOString() };
      db.projectSubmissions.push(sub);
      saveLocalDb();
      return sub;
    }
  },
  revisionItem: {
    findUnique: async ({ where }: any) => {
      const db = getLocalDb();
      const { userId, topicId } = where.userId_topicId;
      return db.revisionItems.find(r => r.userId === userId && r.topicId === topicId) || null;
    },
    upsert: async ({ where, update, create }: any) => {
      const db = getLocalDb();
      const { userId, topicId } = where.userId_topicId;
      let rev = db.revisionItems.find(r => r.userId === userId && r.topicId === topicId);
      if (rev) {
        Object.assign(rev, update);
      } else {
        rev = { id: 'rev_' + Math.random().toString(36).substring(2, 9), ...create };
        db.revisionItems.push(rev);
      }
      saveLocalDb();
      return rev;
    }
  },
  aiCoachMessage: {
    create: async ({ data }: any) => {
      const db = getLocalDb();
      const msg = { id: 'msg_' + Date.now(), ...data, createdAt: new Date().toISOString() };
      db.aiCoachMessages.push(msg);
      saveLocalDb();
      return msg;
    },
    findMany: async ({ where, take }: any) => {
      const db = getLocalDb();
      let list = db.aiCoachMessages.filter(m => m.userId === where.userId);
      if (take) list = list.slice(-take);
      return list;
    }
  }
};
