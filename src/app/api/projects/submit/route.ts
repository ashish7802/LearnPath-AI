import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getProjects } from '@/lib/curriculum';
import { projectSubmitSchema } from '@/lib/validations';
import { evaluateProjectRubric } from '@/lib/gamification';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('lp_session')?.value;
    if (!token) return NextResponse.json({ error: 'Please sign in to submit a portfolio project.' }, { status: 401 });

    const session = await verifySessionToken(token);
    if (!session) return NextResponse.json({ error: 'Please sign in to submit a portfolio project.' }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

    const validation = projectSubmitSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { projectId, repoUrl, demoUrl, reflection, checkedRequirements } = validation.data;

    const projects = getProjects();
    const proj = projects.find((p) => p.id === projectId);
    if (!proj) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    const uniqueChecked = new Set(
      (checkedRequirements || []).filter((idx) => idx >= 0 && idx < proj.requirements.length)
    );

    const evaluation = evaluateProjectRubric({
      checkedRequirementsCount: uniqueChecked.size > 0 ? uniqueChecked.size : proj.requirements.length,
      totalRequirementsCount: proj.requirements.length,
      reflection,
      hasDemoUrl: Boolean(demoUrl && demoUrl.trim().length > 0),
    });

    const submission = await prisma.projectSubmission.create({
      data: {
        userId: session.id,
        projectId,
        repoUrl: repoUrl.trim(),
        demoUrl: demoUrl ? demoUrl.trim() : null,
        reflection: reflection.trim(),
        status: evaluation.status,
        score: evaluation.score,
        feedback: evaluation.feedback,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Project evaluated (${evaluation.score}/100) and saved to your portfolio.`,
      submission,
    });
  } catch (error) {
    console.error('Project submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
