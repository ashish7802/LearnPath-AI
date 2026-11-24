import { PrismaClient } from '@prisma/client';
import { localStore } from './local-store';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const rawPrisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = rawPrisma;

let isFallbackActive = false;

// Proxy handler to catch connection failures when remote PostgreSQL is unconfigured locally
function createResilientModelProxy(modelName: string) {
  const rawModel = (rawPrisma as any)[modelName];
  const fallbackModel = (localStore as any)[modelName];

  return new Proxy(rawModel || {}, {
    get(target, propKey, receiver) {
      const origMethod = target[propKey];
      const fallbackMethod = fallbackModel ? fallbackModel[propKey] : null;

      if (typeof origMethod !== 'function' && typeof fallbackMethod !== 'function') {
        return Reflect.get(target, propKey, receiver);
      }

      return async function (...args: any[]) {
        if (isFallbackActive && fallbackMethod) {
          return fallbackMethod(...args);
        }

        try {
          return await origMethod.apply(target, args);
        } catch (err: any) {
          // If database is unreachable (e.g. local dev without PostgreSQL instance), fallback cleanly
          if (
            err.message?.includes("Can't reach database server") ||
            err.message?.includes('database server is not running') ||
            err.name === 'PrismaClientInitializationError'
          ) {
            if (!isFallbackActive) {
              console.warn(
                `[LearnPath DB] PostgreSQL database unreachable. Activating resilient local fallback store for seamless offline/dev operation.`
              );
              isFallbackActive = true;
            }
            if (fallbackMethod) {
              return fallbackMethod(...args);
            }
          }
          throw err;
        }
      };
    },
  });
}

export const prisma = new Proxy(rawPrisma, {
  get(target, propKey, receiver) {
    if (typeof propKey === 'string' && propKey in localStore) {
      return createResilientModelProxy(propKey);
    }
    return Reflect.get(target, propKey, receiver);
  },
});

export default prisma;
