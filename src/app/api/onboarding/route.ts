import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifySessionToken(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      careerGoal,
      experienceLevel,
      preferredLanguage,
      mathComfort,
      dailyStudyMinutes,
      availableDays,
      preferredMethod,
      deviceType,
      targetMilestone,
      diagnosticScore
    } = body;

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.id },
      update: {
        careerGoal: careerGoal || 'software-engineer',
        experienceLevel: experienceLevel || 'absolute-zero',
        preferredLanguage: preferredLanguage || 'english',
        mathComfort: mathComfort || 'basic',
        dailyStudyMinutes: Number(dailyStudyMinutes) || 60,
        availableDays: Array.isArray(availableDays) ? availableDays.join(',') : (availableDays || 'mon,tue,wed,thu,fri,sat,sun'),
        preferredMethod: preferredMethod || 'practice-first',
        deviceType: deviceType || 'browser-only',
        targetMilestone: targetMilestone || 'job-ready',
        diagnosticScore: Number(diagnosticScore) || 80,
        onboardingCompleted: true
      },
      create: {
        userId: session.id,
        careerGoal: careerGoal || 'software-engineer',
        experienceLevel: experienceLevel || 'absolute-zero',
        preferredLanguage: preferredLanguage || 'english',
        mathComfort: mathComfort || 'basic',
        dailyStudyMinutes: Number(dailyStudyMinutes) || 60,
        availableDays: Array.isArray(availableDays) ? availableDays.join(',') : (availableDays || 'mon,tue,wed,thu,fri,sat,sun'),
        preferredMethod: preferredMethod || 'practice-first',
        deviceType: deviceType || 'browser-only',
        targetMilestone: targetMilestone || 'job-ready',
        diagnosticScore: Number(diagnosticScore) || 80,
        onboardingCompleted: true
      }
    });

    // Update active career enrollment
    if (careerGoal) {
      await prisma.userEnrollment.upsert({
        where: {
          userId_careerPathId: {
            userId: session.id,
            careerPathId: careerGoal
          }
        },
        update: { isActive: true },
        create: {
          userId: session.id,
          careerPathId: careerGoal,
          isActive: true
        }
      });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Onboarding API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
