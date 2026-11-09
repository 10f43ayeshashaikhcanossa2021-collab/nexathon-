/**
 * INKLOOM AI - Server Authentication & Authorization Middleware
 * Enforces bcrypt password verification, HS256 JWT tokens, fresh DB user lookups,
 * and role-based access control.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { userRepo, auditRepo } from './db/repos';

export interface AuthContext {
  userId: string;
  orgId: string;
  role: 'admin' | 'creator' | 'reviewer' | 'viewer';
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

export const JWT_SECRET: string = process.env.JWT_SECRET || 'inkloom-ai-default-jwt-secret-key-32charsmin';
export const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '2h') as any;

export function signToken(user: { user_id: string; org_id: string; role: string }): string {
  return jwt.sign(
    {
      sub: user.user_id,
      org: user.org_id,
      role: user.role,
    },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: JWT_EXPIRES_IN }
  );
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Authentication Middleware:
 * Validates JWT, performs fresh DB user lookup, checks active status,
 * and attaches verified user/org context to request.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';

  if (!token) {
    return res.status(401).json({ error: 'unauthenticated', message: 'Missing Authorization header' });
  }

  try {
    const claims = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as any;
    const user = await userRepo.getById(claims.sub);

    if (!user || user.status === 'deactivated' || user.is_active === false || user.org_id !== claims.org) {
      return res.status(401).json({ error: 'invalid_session', message: 'User session is invalid or deactivated' });
    }

    req.auth = {
      userId: user.user_id,
      orgId: user.org_id,
      role: user.role as any,
    };
    next();
  } catch (err: any) {
    return res.status(401).json({ error: 'unauthenticated', message: 'Invalid or expired token' });
  }
}

/**
 * Role-Based Access Control Middleware:
 * Verifies that the authenticated user possesses an authorized role.
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'unauthenticated' });
    }
    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({
        error: 'forbidden',
        message: `Role '${req.auth.role}' is not authorized. Required: ${roles.join(', ')}`,
      });
    }
    next();
  };
};
