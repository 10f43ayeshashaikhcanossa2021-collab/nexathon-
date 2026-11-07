/**
 * INKLOOM AI - Benchmark Evaluation Runner (eval-runner.ts)
 * Run via: npm run eval
 * Executes TS-01 through TS-08 against the reference-grounded pipeline and outputs a clean table.
 */

import { LABELLED_TEST_SET, store } from './src/services/store.ts';
import { runAnalysisPipeline } from './src/services/aiPipeline.ts';

async function runEval() {
  console.log('\n======================================================');
  console.log('       INKLOOM AI - BENCHMARK EVALUATION RUNNER       ');
  console.log('======================================================\n');

  const profile = store.profiles[0];
  const guidelines = store.guidelines.filter((g) => g.is_active);
  const facts = store.facts.filter((f) => f.is_active);
  const terms = store.terms;

  let passedTotal = 0;

  for (const tc of LABELLED_TEST_SET) {
    const output = await runAnalysisPipeline({
      draft: tc.draft_text,
      contentType: 'email',
      profile,
      guidelines,
      facts,
      terms,
      media: tc.media,
      forceHeuristic: true,
    });

    const actual = output.report.issues.map((i) => ({
      category: i.category,
      severity: i.severity,
      evidence_code: i.evidence_refs[0],
      status: i.status,
      excerpt: i.excerpt,
    }));

    const passed =
      tc.expected_findings.length === 0
        ? actual.length === 0
        : tc.expected_findings.every((exp) =>
            actual.some(
              (act) => act.category === exp.category && act.evidence_code === exp.evidence_code
            )
          );

    if (passed) passedTotal++;

    console.log(`[${tc.id}] ${passed ? '✓ PASS' : '✗ FAIL'}`);
    console.log(`Draft: "${tc.draft_text}"`);
    console.log(`Expected findings: ${tc.expected_findings.length} | Actual: ${actual.length}`);
    if (actual.length > 0) {
      console.log('Findings:');
      actual.forEach((a) => {
        console.log(`  - [${a.severity.toUpperCase()}] ${a.category} (${a.evidence_code}): "${a.excerpt}"`);
      });
    }
    console.log('------------------------------------------------------\n');
  }

  const accuracy = Math.round((passedTotal / LABELLED_TEST_SET.length) * 100);
  console.log(`Summary: ${passedTotal} of ${LABELLED_TEST_SET.length} tests passed (${accuracy}% accuracy)`);
  console.log('Benchmark verification complete.\n');
}

runEval()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
