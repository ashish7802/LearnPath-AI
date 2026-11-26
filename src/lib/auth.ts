import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import type { NextRequest } from 'next/server';

const isProduction = process.env.NODE_ENV === 'production';

// Ephemeral runtime fallback secret when JWT_SECRET is not configured in local development
const globalForAuth = globalThis as unknown as { __lpDevJwtSecret?: string };

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim().length > 0) {
    if (secret.length < 32 && isProduction) {
      throw new Error('FATAL: JWT_SECRET must be at least 32 characters long in production.');
    }
    return new TextEncoder().encode(secret);
  }
  if (!globalForAuth.__lpDevJwtSecret) {
    globalForAuth.__lpDevJwtSecret = crypto.randomBytes(32).toString('hex');
  }
  return new TextEncoder().encode(globalForAuth.__lpDevJwtSecret);
}

export interface AuthSessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: AuthSessionUser): Promise<string> {
  const key = getJwtSecret();
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifySessionToken(token: string): Promise<AuthSessionUser | null> {
  try {
    const key = getJwtSecret();
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] });
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

export function getSessionCookieOptions(req?: NextRequest) {
  const isHttps =
    req?.headers.get('x-forwarded-proto') === 'https' ||
    req?.nextUrl?.protocol === 'https:';

  if (isHttps) {
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      partitioned: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    };
  }

  return {
    httpOnly: true,
    secure: false,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  };
}
