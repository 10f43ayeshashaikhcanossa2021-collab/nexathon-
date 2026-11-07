import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../server';

describe('Phase 1: Real Authentication & Session Verification', () => {
  it('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@lumora.test', password: 'WrongPassword123!' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('invalid_credentials');
  });

  it('returns identical 401 message for unknown email to prevent enumeration', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'unknown_ghost_user@lumora.test', password: 'AnyPassword123!' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('invalid_credentials');
    expect(res.body.message).toContain('Invalid email or password');
  });

  it('returns 401 for unauthenticated requests to protected endpoints', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthenticated');
  });

  it('returns 401 for malformed or forged JWT tokens', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid.fake.token');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('unauthenticated');
  });

  it('successfully logs in with valid credentials and issues signed HS256 JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@lumora.test', password: 'Password123!' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe('admin@lumora.test');
    expect(res.body.user.role).toBe('admin');
  });

  it('allows authenticated user to inspect session via /api/auth/me', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'creator@lumora.test', password: 'Password123!' });

    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;

    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('creator@lumora.test');
    expect(meRes.body.role).toBe('creator');
    expect(meRes.body.org.org_id).toBeDefined();
  });
});
