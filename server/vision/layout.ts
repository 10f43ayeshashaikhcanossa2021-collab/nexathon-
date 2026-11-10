/**
 * INKLOOM AI - Layout, Clear Space & Visibility Engine (server/vision/layout.ts)
 * Evaluates clear space margins (>= 25% logo height), relative logo size (>= 4% canvas height),
 * WCAG foreground-to-background contrast ratios (>= 3:1), and accessibility metadata.
 */

import { DecodedImage } from './decode';
import { DetectedCandidate } from './logo';
import { srgbToLinear } from './colour';
import {
  VisualBrandIssue,
  BrandGuideline,
  MediaItem,
} from '../../src/types/inkloom';

/**
 * Calculates WCAG relative luminance from sRGB values.
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

/**
 * Calculates WCAG contrast ratio between two RGB colors.
 */
export function getWcagContrastRatio(
  rgb1: [number, number, number],
  rgb2: [number, number, number]
): number {
  const lum1 = getRelativeLuminance(rgb1[0], rgb1[1], rgb1[2]);
  const lum2 = getRelativeLuminance(rgb2[0], rgb2[1], rgb2[2]);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function auditLayoutAndVisibility(
  decoded: DecodedImage,
  candidates: DetectedCandidate[],
  guidelines: BrandGuideline[],
  mediaItem: MediaItem | null,
  imageName: string
): VisualBrandIssue[] {
  const issues: VisualBrandIssue[] = [];
  const { width, height, rawBuffer } = decoded;

  // Background reference at corner
  const bgRgb: [number, number, number] = [rawBuffer[0], rawBuffer[1], rawBuffer[2]];

  for (const cand of candidates) {
    const { bbox, region } = cand;

    // 1. Clear Space Check (Guideline G-16: Minimum 25% clear space on all sides)
    const minClearSpacePx = Math.round(bbox.height * 0.25);
    const leftMargin = bbox.x;
    const topMargin = bbox.y;
    const rightMargin = width - (bbox.x + bbox.width);
    const bottomMargin = height - (bbox.y + bbox.height);

    const minMargin = Math.min(leftMargin, topMargin, rightMargin, bottomMargin);

    if (minMargin < minClearSpacePx && minMargin < 20) {
      issues.push({
        issue_id: `vis-layout-clearspace-${Math.random().toString(36).substring(2, 9)}`,
        image_name: imageName,
        title: `Insufficient Logo Clear Space`,
        category: 'layout_spacing',
        severity: 'medium',
        confidence: 88,
        confidence_basis: {
          min_margin_px: minMargin,
          required_clear_space_px: minClearSpacePx,
          formula: 'min(margins) < 0.25 * logo_height',
        },
        description: `Logo is placed too close to canvas edges (${minMargin}px margin vs ${minClearSpacePx}px required clear space).`,
        expected_rule: `Guideline G-16 mandates minimum 25% clear space padding on all sides around brand marks.`,
        detected_result: `Detected margin of only ${minMargin}px (${Math.round((minMargin / bbox.height) * 100)}% of height).`,
        recommendation: `Add breathing room around the logo to preserve visual authority and avoid edge crowding.`,
        region,
        review_status: 'unreviewed',
      });
    }

    // 2. Relative Size Check (Logo height must be >= 4% of canvas height for legibility)
    const relativeHeightPct = (bbox.height / height) * 100;
    if (relativeHeightPct < 4.0) {
      issues.push({
        issue_id: `vis-layout-size-${Math.random().toString(36).substring(2, 9)}`,
        image_name: imageName,
        title: `Poor Logo Visibility (Undersized)`,
        category: 'visual_consistency',
        severity: 'medium',
        confidence: 85,
        confidence_basis: {
          relative_height_pct: Math.round(relativeHeightPct * 10) / 10,
          min_threshold_pct: 4.0,
          formula: 'logo_height / canvas_height < 0.04',
        },
        description: `Logo is rendered at only ${relativeHeightPct.toFixed(1)}% of canvas height, impairing brand recognition on mobile viewports.`,
        expected_rule: `Brand marks must maintain at least 4% relative canvas height for clear legibility.`,
        detected_result: `Detected relative logo height of ${relativeHeightPct.toFixed(1)}%.`,
        recommendation: `Scale logo up so it is legible on standard display resolutions.`,
        region,
        review_status: 'unreviewed',
      });
    }

    // 3. Contrast Check (WCAG contrast ratio >= 3:1 for graphical objects)
    const contrastRatio = getWcagContrastRatio(cand.meanForegroundRgb, bgRgb);
    const roundedContrast = Math.round(contrastRatio * 10) / 10;

    if (roundedContrast < 3.0) {
      issues.push({
        issue_id: `vis-layout-contrast-${Math.random().toString(36).substring(2, 9)}`,
        image_name: imageName,
        title: `Low Logo Contrast / Visibility (${roundedContrast}:1)`,
        category: 'visual_consistency',
        severity: 'high',
        confidence: 91,
        confidence_basis: {
          contrast_ratio: roundedContrast,
          foreground_rgb: cand.meanForegroundRgb,
          background_rgb: bgRgb,
          wcag_threshold: 3.0,
          formula: 'WCAG 2.1 relative luminance ratio < 3.0',
        },
        description: `Contrast between logo mark (${cand.foregroundHex}) and background is only ${roundedContrast}:1, failing WCAG AA graphical object requirements.`,
        expected_rule: `Logos must achieve at least 3.0:1 contrast against their surrounding canvas.`,
        detected_result: `Detected contrast ratio ${roundedContrast}:1.`,
        recommendation: `Switch to certified reversed white mark (#FFFFFF) or add a high-contrast backing container.`,
        region,
        review_status: 'unreviewed',
      });
    }
  }

  // 4. Accessibility Guideline Deviation (Guideline G-10: Alt Text Requirement)
  const g10 = guidelines.find((g) => g.code === 'G-10' || g.title.toLowerCase().includes('alt text'));
  if (g10 && (!mediaItem?.alt_text || mediaItem.alt_text.trim() === '')) {
    issues.push({
      issue_id: `vis-a11y-alt-${Math.random().toString(36).substring(2, 9)}`,
      image_name: imageName,
      title: `Missing Mandatory Image Alt Text (G-10)`,
      category: 'guideline_deviation',
      severity: 'medium',
      confidence: 100,
      confidence_basis: {
        guideline_code: 'G-10',
        alt_text_value: mediaItem?.alt_text || null,
        formula: 'alt_text == null || alt_text.trim() === ""',
      },
      description: `Creative image is missing descriptive alt text required by accessibility policy G-10 for screen readers and search engines.`,
      expected_rule: g10.rule_text,
      detected_result: `Image contains no alt text metadata.`,
      recommendation: `Add concise descriptive alt text explaining key visual elements and brand message.`,
      review_status: 'unreviewed',
    });
  }

  return issues;
}
