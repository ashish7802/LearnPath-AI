import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, createSessionToken, getSessionCookieOptions } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`register_${ip}`, 5, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many registration attempts. Please retry in ${rateCheck.resetInSeconds} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      const errorMsg = validation.error.errors.map((e) => e.message).join(', ');
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email, password, name } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        profile: {
          create: {
            careerGoal: 'software-engineer',
            experienceLevel: 'absolute-zero',
            preferredLanguage: 'english',
            mathComfort: 'basic',
            dailyStudyMinutes: 60,
            availableDays: 'mon,tue,wed,thu,fri,sat,sun',
            onboardingCompleted: false
          }
        },
        enrollments: {
          create: {
            careerPathId: 'software-engineer',
            isActive: true
          }
        }
      },
      include: {
        profile: true
      }
    });

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profile: user.profile
      }
    });

    response.cookies.set('lp_session', token, getSessionCookieOptions());
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
