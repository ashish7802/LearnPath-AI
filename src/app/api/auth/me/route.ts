import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    if (!token) {
      return NextResponse.json({ user: null });
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        profile: true,
        enrollments: true,
        topicProgress: true,
        revisionItems: {
          include: { topic: true }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: user.profile,
        enrollments: user.enrollments,
        topicProgress: user.topicProgress,
        revisionItems: user.revisionItems
      }
    });
  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json({ user: null });
  }
}
