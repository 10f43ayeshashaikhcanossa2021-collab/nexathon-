/**
 * INKLOOM AI - Master Automated Visual Brand Checking Engine (server/vision/index.ts)
 * Orchestrates multi-stage image verification, generates traceable pixel-grounded findings,
 * records performance timings per stage, and produces a complete VisualCheckReport.
 */

import { validateImageBuffer } from './validate';
import { decodeAndNormalizeImage, DecodedImage } from './decode';
import { extractPixelClusters, auditColorsAgainstPalette } from './colour';
import { auditLogosInImage, detectCandidatesInImage } from './logo';
import { auditLayoutAndVisibility } from './layout';
import { runGeminiVisionReview } from './gemini';
import { fuseFindings } from './fuse';
import {
  BrandProfile,
  BrandGuideline,
  BrandAsset,
  MediaItem,
  VisualCheckReport,
} from '../../src/types/inkloom';

export interface VisualCheckInput {
  imageBuffer: Buffer;
  imageName: string;
  versionId: string;
  submissionId: string;
  profile: BrandProfile;
  guidelines: BrandGuideline[];
  assets: BrandAsset[];
  mediaItem?: MediaItem | null;
  onProgress?: (stage: string, pct: number) => void;
}

export const ENGINE_VERSION = '2.1.0-cv-pixel';

export async function analyseImage(input: VisualCheckInput): Promise<VisualCheckReport> {
  const timings: Record<string, number> = {};
  const tTotalStart = Date.now();

  // -------------------------------------------------------------
  // STAGE 1: VALIDATION & DECODE
  // -------------------------------------------------------------
  input.onProgress?.('validate_and_decode', 15);
  const t1 = Date.now();

  const validation = await validateImageBuffer(input.imageBuffer);
  if (!validation.valid) {
    throw {
      statusCode: validation.statusCode || 422,
      error: validation.error || 'validation_failed',
      message: validation.message || 'Image validation failed.',
    };
  }

  const decoded = await decodeAndNormalizeImage(input.imageBuffer);
  timings.validate_and_decode_ms = Date.now() - t1;

  // -------------------------------------------------------------
  // STAGE 2: REFERENCE PREPARATION
  // -------------------------------------------------------------
  input.onProgress?.('prepare_references', 30);
  const t2 = Date.now();
  const palette = input.profile.palette || ['#0B1B3A', '#139A93', '#F4F6F9', '#FFFFFF', '#E65100'];
  timings.prepare_references_ms = Date.now() - t2;

  // -------------------------------------------------------------
  // STAGE 3: COLOR COMPLIANCE & PIXEL QUANTIZATION
  // -------------------------------------------------------------
  input.onProgress?.('color_analysis', 50);
  const t3 = Date.now();
  const clusters = extractPixelClusters(decoded);
  const colorAudit = auditColorsAgainstPalette(clusters, palette, input.imageName);
  timings.color_analysis_ms = Date.now() - t3;

  // -------------------------------------------------------------
  // STAGE 4: LOGO DETECTION & DISTORTION AUDITING
  // -------------------------------------------------------------
  input.onProgress?.('logo_analysis', 70);
  const t4 = Date.now();
  const logoAudit = await auditLogosInImage(
    decoded,
    input.assets,
    input.guidelines,
    input.imageName
  );
  timings.logo_analysis_ms = Date.now() - t4;

  // -------------------------------------------------------------
  // STAGE 5: LAYOUT, VISIBILITY & SPACING AUDITING
  // -------------------------------------------------------------
  input.onProgress?.('layout_analysis', 85);
  const t5 = Date.now();
  const layoutIssues = auditLayoutAndVisibility(
    decoded,
    logoAudit.candidates,
    input.guidelines,
    input.mediaItem || null,
    input.imageName
  );
  timings.layout_analysis_ms = Date.now() - t5;

  // -------------------------------------------------------------
  // STAGE 6: OPTIONAL GEMINI VISION SECOND OPINION
  // -------------------------------------------------------------
  input.onProgress?.('ai_second_opinion', 92);
  const t6 = Date.now();
  const geminiResult = await runGeminiVisionReview({
    imageBuffer: input.imageBuffer,
    mimeType: validation.format === 'png' ? 'image/png' : validation.format === 'webp' ? 'image/webp' : 'image/jpeg',
    imageName: input.imageName,
    profile: input.profile,
    guidelines: input.guidelines,
    assets: input.assets,
    extractedColors: colorAudit.extractedColors,
  });
  timings.ai_review_ms = Date.now() - t6;

  // -------------------------------------------------------------
  // STAGE 7: FUSE FINDINGS & ASSEMBLE TRACEABLE REPORT
  // -------------------------------------------------------------
  input.onProgress?.('fuse_and_score', 98);
  const t7 = Date.now();
  const deterministicIssues = [
    ...logoAudit.logoIssues,
    ...colorAudit.colorIssues,
    ...layoutIssues,
  ];

  const fusion = fuseFindings(deterministicIssues, geminiResult.aiIssues);
  timings.fuse_ms = Date.now() - t7;
  timings.total_ms = Date.now() - tTotalStart;

  input.onProgress?.('completed', 100);

  const reportId = `rep-vis-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  // Attach reportId to each issue
  const finalizedIssues = fusion.issues.map((iss) => ({
    ...iss,
    report_id: reportId,
  }));

  const report: VisualCheckReport = {
    check_id: reportId,
    version_id: input.versionId,
    submission_id: input.submissionId,
    created_at: new Date().toISOString(),
    status: 'completed',
    overall_compliance: fusion.overallCompliance,
    summary: fusion.summary,
    extracted_colors: colorAudit.extractedColors,
    detected_logos: logoAudit.detectedLogos,
    issues: finalizedIssues,
    provider: geminiResult.aiAvailable ? 'gemini_vision' : 'cv_heuristic_engine',
    model: geminiResult.modelUsed !== 'none' ? geminiResult.modelUsed : undefined,
    engine_version: ENGINE_VERSION,
    engine_notes: geminiResult.notes || 'Pixel-grounded computer vision verification completed.',
    timings,
    image_sha256: decoded.sha256,
    width: decoded.origWidth,
    height: decoded.origHeight,
  };

  return report;
}
