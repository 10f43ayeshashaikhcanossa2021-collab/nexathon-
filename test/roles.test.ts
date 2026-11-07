import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server';

describe('Phase 2: RBAC Role Matrix Enforcement', () => {
  let adminToken: string;
  let creatorToken: string;
  let reviewerToken: string;
  let viewerToken: string;

  beforeAll(async () => {
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@lumora.test', password: 'Password123!' });
    adminToken = adminRes.body.token;

    const creatorRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'creator@lumora.test', password: 'Password123!' });
    creatorToken = creatorRes.body.token;

    const reviewerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'reviewer@lumora.test', password: 'Password123!' });
    reviewerToken = reviewerRes.body.token;

    const viewerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'viewer@lumora.test', password: 'Password123!' });
    viewerToken = viewerRes.body.token;
  });

  it('forbids Creator from updating brand profile (403)', async () => {
    const res = await request(app)
      .patch('/api/brand-profiles/bp-lumora-001')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({ voice_summary: 'Hacked voice summary' });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('forbidden');
  });

  it('forbids Reviewer from creating new users (403)', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${reviewerToken}`)
      .send({
        email: 'attacker@lumora.test',
        full_name: 'Attacker',
        role: 'admin',
        password: 'Password123!',
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('forbidden');
  });

  it('forbids Viewer from creating new content submissions (403)', async () => {
    const res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${viewerToken}`)
      .send({
        brand_profile_id: 'bp-lumora-001',
        title: 'Viewer unauthorized submission',
        channel: 'instagram',
        raw_text: 'Test draft text',
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('forbidden');
  });

  it('forbids Creator from approving any submissions (403)', async () => {
    const res = await request(app)
      .post('/api/versions/cv-001-v1/decision')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        decision: 'approved',
        comment: 'Creator trying to self-approve or approve others',
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('forbidden');
  });

  it('allows Admin to view audit logs and manage team users', async () => {
    const usersRes = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(usersRes.status).toBe(200);
    expect(Array.isArray(usersRes.body.data)).toBe(true);

    const auditRes = await request(app)
      .get('/api/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(auditRes.status).toBe(200);
    expect(Array.isArray(auditRes.body.data)).toBe(true);
  });
});
