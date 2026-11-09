/**
 * INKLOOM AI - Backend Role-Based Access Control (RBAC Matrix) (Phase 6)
 * Strict permission evaluation for Admin, Reviewer (Compliance Officer),
 * Content Creator, and Viewer roles.
 */

import { Request, Response, NextFunction } from 'express';

export type UserRole = 'admin' | 'reviewer' | 'creator' | 'viewer';

export type Permission =
  | 'submissions:create'
  | 'submissions:read'
  | 'submissions:edit'
  | 'submissions:delete'
  | 'submissions:submit_for_review'
  | 'submissions:approve'
  | 'submissions:reject'
  | 'submissions:publish'
  | 'guidelines:read'
  | 'guidelines:manage'
  | 'facts:read'
  | 'facts:manage'
  | 'terms:read'
  | 'terms:manage'
  | 'users:read'
  | 'users:manage'
  | 'org:read'
  | 'org:manage'
  | 'audit:read'
  | 'reports:run';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'submissions:create',
    'submissions:read',
    'submissions:edit',
    'submissions:delete',
    'submissions:submit_for_review',
    'submissions:approve',
    'submissions:reject',
    'submissions:publish',
    'guidelines:read',
    'guidelines:manage',
    'facts:read',
    'facts:manage',
    'terms:read',
    'terms:manage',
    'users:read',
    'users:manage',
    'org:read',
    'org:manage',
    'audit:read',
    'reports:run',
  ],
  reviewer: [
    'submissions:read',
    'submissions:edit',
    'submissions:submit_for_review',
    'submissions:approve',
    'submissions:reject',
    'guidelines:read',
    'guidelines:manage',
    'facts:read',
    'facts:manage',
    'terms:read',
    'terms:manage',
    'users:read',
    'org:read',
    'audit:read',
    'reports:run',
  ],
  creator: [
    'submissions:read',
    'submissions:create',
    'submissions:edit',
    'submissions:submit_for_review',
    'guidelines:read',
    'facts:read',
    'terms:read',
    'org:read',
    'reports:run',
  ],
  viewer: [
    'submissions:read',
    'guidelines:read',
    'facts:read',
    'terms:read',
    'org:read',
    'reports:run',
  ],
};

export function hasPermission(role: string, permission: Permission): boolean {
  const allowed = ROLE_PERMISSIONS[role as UserRole];
  if (!allowed) return false;
  return allowed.includes(permission);
}

export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'unauthorized', message: 'Authentication required' });
    }

    if (!hasPermission(user.role, permission)) {
      return res.status(403).json({
        error: 'forbidden',
        message: `Insufficient permissions: '${user.role}' lacks '${permission}'.`,
      });
    }

    next();
  };
}
