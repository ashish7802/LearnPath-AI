import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getProjects } from '@/lib/curriculum';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const projects = getProjects();
    const token = req.cookies.get('lp_session')?.value;
    let submissions: any[] = [];
    let authenticated = false;

    if (token) {
      const session = await verifySessionToken(token);
      if (session) {
        authenticated = true;
        submissions = await prisma.projectSubmission.findMany({
          where: { userId: session.id },
        });
      }
    }

    return NextResponse.json({
      authenticated,
      projects,
      submissions,
    });
  } catch (error) {
    console.error('Projects GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
