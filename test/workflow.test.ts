import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../server';

describe('Phase 2: End-to-End Governance Workflow Lifecycle', () => {
  let creatorToken: string;
  let reviewerToken: string;

  beforeAll(async () => {
    const creatorRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'creator@lumora.test', password: 'Password123!' });
    creatorToken = creatorRes.body.token;

    const reviewerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'reviewer@lumora.test', password: 'Password123!' });
    reviewerToken = reviewerRes.body.token;
  });

  it('executes full 5-step governance lifecycle from draft to approved', async () => {
    // 1. Create draft submission
    const createRes = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        profile_id: 'bp-lumora-001',
        title: 'Spring Campaign Announcement',
        content_type: 'social_post',
        body_text: 'Lumora Pro gives all members 50 GB of workout-video storage and expert coaching.',
      });

    expect(createRes.status).toBe(201);
    const sub = createRes.body.data;
    expect(sub.status).toBe('draft');
    const submissionId = sub.submission_id;
    const v1Id = sub.versions[0].version_id;

    // 2. Trigger AI analysis on submission
    const analyseRes = await request(app)
      .post(`/api/submissions/${submissionId}/analyse`)
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({});

    expect(analyseRes.status).toBe(200);
    expect(analyseRes.body.status).toBe('analysed');
    expect(analyseRes.body.report).toBeDefined();

    // 3. Create version 2 with refined copy
    const v2Res = await request(app)
      .post(`/api/submissions/${submissionId}/versions`)
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({
        body_text: 'Lumora Pro gives all members 50 GB of workout-video storage with personalized routines.',
        change_summary: 'Refined wording to emphasize personalized routines',
      });

    expect(v2Res.status).toBe(201);
    expect(v2Res.body.version.version_no).toBe(2);
    const v2Id = v2Res.body.version.version_id;

    // 4. Send submission for review
    const sendRes = await request(app)
      .post(`/api/submissions/${submissionId}/send-for-review`)
      .set('Authorization', `Bearer ${creatorToken}`)
      .send({});

    expect(sendRes.status).toBe(200);
    expect(sendRes.body.data.status).toBe('in_review');

    // 5. Reviewer inspects Review Queue
    const queueRes = await request(app)
      .get('/api/review-queue')
      .set('Authorization', `Bearer ${reviewerToken}`);

    expect(queueRes.status).toBe(200);
    const foundInQueue = queueRes.body.data.some(
      (item: any) => item.submission_id === submissionId
    );
    expect(foundInQueue).toBe(true);

    // 6. Reviewer computes diff
    const diffRes = await request(app)
      .get(`/api/versions/${v2Id}/diff`)
      .set('Authorization', `Bearer ${reviewerToken}`);

    expect(diffRes.status).toBe(200);
    expect(diffRes.body.diff).toBeDefined();

    // 7. Reviewer approves submission
    const decisionRes = await request(app)
      .post(`/api/versions/${v2Id}/decision`)
      .set('Authorization', `Bearer ${reviewerToken}`)
      .send({
        decision: 'approved',
        comment: 'Verified copy complies with all brand guidelines and storage facts.',
      });

    expect(decisionRes.status).toBe(201);
    expect(decisionRes.body.status).toBe('approved');
    expect(decisionRes.body.approval.decision).toBe('approved');

    // 8. Verify final submission status is approved
    const finalSubRes = await request(app)
      .get(`/api/submissions/${submissionId}`)
      .set('Authorization', `Bearer ${creatorToken}`);

    expect(finalSubRes.status).toBe(200);
    expect(finalSubRes.body.data.status).toBe('approved');
  });
});
