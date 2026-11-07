import { describe, it, expect } from 'vitest';
import { runDeterministicChecks } from '../src/services/aiPipeline';
import type { BrandProfile, BrandGuideline, ApprovedFact, TerminologyItem } from '../src/types';

describe('Phase 4: Domain Independence Verification (Northwind Bank)', () => {
  const northwindProfile: BrandProfile = {
    profile_id: 'bp-northwind-001',
    org_id: 'org-northwind-001',
    brand_name: 'Northwind Bank',
    voice_summary: 'Prudent, transparent, trustworthy financial institution.',
    prohibited_claims: ['guaranteed 10% return', 'zero risk investment'],
    colors: ['#0A2540', '#635BFF', '#00D4B2'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const northwindGuidelines: BrandGuideline[] = [
    {
      guideline_id: 'g-nb-01',
      profile_id: 'bp-northwind-001',
      code: 'NB-01',
      title: 'Investment Risk Transparency',
      category: 'compliance',
      severity: 'high',
      rule_text: 'Never claim guaranteed return or zero-risk investments without clear regulatory disclaimers.',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      guideline_id: 'g-nb-02',
      profile_id: 'bp-northwind-001',
      code: 'NB-02',
      title: 'Professional Voice and Tone',
      category: 'tone_voice',
      severity: 'low',
      rule_text: 'Avoid informal repeated exclamation marks or hyperbolic hype language.',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  const northwindFacts: ApprovedFact[] = [
    {
      fact_id: 'f-nb-01',
      profile_id: 'bp-northwind-001',
      code: 'NF-01',
      subject: 'Premier Checking Yield',
      statement: 'Northwind Premier Checking provides an annual percentage yield of 1.25% APY.',
      category: 'pricing',
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      fact_id: 'f-nb-02',
      profile_id: 'bp-northwind-001',
      code: 'NF-02',
      subject: 'Deposit Insurance',
      statement: 'FDIC insurance protects deposits up to $250,000 per depositor, per insured bank.',
      category: 'claims',
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];

  const northwindTerms: TerminologyItem[] = [
    {
      term_id: 't-nb-01',
      profile_id: 'bp-northwind-001',
      code: 'NT-01',
      preferred_term: 'account holders',
      avoid_terms: ['users', 'customers'],
      case_sensitive: false,
      notes: 'Refer to our banking clients as account holders.',
      created_at: new Date().toISOString(),
    },
  ];

  it('correctly evaluates financial copy using dynamic rules without any fitness hardcoding', () => {
    const bankingDraft =
      'Northwind Premier Checking offers all customers guaranteed return and premium advisory services!!!';

    const { issues } = runDeterministicChecks(
      bankingDraft,
      'web_copy',
      northwindProfile,
      northwindGuidelines,
      northwindFacts,
      northwindTerms
    );

    // 1. Terminology check flags "customers" and suggests "account holders"
    const termIssue = issues.find((iss) => iss.evidence_refs.includes('NT-01'));
    expect(termIssue).toBeDefined();
    expect(termIssue?.excerpt.toLowerCase()).toBe('customers');
    expect(termIssue?.suggestion?.suggested_text).toBe('account holders');

    // 2. Tone check flags repeated exclamation marks "!!!"
    const toneIssue = issues.find((iss) => iss.category === 'tone_voice');
    expect(toneIssue).toBeDefined();
    expect(toneIssue?.excerpt).toContain('!');

    // 3. Proves zero hardcoded Lumora strings or Fitness rules are invoked
    const lumoraMentions = issues.filter((iss) =>
      iss.explanation.toLowerCase().includes('lumora')
    );
    expect(lumoraMentions.length).toBe(0);
  });
});
