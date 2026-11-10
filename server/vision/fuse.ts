/**
 * INKLOOM AI - Finding Fusion & Deduplication Engine (server/vision/fuse.ts)
 * Merges pixel-grounded deterministic results with validated AI second opinions,
 * computes overall compliance status, and ensures zero duplication.
 */

import { VisualBrandIssue, DetectedRegion } from '../../src/types/inkloom';

/**
 * Calculates 2D bounding box Intersection over Union (0 to 1).
 */
export function computeBoxIoU(b1?: DetectedRegion, b2?: DetectedRegion): number {
  if (!b1 || !b2) return 0;

  const xA = Math.max(b1.x, b2.x);
  const yA = Math.max(b1.y, b2.y);
  const xB = Math.min(b1.x + b1.width, b2.x + b2.width);
  const yB = Math.min(b1.y + b1.height, b2.y + b2.height);

  const interW = Math.max(0, xB - xA);
  const interH = Math.max(0, yB - yA);
  const interArea = interW * interH;

  const area1 = b1.width * b1.height;
  const area2 = b2.width * b2.height;
  const unionArea = area1 + area2 - interArea;

  return unionArea === 0 ? 0 : interArea / unionArea;
}

export interface FusionResult {
  issues: VisualBrandIssue[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
    resolved: number;
  };
  overallCompliance: 'compliant' | 'concerns_detected' | 'action_required';
}

export function fuseFindings(
  deterministicIssues: VisualBrandIssue[],
  aiIssues: VisualBrandIssue[]
): FusionResult {
  const fused: VisualBrandIssue[] = [];

  // 1. Process deterministic issues as authoritative
  for (const det of deterministicIssues) {
    const copy = { ...det };
    copy.source = 'deterministic';
    copy.classification =
      copy.severity === 'low' || copy.title.toLowerCase().includes('variance')
        ? 'possible_concern'
        : 'violation';

    // Check for corroborating AI finding
    const matchAi = aiIssues.find(
      (ai) => ai.category === det.category && computeBoxIoU(det.region, ai.region) >= 0.35
    );

    if (matchAi) {
      copy.source = 'fused';
      copy.confidence = Math.min(99, copy.confidence + 5);
      copy.confidence_basis = {
        ...copy.confidence_basis,
        corroborated_by_ai: true,
      };
    }

    fused.push(copy);
  }

  // 2. Add non-duplicate AI findings
  for (const ai of aiIssues) {
    const alreadyCovered = fused.some(
      (f) => f.category === ai.category && computeBoxIoU(f.region, ai.region) >= 0.35
    );

    if (!alreadyCovered) {
      fused.push({
        ...ai,
        source: 'ai',
        classification: ai.severity === 'low' ? 'possible_concern' : 'violation',
      });
    }
  }

  // Compute summary counters
  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;

  for (const issue of fused) {
    if (issue.severity === 'critical') critical++;
    else if (issue.severity === 'high') high++;
    else if (issue.severity === 'medium') medium++;
    else if (issue.severity === 'low') low++;
  }

  let overallCompliance: FusionResult['overallCompliance'] = 'compliant';
  if (critical > 0 || high > 0) {
    overallCompliance = 'action_required';
  } else if (medium > 0 || low > 0) {
    overallCompliance = 'concerns_detected';
  }

  return {
    issues: fused,
    summary: {
      critical,
      high,
      medium,
      low,
      total: fused.length,
      resolved: 0,
    },
    overallCompliance,
  };
}
