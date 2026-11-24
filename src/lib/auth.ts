import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const isProduction = process.env.NODE_ENV === 'production';

// Strict secret verification: in production, fail immediately if JWT_SECRET is unset
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (isProduction) {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production.');
    }
    console.warn('⚠️ WARNING: Using fallback JWT secret for development only. Set JWT_SECRET in production.');
    return new TextEncoder().encode('learnpath-ai-dev-insecure-secret-key-32-chars-min');
  }
  if (secret.length < 32 && isProduction) {
    throw new Error('FATAL: JWT_SECRET must be at least 32 characters long in production.');
  }
  return new TextEncoder().encode(secret);
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

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
  };
}
