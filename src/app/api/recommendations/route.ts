import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTopicById } from '@/lib/curriculum';
import {
  buildExplainableRecommendations,
  parseNaturalLanguageGoal,
} from '@/lib/adaptive-engine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    let session = null;
    if (token) {
      session = await verifySessionToken(token);
    }

    const requestedCareer = req.nextUrl.searchParams.get('career') || 'software-engineer';

    if (!session) {
      const recommendations = buildExplainableRecommendations({
        careerGoal: requestedCareer,
        dailyStudyMinutes: 60,
        topicProgress: [],
        dueRevisions: [],
      });

      return NextResponse.json({
        success: true,
        authenticated: false,
        careerGoal: requestedCareer,
        dailyStudyMinutes: 60,
        recommendations,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        profile: true,
        topicProgress: true,
        revisionItems: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const careerGoal = req.nextUrl.searchParams.get('career') || user.profile?.careerGoal || 'software-engineer';
    const dailyStudyMinutes = user.profile?.dailyStudyMinutes || 60;
    const now = new Date();

    const dueRevisions = (user.revisionItems || [])
      .filter((r: any) => new Date(r.nextReviewDate) <= now)
      .map((r: any) => ({
        topicId: r.topicId,
        title: getTopicById(r.topicId)?.title || r.topicId,
        intervalDays: r.intervalDays,
      }));

    const recommendations = buildExplainableRecommendations({
      careerGoal,
      dailyStudyMinutes,
      topicProgress: user.topicProgress || [],
      dueRevisions,
    });

    return NextResponse.json({
      success: true,
      authenticated: true,
      careerGoal,
      dailyStudyMinutes,
      recommendations,
    });
  } catch (error) {
    console.error('Recommendations API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.goalText !== 'string') {
      return NextResponse.json({ error: 'Please provide a goalText string.' }, { status: 400 });
    }

    const parsedGoal = parseNaturalLanguageGoal(body.goalText);
    const recommendations = buildExplainableRecommendations({
      careerGoal: parsedGoal.careerGoal,
      dailyStudyMinutes: parsedGoal.dailyStudyMinutes,
      topicProgress: [],
      dueRevisions: [],
      userQuery: body.goalText,
    });

    return NextResponse.json({
      success: true,
      parsedGoal,
      recommendations,
    });
  } catch (error) {
    console.error('Goal parser API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
