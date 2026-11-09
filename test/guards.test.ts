import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server';

describe('Phase 2 & 4: Server-Side Governance Guards', () => {
  let adminToken: string;
  let creatorToken: string;
  let reviewerToken: string;

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
  });

  it('blocks self-approval with 403 when creator/author attempts to approve their submission', async () => {
    // Creator creates a submission
    const createRes = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        profile_id: 'prof-lumora-fit',
        title: 'Self-approval test draft',
        content_type: 'social_post',
        body_text: 'Lumora Fitness is the best gym ever.',
      });

    expect(createRes.status).toBe(201);
    const subId = createRes.body.submission.submission_id;
    const versionId = createRes.body.version.version_id;

    // Creator attempts to approve it
    const approveRes = await request(app)
      .post(`/api/versions/${versionId}/decision`)
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        decision: 'approved',
        comment: 'I approve my own work completely!',
      });

    // Creator role is blocked by requireRole('reviewer', 'admin') with 403
    expect(approveRes.status).toBe(403);
  });

  it('blocks Admin from approving an authored submission (anti-self-approval rule, 403)', async () => {
    // Admin creates an authored submission
    const createRes = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        profile_id: 'prof-lumora-fit',
        title: 'Admin authored announcement',
        content_type: 'blog',
        body_text: 'Exciting news from Lumora management.',
      });

    expect(createRes.status).toBe(201);
    const versionId = createRes.body.version.version_id;

    // Admin attempts to self-approve the submission they created
    const approveRes = await request(app)
      .post(`/api/versions/${versionId}/decision`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        decision: 'approved',
        comment: 'Looks great to me, approving myself.',
      });

    expect(approveRes.status).toBe(403);
    expect(approveRes.body.error).toBe('self_approval_forbidden');
    expect(approveRes.body.message).toContain('forbidden from approving their own');
  });

  it('enforces decision comment length requirements (400 if comment too short)', async () => {
    // Creator creates a submission
    const createRes = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        profile_id: 'prof-lumora-fit',
        title: 'Comment length test',
        content_type: 'social_post',
        body_text: 'Clean post for comment check.',
      });

    expect(createRes.status).toBe(201);
    const versionId = createRes.body.version.version_id;

    // Reviewer tries to approve with less than 5 characters
    const shortApproveRes = await request(app)
      .post(`/api/versions/${versionId}/decision`)
      .set('Authorization', `Bearer ${reviewerToken}`)
      .send({
        decision: 'approved',
        comment: 'ok',
      });

    expect(shortApproveRes.status).toBe(400);
    expect(shortApproveRes.body.error).toBe('comment_too_short');

    // Reviewer tries to request changes with less than 10 characters
    const shortRejectRes = await request(app)
      .post(`/api/versions/${versionId}/decision`)
      .set('Authorization', `Bearer ${reviewerToken}`)
      .send({
        decision: 'changes_requested',
        comment: 'Fix this',
      });

    expect(shortRejectRes.status).toBe(400);
    expect(shortRejectRes.body.error).toBe('comment_too_short');
  });

  it('protects last active admin from deactivation (409)', async () => {
    const res = await request(app)
      .patch('/api/users/u-maya-admin')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'deactivated',
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('last_admin_protection');
  });

  it('rejects unsupported file formats like PDF with 415 and honest message', async () => {
    const res = await request(app)
      .post('/api/submissions/extract-text')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        filename: 'report.pdf',
        base64Content: Buffer.from('%PDF-1.4 test dummy').toString('base64'),
      });

    expect(res.status).toBe(415);
    expect(res.body.error).toBe('unsupported_file_type');
    expect(res.body.message).toContain('PDF extraction is a planned enhancement');
  });
});
