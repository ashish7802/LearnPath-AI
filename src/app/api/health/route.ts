import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let latencyMs = 0;

  try {
    // Quick probe to check DB connectivity
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'healthy';
    latencyMs = Date.now() - startTime;
  } catch (err: any) {
    dbStatus = `unreachable (${err.message?.slice(0, 50) || 'connection error'})`;
    latencyMs = Date.now() - startTime;
  }

  return NextResponse.json({
    status: dbStatus === 'healthy' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    service: 'LearnPath AI Engine',
    version: '1.0.0',
    database: {
      status: dbStatus,
      latencyMs
    },
    environment: process.env.NODE_ENV || 'development'
  }, {
    status: dbStatus === 'healthy' ? 200 : 503
  });
}
