import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { onboardingSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const session = await verifySessionToken(token);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    const validation = onboardingSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

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
    } = validation.data;

    const availableDaysStr = Array.isArray(availableDays) ? availableDays.join(',') : availableDays;

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.id },
      update: {
        careerGoal,
        experienceLevel,
        preferredLanguage,
        mathComfort,
        dailyStudyMinutes,
        availableDays: availableDaysStr,
        preferredMethod,
        deviceType,
        targetMilestone,
        diagnosticScore,
        onboardingCompleted: true
      },
      create: {
        userId: session.id,
        careerGoal,
        experienceLevel,
        preferredLanguage,
        mathComfort,
        dailyStudyMinutes,
        availableDays: availableDaysStr,
        preferredMethod,
        deviceType,
        targetMilestone,
        diagnosticScore,
        onboardingCompleted: true
      }
    });

    // Update active career enrollment
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

    return NextResponse.json({ success: true, profile });
  } catch (error) {
    console.error('Onboarding API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
